import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useExchangeCodeMutation } from "./../../slices/oauthSlice";
import { setToken } from "./../../slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const dispatch = useDispatch();
  const [exchangeCode] = useExchangeCodeMutation();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const storedState = localStorage.getItem("oauth_state");

      if (!code) { alert("Missing authorization code"); return; }
      if (state !== storedState) { alert("Invalid state"); return; }

      const verifier = localStorage.getItem("pkce_verifier");
      if (!verifier) { alert("Missing code verifier"); return; }

      try {
        const res = await exchangeCode({
          client_id: "abc123",
          code,
          redirect_uri: "http://localhost:5173/callback",
          code_verifier: verifier,
          grant_type: "authorization_code",
        }).unwrap();

        dispatch(setToken(res));

        // Persist tokens to localStorage so Redux can rehydrate
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("refresh_token", res.refresh_token);
        localStorage.setItem("id_token", res.id_token);

        // Cleanup PKCE
        localStorage.removeItem("pkce_verifier");
        localStorage.removeItem("oauth_state");

        navigate("/home");
      } catch (err) {
        console.error("Token exchange failed:", err);
        alert(err?.data?.message || "Login failed");
      }
    };

    run();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}