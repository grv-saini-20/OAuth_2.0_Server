import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: localStorage.getItem("access_token") || null,
    scope: localStorage.getItem("scope") || null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.accessToken = action.payload.access_token;
            state.scope = action.payload.scope;
            localStorage.setItem("access_token", action.payload.access_token);
            localStorage.setItem("scope", action.payload.scope);
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null,
            state.accessToken = null
            state.scope = null;
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("id_token");
            localStorage.removeItem("scope");
        }
    }
})

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;