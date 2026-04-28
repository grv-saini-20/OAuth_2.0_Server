import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Register() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleRegister = async () => {
const res = await fetch("http://localhost:5000/api/auth/register", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ name, email, password }),
});

if (!res.ok) {
  alert("Register failed");
  return;
}

window.location.href = "/login";

};

return ( 
<div className="flex items-center justify-center h-screen"> 
    <Card className="w-[400px]"> 
    <CardHeader> 
        <CardTitle>Register</CardTitle> 
    </CardHeader>
    <CardContent className="space-y-4">
      <Input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <Input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button className="w-full" onClick={handleRegister}>
        Create Account
      </Button>
    </CardContent>
  </Card>
</div>
);
}
