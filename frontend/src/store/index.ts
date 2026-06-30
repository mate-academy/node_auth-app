import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { setupInterceptors } from '../services/api.client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

setupInterceptors(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
