import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/fetchAuth';
import { useAuth } from '../context/authContext';
import { User } from '../types/User';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

const Users = () => {
  const {accessToken, setAccessToken, logout} = useAuth();
  const navigate = useNavigate();
  const {data, isLoading, error}: UseQueryResult<User[]> = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      let response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if(response.status === 401) {
        const refreshRes = await authApi.refresh();

        if(!refreshRes.accessToken) {
          logout();
          navigate('/login');
          throw new Error('Not authenticated');
        }

        setAccessToken(refreshRes.accessToken)

        response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${refreshRes.accessToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch after refresh');
        }
      }

      return response.json();
    },
  });

  return (
    <main className='main'>
      <div className="container">
        <h1 className="title">Users</h1>
        {isLoading
        ? <div>Loding...</div>
        : !data && error
          ? <div>{error.message}</div>
          : <ul>
              {data?.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
        }
      </div>
    </main>
  )
}

export default Users
