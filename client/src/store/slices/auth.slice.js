import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // { uid, email, displayName, photoURL }
    token: null,
    isAuthenticated: false,
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = !!action.payload.user;
            state.loading = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
        }
    },
});

export const { setUser, clearUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
