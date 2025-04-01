import { useForm, SubmitHandler } from 'react-hook-form';
import { PASSWORD_PATTERN } from '../../utils/constants';

type Inputs = {
  email: string;
  name: string;
  'new-password': string;
  'confirm-password': string;
};

const EditPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const password = watch('new-password');
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=400"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-100">
          Edit your profile
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          action=""
          method="POST"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-300"
            >
              New email address
            </label>
            <div className="mt-2">
              <input
                {...register('email')}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm/6 font-medium text-gray-300"
            >
              New name
            </label>
            <div className="mt-2">
              <input
                {...register('name')}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="new-password"
                className="block text-sm/6 font-medium text-gray-300"
              >
                New password - should be at least 6 characters, and include at
                least one letter and one number
              </label>
            </div>
            <div className="mt-2">
              <input
                {...register('new-password', {
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message:
                      'Password must be at least 6 characters long and include at least one letter and one number',
                  },
                })}
                id="new-password"
                name="new-password"
                type="password"
                required
                autoComplete="new-password"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
              {errors['new-password'] && (
                <p className="mt-2 text-sm/6 text-red-500">
                  {errors['new-password'].message}
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
                Confirm new password
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
                required
                autoComplete="confirm-password"
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="old-password"
                className="block text-sm/6 font-medium text-gray-300"
              >
                To apply any changes, please enter your old password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="old-password"
                name="old-password"
                type="password"
                required
                autoComplete="old-password"
                className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-400 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;
