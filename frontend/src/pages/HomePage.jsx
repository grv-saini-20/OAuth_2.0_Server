import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetUserInfoQuery } from "./../../slices/oauthSlice";
import Navbar from "@/components/project/Navbar";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const { accessToken, scope } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetUserInfoQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (!accessToken) navigate("/login");
  }, [accessToken]);

  if (isLoading) return <p className="p-4">Loading...</p>;

  const canReadProfile = scope?.includes("profile");
  const canReadEmail = scope?.includes("email");

  return (
    <div>
      <Navbar user={data} />
      <div className="p-6">
        <Card>
          <CardContent className="p-6 space-y-2">
            <h2 className="text-xl font-semibold">Welcome 🎉</h2>

            {canReadEmail && (
              <p className="text-muted-foreground">
                Email: {data?.email}
              </p>
            )}

            {canReadProfile && (
              <p className="text-muted-foreground">
                Name: {data?.name}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Granted scopes: {scope}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}