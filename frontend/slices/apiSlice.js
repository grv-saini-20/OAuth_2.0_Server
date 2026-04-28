import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({baseUrl: "http://localhost:3000/api", credentials: "include", prepareHeaders: (headers, {getState}) => {
    const token = getState().auth.token;
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
}});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    //if access token expired
    if (result.error && result.error.status === 401) {
        console.log("Access token expired");

        const refreshResult = await baseQuery({
            url: '/oauth/refresh',
            method: "POST",
            body: {
                client_id: "abc123",
                refresh_token: localStorage.getItem("refresh_token")
            }
        }, api, extraOptions)
        if(refreshResult?.data) {
            api.dispatch(setToken(refreshResult.data))
        } else {
            api.dispatch(logout())
        }
    }
    return result;
}

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    typeTags: ["Auth","User"],
    endpoints: () => ({})
})