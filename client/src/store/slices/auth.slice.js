import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // { uid, email, displayName, photoURL }
    token: null,
    isAuthenticated: false,
    loading: true,
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
    },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
