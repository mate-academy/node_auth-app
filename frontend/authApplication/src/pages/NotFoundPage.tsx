import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/NotFoundPage.css'

const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Página não encontrada</h2>
        <p className="notfound-text">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-button">Ir para Home</Link>
          <Link to="/login" className="notfound-button-secondary">Fazer Login</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
