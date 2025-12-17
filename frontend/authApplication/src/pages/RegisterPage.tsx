import React, { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/auth'
import type { RegisterData } from '../types/auth'
import '../styles/RegisterPage.css'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterData>({ name: '', email: '', password: '' })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/profile')
    }
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)
    try {
      await authService.register(formData)
      setSuccessMessage('Token de ativação enviado para seu email')
      setFormData({ name: '', email: '', password: '' })
    } catch (err: unknown) {
      const error = err as any
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message)
      } else {
        setError(error.message || 'Erro ao criar conta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Criar Conta</h2>
        {error && <div className="register-error">{error}</div>}
        {successMessage && <div className="register-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-input-group">
            <label htmlFor="name" className="register-label">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="email" className="register-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="password" className="register-label">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="register-link-container">
          <Link to="/login" className="register-link">Já tem conta? Faça login</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
