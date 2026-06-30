import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmation?: string;
  newEmail?: string;
  password?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuth: boolean;
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AxiosErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const registerUser = createAsyncThunk<AuthResponse, RegisterCredentials, { rejectValue: string }>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.register(credentials.name, credentials.email, credentials.password);
    } catch (err: unknown) {
      const error = err as AxiosErrorResponse;
      return rejectWithValue(error.response?.data?.error || 'Помилка реєстрації');
    }
  }
);

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials.email, credentials.password);
    } catch (err: unknown) {
      const error = err as AxiosErrorResponse;
      return rejectWithValue(error.response?.data?.error || 'Помилка входу');
    }
  }
);

export const updateProfile = createAsyncThunk<UpdateProfileData, UpdateProfileData, { rejectValue: string }>(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      await authService.updateProfile(profileData);
      return profileData;
    } catch (err: unknown) {
      const error = err as AxiosErrorResponse;
      return rejectWithValue(error.response?.data?.error || 'Помилка оновлення');
    }
  }
);

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuth: false,
  isLoginOpen: false,
  isRegisterOpen: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginOpen = true;
      state.isRegisterOpen = false;
      state.error = null;
    },
    closeLoginModal: (state) => {
      state.isLoginOpen = false;
    },
    openRegisterModal: (state) => {
      state.isRegisterOpen = true;
      state.isLoginOpen = false;
      state.error = null;
    },
    closeRegisterModal: (state) => {
      state.isRegisterOpen = false;
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuth = true;
    },
    logoutLocal: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuth = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuth = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isLoginOpen = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? String(action.payload) : 'Помилка входу';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isRegisterOpen = false;
        state.isLoginOpen = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? String(action.payload) : 'Помилка реєстрації';
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<UpdateProfileData>) => {
        state.isLoading = false;
        if (action.payload.name && state.user) {
          state.user.name = action.payload.name;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? String(action.payload) : 'Помилка оновлення';
      });
  },
});

export const {
  openLoginModal,
  closeLoginModal,
  openRegisterModal,
  closeRegisterModal,
  setCredentials,
  logoutLocal
} = authSlice.actions;

export default authSlice.reducer;
