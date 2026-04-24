import mongoose from "mongoose";

const authCodeSchema = new mongoose.Schema({
    code: String,
    clientId: String,
    userId: String,
    redirectUri: String,
    codeChallenge: String,  //for PKCE proof key code exchange
    codeChallengeMethod: String, //for PKCE proof key code exchange
    expiresAt: Date,
}, {timestamps: true});

const AuthCode = mongoose.model("AuthCode", authCodeSchema);

export default AuthCode;
