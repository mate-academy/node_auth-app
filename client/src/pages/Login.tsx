import React, { FormEvent } from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/fetchAuth';

const Login = () => {
  const {setAccessToken} = useAuth();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      navigate('/profile')
    }
  })

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    mutation.mutate({email, password})

    form.reset()
  }

  return (
    <main className='main'>
      <div className="container">
        <h1 className='title'>Log in</h1>
        <form className='box' onSubmit={submit}>
          <input type="text" className='input' name='email' placeholder='Your email...'/>
          <input type="password" className='input' name='password' placeholder='Your password...'/>
          <button className='button'>Log in</button>
          <p>If you had have already account, please, go to <a href='/logup'>log up page</a></p>
        </form>
      </div>
    </main>
  )
}

export default Login
