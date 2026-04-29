import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Client from "../models/clientModel.js";
import AuthCode from "../models/authCodeModel.js";
import jwt from "jsonwebtoken";
import { privateKey, publicKey } from "../config/keys.js";
import { exportJWK } from "jose";
import RefreshToken from "../models/refreshTokenModel.js";


const authorize = asyncHandler(async (req, res) => {
  const query = Object.keys(req.query).length
    ? req.query
    : req.session.oauthRequest;

  if (!query) {
    res.status(400);
    throw new Error("Missing OAuth request");
  }

  const {
    client_id,
    redirect_uri,
    response_type,
    state,
    code_challenge,
    code_challenge_method,
    nonce,
  } = query;

  // validate PKCE Params
  if (!code_challenge || code_challenge_method !== "S256") {
    res.status(400);
    throw new Error("PKCE required");
  }

  // validate required params
  if (!client_id || !redirect_uri || response_type !== "code") {
    res.status(400);
    throw new Error("Invalid request");
  }

  // validate state
  if (!state) {
    res.status(400);
    throw new Error("Missing state");
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

  const user = req.session.user;

  if (!user) {
    if (!req.session.oauthRequest) {
      req.session.oauthRequest = req.query;
      req.session.oauthState = state;
    }
    const loginUrl = `http://localhost:5174/login?${new URLSearchParams(req.query).toString()}`;
    return req.session.save(() => res.redirect(loginUrl));
  }

  //strict CSRF check — only use session state, never trust query state
  if (!req.session.oauthState || req.session.oauthState !== state) {
    res.status(400);
    throw new Error("Invalid state (CSRF detected)");
  }

  // cleanup
  delete req.session.oauthState;
  delete req.session.oauthRequest;

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
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  res.redirect(`${redirect_uri}?code=${authCode}&state=${state}`);
});


const token = asyncHandler(async (req, res) => {
  const { client_id, code, redirect_uri, code_verifier, grant_type } = req.body;

  // validate required params
  if (!client_id || !code || !redirect_uri) {
    res.status(400);
    throw new Error("Invalid request");
  }

  if (!code_verifier) {
    res.status(400);
    throw new Error("Missing code verifier");
  }

  // validate grant_type before DB lookups
  if (grant_type !== "authorization_code") {
    res.status(400);
    throw new Error("Invalid grant type");
  }

  const client = await Client.findOne({ clientId: client_id });
  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  const authCode = await AuthCode.findOne({ code });
  if (!authCode) {
    res.status(404);
    throw new Error("Auth code not found");
  }

  // validate code ownership
  if (authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri) {
    res.status(400);
    throw new Error("Invalid code details");
  }

  // check expiry
  if (authCode.expiresAt < new Date()) {
    await AuthCode.deleteOne({ code }); //delete expired code immediately
    res.status(400);
    throw new Error("Auth code expired");
  }

  // verify PKCE
  const hashed = crypto.createHash("sha256").update(code_verifier).digest("base64url");
  if (hashed !== authCode.codeChallenge) {
    res.status(400);
    throw new Error("Invalid code verifier");
  }

  //delete auth code BEFORE generating tokens (prevent replay attacks)
  await AuthCode.deleteOne({ code });

  const accessToken = jwt.sign(
    { userId: authCode.userId.toString(), clientId: client_id },
    privateKey,
    { algorithm: "RS256", expiresIn: "15m", keyid: "my_key_id" }
  );

  const idToken = jwt.sign(
    {
      sub: authCode.userId.toString(),
      clientId: client_id,
      iss: "http://localhost:5000",
      aud: client_id,              
      nonce: authCode.nonce,
    },
    privateKey,
    { algorithm: "RS256", expiresIn: "15m", keyid: "my_key_id" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
    token: refreshToken,
    userId: authCode.userId,
    clientId: client_id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.json({
    access_token: accessToken,
    id_token: idToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: 900,
  });
});


const userInfo = asyncHandler(async (req, res) => {
  const user = req.user; // set by auth middleware

  res.json({
    sub: user.id,
    email: user.email,
    name: user.name || "No name",
  });
});


const jwks = asyncHandler(async (req, res) => {
  const key = await exportJWK(publicKey);

  key.kid = "my_key_id";
  key.alg = "RS256";
  key.use = "sig";

  res.json({ keys: [key] });
});


const refresh = asyncHandler(async (req, res) => {
  const { refresh_token, client_id } = req.body;

  if (!refresh_token || !client_id) {
    res.status(400);
    throw new Error("Invalid request");
  }

  const stored = await RefreshToken.findOne({ token: refresh_token, clientId: client_id });
  if (!stored) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ token: refresh_token });
    res.status(401);
    throw new Error("Refresh token expired");
  }

  // rotation — delete old, create new
  await RefreshToken.deleteOne({ token: refresh_token });

  const newRefreshToken = crypto.randomBytes(40).toString("hex");

  await RefreshToken.create({
    token: newRefreshToken,
    userId: stored.userId,
    clientId: client_id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = jwt.sign(
    { userId: stored.userId.toString(), clientId: client_id },
    privateKey,
    { algorithm: "RS256", expiresIn: "15m", keyid: "my_key_id" }
  );

  res.json({
    access_token: accessToken,
    refresh_token: newRefreshToken,
    token_type: "Bearer",
    expires_in: 900,
  });
});


export { authorize, token, userInfo, jwks, refresh };