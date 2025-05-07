type RegisterForm = {
  email: string;
  password: string;
  name: string;
};

const register = async (form: RegisterForm): Promise<any> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/registration`, {
    method: 'POST',
    body: JSON.stringify(form),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};

const login = async (form: Omit<RegisterForm, 'name'>) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
    credentials: 'include'
  })

  if(!response.ok) {
    const error: {message: string} = await response.json();
    throw new Error(error.message || 'Something went wrong!')
  }

  return response.json();
}

const refresh = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export const authApi = {
  register,
  login,
  refresh,
}
