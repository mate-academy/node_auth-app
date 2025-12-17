import React, { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../services/auth'
import type { ResetPasswordData } from '../types/auth'
import '../styles/ConfirmResetPage.css'

const ConfirmResetPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [formData, setFormData] = useState<ResetPasswordData>({
    token: '',
    password: '',
    passwordConfirm: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/profile')
    }
  }, [navigate])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (token) setFormData(prev => ({ ...prev, token }))
  }, [location])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (formData.password !== formData.passwordConfirm) {
      setMessage('As senhas não coincidem')
      setIsError(true)
      setLoading(false)
      return
    }
    
    try {
      await authService.confirmPasswordReset(formData)
      setMessage('Senha redefinida com sucesso! Redirecionando...')
      setIsError(false)
      setTimeout(() => navigate('/login'), 3000)
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
        <h2 className="reset-title">Redefinir Senha</h2>
        
        {message && <div className={isError ? 'reset-error' : 'reset-success'}>{message}</div>}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="reset-input-group">
            <label htmlFor="token" className="reset-label">Token</label>
            <input
              id="token"
              name="token"
              type="text"
              value={formData.token}
              onChange={handleChange}
              required
              className="reset-input"
              placeholder="Token recebido por email"
            />
          </div>

          <div className="reset-input-group">
            <label htmlFor="password" className="reset-label">Nova Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="reset-input"
            />
          </div>

          <div className="reset-input-group">
            <label htmlFor="passwordConfirm" className="reset-label">Confirmar Nova Senha</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="reset-input"
            />
          </div>

          <button type="submit" disabled={loading} className="reset-button">
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ConfirmResetPage
