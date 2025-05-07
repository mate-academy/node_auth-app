import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/fetchAuth';

const Registration = () => {
  const [isRegistrated, setIsRegistrated] = useState(false);
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setIsRegistrated(true);
    }
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string

    mutation.mutate({
      email,
      name,
      password,
    })

    form.reset()
  }

  useEffect(() => {
    if (isRegistrated) {
      const checkToken = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
        }
      };

      const interval = setInterval(checkToken, 2000);
      return () => clearInterval(interval);
    }
  }, [isRegistrated]);

  return (
    <main className='main'>
      <div className="container">
        <h1 className='title'>Log up</h1>
        {mutation.isPending && <p>Pending</p>}
        {mutation.isSuccess && <p>Success</p>}
        <form className='box' onSubmit={submit}>
          <input type="text" className='input' name='name' placeholder='Your name...'/>
          <input type="text" className='input' name='email' placeholder='Your email...'/>
          <input type="password" className='input' name='password' placeholder='Your password ...'/>
          <button className='button'>Log up</button>
          <p>If you had have already account, please, go to <a href='/login'>login page</a></p>
        </form>
      </div>
    </main>
  )
}

export default Registration
