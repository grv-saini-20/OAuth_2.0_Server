import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
token: String,
userId: String,
clientId: String,
expiresAt: Date,
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
