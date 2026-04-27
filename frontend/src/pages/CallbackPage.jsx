import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useExchangeCodeMutation } from "./../../slices/oauthSlice";
import { setToken } from "./../../slices/authSlice";

export default function Callback() {
const dispatch = useDispatch();
const [exchangeCode] = useExchangeCodeMutation();

useEffect(() => {
const run = async () => {
const url = new URL(window.location.href);
const code = url.searchParams.get("code");
const state = url.searchParams.get("state");
const storedState = localStorage.getItem("oauth_state");

  if (state !== storedState) {
    alert("Invalid state");
    return;
  }

  const verifier = localStorage.getItem("pkce_verifier");

  const res = await exchangeCode({
    client_id: "abc123",
    code,
    redirect_uri: "http://localhost:5173/callback",
    code_verifier: verifier,
  }).unwrap();

  dispatch(setToken(res));

  window.location.href = "/";
};

run();

}, []);

return (
    <div className="flex items-center justify-center h-screen"> 
    <p className="text-muted-foreground">Signing you in...</p> 
    </div>
    );
}
