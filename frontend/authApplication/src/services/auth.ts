import api from './api'
import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ResetPasswordData,
  AuthResponse
} from '../types/auth'

class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData)
    return response.data
  }

  async activate(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/activate', { token })
    return response.data
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    const { token, user } = response.data
    
    if (token && user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    
    return response.data
  }

  async logout(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return response.data
  }

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/reset-password', { email })
    return response.data
  }

  async confirmPasswordReset(data: ResetPasswordData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/reset-password/confirm', data)
    return response.data
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    const response = await api.put<AuthResponse>('/users/profile', data)
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }
}

export default new AuthService();