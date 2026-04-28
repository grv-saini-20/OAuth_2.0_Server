import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = async () => {
const params = new URLSearchParams(window.location.search);

const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", 
  body: JSON.stringify({
    email,
    password,
  }),
});

if (res.redirected) {
  window.location.href = res.url;
}

if (!res.ok) {
  alert("Login failed");
  return;
}

}

return ( 
    <div className="flex items-center justify-center h-screen"> 
    <Card className="w-[400px]">
        <form
        action="http://localhost:5000/api/auth/login"
        method="POST"
        >
        <Input name="email" placeholder="Email" />

        <Input name="password" type="password" placeholder="Password" />

        <Button type="submit" className="w-full">
            Login
        </Button>
        </form>
    </Card>
    </div>
    );
}
