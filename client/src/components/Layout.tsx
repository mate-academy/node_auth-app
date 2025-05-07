import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import { useAuth } from '../context/authContext'
import Notification from './Notification'

const Layout = () => {
  const {message} = useAuth();

  return (
    <div className='wrapper'>
      <Header/>
      <Outlet/>
      <Footer/>
      {message && (
          <Notification message={message}/>
        )}
    </div>
  )
}

export default Layout
