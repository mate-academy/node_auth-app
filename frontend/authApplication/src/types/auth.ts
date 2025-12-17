export interface User {
  id: string
  name: string
  email: string
  active: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  token?: string
  user?: User
}

export interface UpdateProfileData {
  name?: string
  currentPassword?: string
  newPassword?: string
  passwordConfirm?: string
  newEmail?: string
}

export interface ResetPasswordData {
  token: string
  password: string
  passwordConfirm: string
}