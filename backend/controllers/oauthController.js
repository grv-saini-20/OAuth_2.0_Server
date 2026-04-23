import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Client from "../models/clientModel.js";
import AuthCode from "../models/authCodeModel.js";
import jwt from "jsonwebtoken";


const authorize = asyncHandler(async (req, res) => {
  const { client_id, redirect_uri, response_type, state } = req.query;

  // validate required params
  if (!client_id || !redirect_uri || response_type !== "code") {
    res.status(400);
    throw new Error("Invalid request");
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
  const userId = req.query.user_id;

  if (!userId) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  // generate auth code
  const authCode = crypto.randomBytes(32).toString("hex");

  await AuthCode.create({
    code: authCode,
    clientId: client_id,
    userId,
    redirectUri: redirect_uri,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  // redirect back with code
  let redirectUrl = `${redirect_uri}?code=${authCode}&state=${state}`;

  res.redirect(redirectUrl);
});

const token = asyncHandler(async(req, res) => {
  console.log("BODY:", req.body);
  const {client_id, code, redirect_uri } = req.body;

  // validate required params
  if(!client_id || !code || !redirect_uri) {
    res.status(400);
    throw new Error("Invalid request");
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

  //generate access token
  const accessToken = jwt.sign({userId: authCode.userId, clientId: client_id}, process.env.JWT_SECRET, {expiresIn: "15m"});

  //delete auth code
  await AuthCode.deleteOne({code});

  //send response
  res.json({access_Token: accessToken, token_type: "Bearer", expires_in: 900})
})

export {authorize, token};