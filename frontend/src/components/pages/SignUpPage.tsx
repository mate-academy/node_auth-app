import axios from 'axios';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PASSWORD_PATTERN } from '../../utils/constants';
import { useState } from 'react';

type Inputs = {
  email: string;
  username: string;
  password: string;
  'confirm-password': string;
};

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ success: string; error: string }>({
    success: '',
    error: '',
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const password = watch('password');
  const email = watch('email');

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3005/register', formData);

      setMessages({
        success: `Registration allowed. The confirmation email was sent to ${email}`,
        error: '',
      });
      setIsLoading(false);
      reset();
    } catch (error) {
      setIsLoading(false);
      console.log(formData);

      if (axios.isAxiosError(error)) {
        console.error('Error registering user:', error.response?.data);
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
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=400"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-100">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <label
              htmlFor="username"
              className="block text-sm/6 font-medium text-gray-300"
            >
              Name
            </label>
            <div className="mt-2">
              <input
                {...register('username')}
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
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
                Password - should be at least 6 characters, and include at least
                one letter and one number
              </label>
            </div>
            <div className="mt-2">
              <input
                {...register('password', {
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message:
                      'Password must be at least 6 characters long and include at least one letter and one number',
                  },
                })}
                id="password"
                name="password"
                type="password"
                required
                autoComplete="password"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
              {errors['password'] && (
                <p className="mt-2 text-sm/6 text-red-500">
                  {errors['password'].message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="confirm-password"
                className="block text-sm/6 font-medium text-gray-300"
              >
                Confirm password
              </label>
            </div>
            <div className="mt-2">
              <input
                {...register('confirm-password', {
                  validate: (value) =>
                    value === password || 'The passwords do not match',
                  required: 'Please confirm your password',
                })}
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="current-password"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
              {errors['confirm-password'] && (
                <p className="mt-2 text-sm/6 text-red-500">
                  {errors['confirm-password'].message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {isLoading ? '...loading' : 'Sign up'}
            </button>
          </div>

          {messages.success && (
            <p className="mt-2 text-sm/6 text-green-500">{messages.success}</p>
          )}
          {messages.error && (
            <p className="mt-2 text-sm/6 text-red-500">{messages.error}</p>
          )}

          <p className="mt-10 text-center text-sm/6 text-gray-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
