import React, { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/auth'
import '../styles/ResetPasswordPage.css'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/profile')
    }
  }, [navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await authService.requestPasswordReset(email)
      setMessage('Se o email existe, você receberá instruções em breve.')
      setIsError(false)
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      if (error.response?.data?.message) {
        setMessage(error.response.data.message)
      } else {
        setMessage(error.message || 'Erro desconhecido')
      }
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Recuperar Senha</h2>

        {message && (
          <div className={isError ? 'reset-error' : 'reset-success'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="reset-input-group">
            <label htmlFor="email" className="reset-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="reset-input"
              placeholder="seu@email.com"
            />
          </div>

          <button type="submit" disabled={loading} className="reset-button">
            {loading ? 'Enviando...' : 'Enviar Instruções'}
          </button>
        </form>

        <div className="reset-link-container">
          <Link to="/login" className="reset-link">Voltar para login</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
