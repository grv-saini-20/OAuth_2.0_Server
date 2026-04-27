import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logout } from "./../../../slices/authSlice";

export default function Navbar({ user }) {
const dispatch = useDispatch();

return ( 
    <div className="flex items-center justify-between p-4 border-b"> 
    <h1 className="text-lg font-semibold">OAuth Client</h1>
    {user && (
        <div className="flex items-center gap-3">
        <span className="text-sm">{user.email}</span>
        <Button variant="destructive" onClick={() => dispatch(logout())}>
            Logout
        </Button>
        </div>
    )}
    </div>
    );
}
