import { apiSlice } from "./apiSlice";

const oauthApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        exchangeCodes: builder.mutation({
            query: (data) => ({
                url: "/oauth/token",
                method: "POST",
                body: data
            })
        }),
        getUserInfo: builder.query({
            query: () => ({
                url: "/oauth/userInfo",
                providesTags: ["User"]
            })
        }),
        refreshToken: builder.mutation({
            query: (data) => ({
                url: "/oauth/token",
                method: "POST",
                body: data
            })
        }),
    })
})

export const {
useExchangeCodeMutation,
useGetUserInfoQuery,
useRefreshTokenMutation,
} = oauthApiSlice;