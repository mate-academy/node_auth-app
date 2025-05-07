import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext';

const PrivateRoute = ({ children}: {children : React.ReactNode}) => {
  const {isLoading, accessToken} = useAuth()

  if(isLoading) {
    return <div>Loading...</div>
  }

  return accessToken ? children : <Navigate to='/login'/>
}

export default PrivateRoute;
