import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <h2 className="text-2xl/20 font-semibold">Log out?</h2>
      <div className="flex justify-between gap-20 mt-8">
        <button className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
          Yes
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Return
        </button>
      </div>
    </>
  );
};

export default LogoutPage;
