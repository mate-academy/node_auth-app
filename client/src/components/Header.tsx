import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/authContext'

const Header = () => {
  const {accessToken, logout} = useAuth();


  return (
    <header className='header'>
      <Link className='logo' to=".">logo</Link>
      <nav className='menu'>
        <NavLink className="link" to="users">Users</NavLink>
        <NavLink className="link" to="profile">Profile</NavLink>
      </nav>
      {accessToken
        ? <Link to="login" onClick={logout} className='button is-danger'>Log out</Link>
        : <Link to="login" className='button is-primary'>Log in</Link>
      }
    </header>
  )
}

export default Header
