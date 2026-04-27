import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.accessToken = action.payload.access_token;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null,
            state.accessToken = null
        }
    }
})

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;