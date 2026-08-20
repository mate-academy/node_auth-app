import React, { useContext } from 'react';
import type { User } from '../types/User';

interface State {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface DispatchContextValue {
  dispatch: React.Dispatch<Action>;
  login: (credentials: Record<string, unknown>) => Promise<unknown>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

type Action =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'USER_UPDATE'; payload: Partial<User> };

const DispatchContext = React.createContext<DispatchContextValue | null>(null);
const StateContext = React.createContext<State | null>(null);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'AUTH_START': {
      return { ...state, isLoading: true, error: null };
    }
    case 'AUTH_SUCCESS': {
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
    case 'AUTH_FAILURE': {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    }
    case 'LOGOUT': {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
    case 'USER_UPDATE': {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...action.payload } as User;
      return {
        ...state,
        user: updatedUser,
      };
    }
    default:
      return state;
  }
};

const useAuthState = (): State => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

const useAuthDispatch = (): DispatchContextValue => {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
};

export {
  initialState,
  reducer,
  DispatchContext,
  StateContext,
  useAuthDispatch,
  useAuthState,
};
