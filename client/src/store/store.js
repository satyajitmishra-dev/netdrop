import { configureStore } from '@reduxjs/toolkit';
import transferReducer from './slices/transfer.slice';
import authReducer from './slices/auth.slice';

export const store = configureStore({
    reducer: {
        transfer: transferReducer,
        auth: authReducer,
    },
});
