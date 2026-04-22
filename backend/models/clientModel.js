import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
    },
    clientSecret: String, //For confidential clients (later),
    redirectUris: [String], //Where to redirect after authorization
    name: String
})

const Client = mongoose.model("Client", clientSchema);

export default Client;