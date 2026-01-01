import { createRoot } from 'react-dom/client'
import './index.css'
import { Root } from './Root'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <UserProvider>
      <Root />
    </UserProvider>
  </AuthProvider>
)
