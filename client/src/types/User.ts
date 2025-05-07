export type User = {
  id: string,
  name: string,
  password?: string,
  email: string
}

export type NewUser = Omit<User, 'id'>
