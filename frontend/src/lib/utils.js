import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function generateRandomString(length = 64) {
const charset =
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
let result = "";
const values = crypto.getRandomValues(new Uint8Array(length));
values.forEach((v) => (result += charset[v % charset.length]));
return result;
}

export async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")   // fix
    .replace(/\//g, "_")   // fix
    .replace(/=+$/, "");
}
