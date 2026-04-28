import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Client from "../models/clientModel.js";
import AuthCode from "../models/authCodeModel.js";
import jwt from "jsonwebtoken";
import { privateKey, publicKey } from "../config/keys.js";
import { exportJWK } from "jose";
import RefreshToken from "../models/refreshTokenModel.js";

const verifier = "my_super_secret_verifier_12345";

const challenge = crypto
  .createHash("sha256")
  .update(verifier)
  .digest("base64url");


const authorize = asyncHandler(async (req, res) => {
  const { client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method, nonce } = req.query;

  // validate PKCE Params
  if(!code_challenge || code_challenge_method !== "S256") {  //sha256 for code challenge method
    res.status(400);
    throw new Error("PKCE required")
  }

  // validate required params
  if (!client_id || !redirect_uri || response_type !== "code") {
    res.status(400);
    throw new Error("Invalid request");
  }

  //validate state
  if(!state) {
    res.status(400);
    throw new Error("Missing state"); //state helps to prevent CSRF attacks 
  }

  // validate nonce
  if (!nonce) {
    res.status(400);
    throw new Error("Missing nonce");
  }

  // validate client
  const client = await Client.findOne({ clientId: client_id });

  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  // validate redirect URI
  if (!client.redirectUris.includes(redirect_uri)) {
    res.status(400);
    throw new Error("Invalid redirect URI");
  }

  // check if user is logged in (temporary approach)
  // const userId = req.query.user_id;
  const user = req.session.user;

  if (!user) {
    // res.status(401);
    // throw new Error("User not authenticated");
    // Save original OAuth request
    req.session.oauthRequest = req.query;
    req.session.oauthState = state; // Save state to verify later
    const loginUrl = `/api/auth/login?${new URLSearchParams(req.query).toString()}`;
    return res.redirect(loginUrl);
  }


  // Check if state matches
  if (req.session.oauthState !== state) {
  res.status(400);
  throw new Error("Invalid state (CSRF detected)");
  }

  //cleanup state
  delete req.session.oauthState;

  // generate auth code
  const authCode = crypto.randomBytes(32).toString("hex");

  await AuthCode.create({
    code: authCode,
    clientId: client_id,
    userId: user.id,
    redirectUri: redirect_uri,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method,
    nonce,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  // redirect back with code
  let redirectUrl = `${redirect_uri}?code=${authCode}&state=${state}`;

  res.redirect(redirectUrl);
});

const token = asyncHandler(async(req, res) => {
  const {client_id, code, redirect_uri, code_verifier } = req.body;

  // validate required params
  if(!client_id || !code || !redirect_uri) {
    res.status(400);
    throw new Error("Invalid request");
  }

  //validate code_verifier
  if(!code_verifier) {
    res.status(400);
    throw new Error("Missing code verifier");
  }

  //validate client
  const client = await Client.findOne({clientId: client_id});

  if(!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  //validate auth code
  const authCode = await AuthCode.findOne({code})

  if(!authCode) {
    res.status(404);
    throw new Error("Auth code not found");
  }

  //validate code ownership
  if(authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri) {
    res.status(400);
    throw new Error("Invalid code details");
  }

  //check expiry
  if(authCode.expiresAt < new Date()) {
    res.status(400);
    throw new Error("Auth code expired");
  }

  //Generate challenge from verifier
  const hashed = crypto.createHash("sha256").update(code_verifier).digest("base64url");

  //compare
  if(hashed !== authCode.codeChallenge) {
    res.status(400);
    throw new Error("Invalid code verifier");
  }


  //generate access token
  // const accessToken = jwt.sign({userId: authCode.userId, clientId: client_id}, process.env.JWT_SECRET, {expiresIn: "15m"});
    const accessToken = jwt.sign({userId: authCode.userId, clientId: client_id}, privateKey, {alogrithm: "RSA256", expiresIn: "15m", keyid: "my_key_id"});


  //generate ID token
  // const idToken = jwt.sign({userId: authCode.userId, clientId: client_id,iss:"http://localhost:5000", nonce: authCode.nonce}, process.env.JWT_SECRET, {expiresIn: "15m"});
    const idToken = jwt.sign({userId: authCode.userId, clientId: client_id,iss:"http://localhost:5000", nonce: authCode.nonce}, privateKey, {alogrithm: "RSA256", expiresIn: "15m", keyid: "my_key_id"});

  //generate refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
    token: refreshToken,
    userId: authCode.userId,
    clientId: client_id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  //delete auth code
  await AuthCode.deleteOne({code});

  //send response
  res.json({access_Token: accessToken,id_token: idToken, refresh_Token: refreshToken, token_type: "Bearer", expires_in: 900})
})

const userInfo = asyncHandler(async(req, res) => {
  const user = req.user; // set by auth middleware

  res.json({
    userId: user.id,
    email: user.email,
    name: user.name || "No name"
  })
})

const jwks = asyncHandler(async(req, res) => {
  const key = await exportJWK(publicKey);

  key.kid = "my_key_id";
  key.alg = "RS256";
  key.use  = "sig";

  res.json({ keys: [key] });
})

const refresh = asyncHandler(async(req, res) => {
  const {refresh_token, client_id} = req.body;

  //validate params
  if(!refresh_token || !client_id) {
    res.status(400);
    throw new Error("Invalid request");
  }

  const stored = await RefreshToken.findOne({token: refresh_token, clientId: client_id});

  if (!stored) {
  res.status(401);
  throw new Error("Invalid refresh token");
  }

  if (stored.expiresAt < new Date()) {
  await RefreshToken.deleteOne({ token: refresh_token });
  res.status(401);
  throw new Error("Refresh token expired");
  }

  // rotation
  await RefreshToken.deleteOne({ token: refresh_token });

  const newRefreshToken = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
  token: newRefreshToken,
  userId: stored.userId,
  clientId: client_id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = jwt.sign(
  { userId: stored.userId, clientId: client_id },
  privateKey,
  { algorithm: "RS256", expiresIn: "15m", keyid: "my-key-id" }
  );

  res.json({
  access_token: accessToken,
  refresh_token: newRefreshToken,
  token_type: "Bearer",
  expires_in: 900,
  });
})

export {authorize, token, userInfo, jwks, refresh};