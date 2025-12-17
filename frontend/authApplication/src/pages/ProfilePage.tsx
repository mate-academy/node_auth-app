import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/auth'
import type { User, UpdateProfileData } from '../types/auth'
import type { FormEvent } from 'react'
import '../styles/ProfilePage.css'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    setUser(currentUser)
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await authService.updateProfile(formData)
      setUser(response.user || null)
      setSuccess(response.message)
      setFormData({})
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }

  if (!user) return null

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">Perfil</h1>
          <button onClick={handleLogout} className="profile-logout-button">Sair</button>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <div className="profile-user-info">
          <div><strong>Nome:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Status:</strong> {user.active ? 'Ativo' : 'Inativo'}</div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <h3 className="profile-section-title">Atualizar Perfil</h3>

          <div className="profile-input-group">
            <label htmlFor="name" className="profile-label">Novo Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder={user.name}
              className="profile-input"
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="currentPassword" className="profile-label">Senha Atual</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword || ''}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="newPassword" className="profile-label">Nova Senha</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword || ''}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <div className="profile-input-group">
            <label htmlFor="passwordConfirm" className="profile-label">Confirmar Nova Senha</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm || ''}
              onChange={handleChange}
              className="profile-input"
            />
          </div>

          <button type="submit" disabled={loading} className="profile-button">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
