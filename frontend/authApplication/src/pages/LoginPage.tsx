import React, { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/auth'
import type { LoginCredentials } from '../types/auth'
import '../styles/LoginPage.css'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/profile')
    }
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    await authService.login(credentials)
    navigate('/profile')
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any
    if (error.response && error.response.data && error.response.data.message) {
      setError(error.response.data.message)
    } else {
      setError(error.message || 'Erro desconhecido')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="login-input"
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password" className="login-label">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="login-input"
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-link-container">
          <Link to="/register" className="login-link">Criar conta</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
