import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: localStorage.getItem("access_token") || null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.accessToken = action.payload.access_token;
            localStorage.setItem("access_token", action.payload.access_token);
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null,
            state.accessToken = null
            localStorage.removeItem("access_token"); // ← cleanup
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("id_token");
        }
    }
})

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;