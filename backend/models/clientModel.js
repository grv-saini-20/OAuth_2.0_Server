import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
    },
    clientSecret: String, //For confidential clients (later),
    redirectUris: [String], //Where to redirect after authorization
    name: String,
    grants: { type: [String], default: ["authorization_code"] }
})

const Client = mongoose.model("Client", clientSchema);

export default Client;