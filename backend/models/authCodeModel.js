import mongoose from "mongoose";

const authCodeSchema = new mongoose.Schema({
    code: String,
    clientId: String,
    userId: String,
    redirectUri: String,
    expiresAt: Date,
}, {timestamps: true});

const AuthCode = mongoose.model("AuthCode", authCodeSchema);

export default AuthCode;