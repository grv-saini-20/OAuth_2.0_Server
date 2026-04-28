import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const oauthParams = Object.fromEntries(searchParams.entries());
  console.log(window.location.search)

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password, oauthParams }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert("Login failed");
    return;
  }

  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
  }
};

return ( 
    <div className="flex items-center justify-center h-screen"> 
        <Card className="w-[400px]"> 
            <CardHeader> 
                <CardTitle>Login</CardTitle> 
            </CardHeader>
        <CardContent className="space-y-4">
        <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="w-full" onClick={handleLogin}>
            Login
        </Button>
        </CardContent>
    </Card>
    </div>
    );
}
