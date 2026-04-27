import fs from "fs";
import crypto from "crypto";

const privatePem = fs.readFileSync("private.pem", "utf8");
const publicPem = fs.readFileSync("public.pem", "utf8");

//convert to key object
export const privateKey = crypto.createPrivateKey(privatePem);
export const publicKey = crypto.createPublicKey(publicPem);