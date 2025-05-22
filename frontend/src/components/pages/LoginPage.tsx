import axios from 'axios';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../features/user/UserContext';
import { User } from '../../features/types';

type Inputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ success: string; error: string }>({
    success: '',
    error: '',
  });

  const { register, handleSubmit, reset } = useForm<Inputs>();
  const navigate = useNavigate();

  async function onSubmit(formData: Inputs) {
    setIsLoading(true);
    try {
      const responce = await axios.post(
        'http://localhost:3005/login',
        formData,
        {
          withCredentials: true,
        }
      );

      setMessages({
        success: `Login successful. Welcome back!`,
        error: '',
      });
      setIsLoading(false);
      reset();
      navigate('/');
      setUser(responce.data as User);
    } catch (error) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        console.error('Error login:', error.response?.data);
        setMessages({
          success: '',
          error: error.response?.data || 'Registration failed',
        });
      } else {
        console.error('Unexpected error:', error);
        setMessages({
          success: '',
          error: 'An unexpected error occurred',
        });
      }
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=400"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-100">
          Log in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          action="#"
          method="POST"
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-300"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                {...register('email')}
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-300"
              >
                Password
              </label>
              <div className="text-sm">
                <Link
                  to="/reset-password"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                {...register('password')}
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {isLoading ? '...loading' : 'Log in'}
            </button>
          </div>

          {messages.success && (
            <p className="mt-2 text-sm/6 text-green-500">{messages.success}</p>
          )}
          {messages.error && (
            <p className="mt-2 text-sm/6 text-red-500">{messages.error}</p>
          )}

          <p className="mt-10 text-center text-sm/6 text-gray-300">
            Not a member?{' '}
            <Link
              to="/sign-up"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
