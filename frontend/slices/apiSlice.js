import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setToken, logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("Access token expired, attempting refresh...");

    const refreshResult = await baseQuery(
      {
        url: "/oauth/refresh",
        method: "POST",
        body: {
          client_id: "abc123",
          refresh_token: localStorage.getItem("refresh_token"),
        },
      },
      api,          
      extraOptions  
    );

    if (refreshResult?.data) {
      const newToken = refreshResult.data.access_token;

      localStorage.setItem("access_token", newToken);
      localStorage.setItem("refresh_token", refreshResult.data.refresh_token);
      localStorage.setItem("scope", refreshResult.data.scope);

      api.dispatch(setToken(refreshResult.data));

      result = await baseQuery(
        {
          ...args,
          headers: {
            ...(args.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        },
        api,         
        extraOptions  
      );
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  typeTags: ["Auth", "User"],
  endpoints: () => ({}),
});