import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetUserInfoQuery } from "./../../slices/oauthSlice";
import Navbar from "@/components/project/Navbar";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetUserInfoQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken]);

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div>
      <Navbar user={data} />
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">
              Welcome {data?.email}
            </h2>
            <p className="text-muted-foreground mt-2">
              You are successfully authenticated 🎉
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}