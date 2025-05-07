import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react'
import { User } from '../types/User'
import { ActivationStatus} from '../types/Auth'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/fetchAuth'

interface AuthContextType {
  activate: (email: string, token: string) => Promise<boolean>
  logout: () => void
  activationStatus: ActivationStatus
  message: string
  user: User | null
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean,
  setUser: Dispatch<SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: {children: ReactNode}) => {
  const [activationStatus, setActivationStatus] = useState<ActivationStatus>('idle');
  const [message, setMessage] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['refresh'],
    queryFn: authApi.refresh,
    staleTime: 1000 * 60 * 10,
  });
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if(data?.user) {
      setUser(data.user)
    }
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
  }, [data]);

  const activate = async (email:string, token: string): Promise<boolean> => {
    setActivationStatus('loading')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/activate/${email}/${encodeURIComponent(token)}`);
      if (!response.ok) throw new Error('Activation failed');

      await response.json();

      setActivationStatus('success');
      localStorage.removeItem('activationToken')

      return true
    } catch (err) {
      setActivationStatus('error')
      console.log(err)
      return false
    }
  };

  const logout = () => {
    setAccessToken(null)
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{
      logout,
      activate,
      activationStatus,
      message,
      isLoading,
      user,
      setUser,
      accessToken,
      setAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => {
  const context = useContext(AuthContext);

  if(!context) {
    throw new Error('useContext must be used within an AuthProvider')
  }

  return context;
}
