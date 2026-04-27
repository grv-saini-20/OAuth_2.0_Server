import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({baseUrl: "http://localhost:3000/api", credentials: "include", prepareHeaders: (headers, {getState}) => {
    const token = getState().auth.token;
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
}});

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery,
    typeTags: ["Auth","User"],
    endpoints: () => ({})
})