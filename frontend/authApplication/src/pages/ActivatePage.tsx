import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import authService from '../services/auth'
import '../styles/ActivatePage.css'

const ActivatePage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/profile')
      return
    }
    if (token) handleActivation(token)
  }, [token, navigate])

  const handleActivation = async (activationToken: string) => {
    setLoading(true)
    setMessage('')
    try {
      await authService.activate(activationToken)
      setMessage('Conta ativada com sucesso!')
      setIsError(false)
      setActivated(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      const error = err as Error
      setMessage(error.message || 'Erro ao ativar conta')
      setIsError(true)
      setActivated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleManualActivation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const tokenInput = formData.get('token') as string
    if (tokenInput) handleActivation(tokenInput)
  }

  if (loading) {
    return (
      <div className="activate-container">
        <div className="activate-card">
          <div className="activate-loading">Ativando conta...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="activate-container">
      <div className="activate-card">
        <h2 className="activate-title">{activated ? 'Conta Ativada!' : 'Ativar Conta'}</h2>
        {message && <div className={isError ? 'activate-error' : 'activate-success'}>{message}</div>}
        {activated ? (
          <div className="activate-success-content">
            <p>Sua conta foi ativada com sucesso!</p>
            <p>Você será redirecionado para login em breve.</p>
            <Link to="/login" className="activate-link">Ir para login agora</Link>
          </div>
        ) : (
          <form onSubmit={handleManualActivation} className="activate-form">
            <div className="activate-input-group">
              <label htmlFor="token" className="activate-label">Token de Ativação</label>
              <input
                id="token"
                name="token"
                type="text"
                required
                className="activate-input"
                placeholder="Cole o token recebido por email"
                defaultValue={token || ''}
              />
              <p className="activate-help-text">O token foi enviado para seu email após o registro.</p>
            </div>
            <button type="submit" className="activate-button">Ativar Conta</button>
          </form>
        )}
        {!activated && <div className="activate-link-container"><Link to="/login" className="activate-link">Voltar para login</Link></div>}
      </div>
    </div>
  )
}

export default ActivatePage
