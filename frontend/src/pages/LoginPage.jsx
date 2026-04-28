import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRandomString, generateCodeChallenge } from "@/lib/utils";

export default function Login() {

const handleLogin = async () => {
const verifier = generateRandomString();
const challenge = await generateCodeChallenge(verifier);

const state = crypto.randomUUID();
const nonce = crypto.randomUUID();

localStorage.setItem("pkce_verifier", verifier);
localStorage.setItem("oauth_state", state);

const params = new URLSearchParams({
  client_id: "abc123",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "code",
  scope: "openid profile email",
  state,
  nonce,
  code_challenge: challenge,
  code_challenge_method: "S256",
});

window.location.href = `http://localhost:5000/api/oauth/authorize?${params}`;
};

return ( 
<div className="flex items-center justify-center h-screen"> 
    <Card className="w-[400px]"> <CardHeader> 
        <CardTitle>Login</CardTitle> 
        </CardHeader> 
        <CardContent> 
            <Button className="w-full" onClick={handleLogin}>
                Login with Auth Server
            </Button> 
        </CardContent> 
    </Card> 
</div>
);
}
