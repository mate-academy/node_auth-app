import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { api } from '../api/api';
import type { User } from '../types/User';
import {
  DispatchContext,
  initialState,
  reducer,
  StateContext,
} from './AuthContext';

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'AUTH_START' });

      try {
        const { data } = await api.post('/auth/sessions/tokens');
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
      } catch {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: Record<string, unknown>) => {
    try {
      const { data } = await api.post('/auth/sessions', credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.delete('/auth/sessions');
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((fields: Partial<User>) => {
    dispatch({ type: 'USER_UPDATE', payload: fields });
  }, []);

  const dispatchValue = useMemo(
    () => ({ dispatch, login, logout, updateUser }),
    [login, logout, updateUser],
  );

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatchValue}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};
