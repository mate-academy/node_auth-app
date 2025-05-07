import { Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import Users from './pages/Users'
import Home from './pages/Home'
import { useAuth } from './context/authContext'
import Registration from './pages/Registration'
import ActivationPage from './pages/ActivationPage'
import Profile from './pages/Profile'
import { Suspense } from 'react'

function App() {
  return (

    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Home/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='logup' element={<Registration/>}/>
        <Route path='activate/:email/:token' element={<ActivationPage/>}/>
        <Route path='users' element={<PrivateRoute>
          <Users/>
        </PrivateRoute>}/>
        <Route path='profile' element={<PrivateRoute>
          <Profile/>
        </PrivateRoute>}/>
      </Route>
    </Routes>
  )
}

export default App
