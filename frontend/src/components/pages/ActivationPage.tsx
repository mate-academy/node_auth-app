import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ActivationPage = () => {
  const { activationToken } = useParams<{ activationToken: string }>();
  const navigate = useNavigate();

  async function handleActivate() {
    await axios.get(`http://localhost:3005/activate/${activationToken}`);
    alert('Activation successfull. Returning to the home page');
    navigate('/');
  }

  return (
    <>
      <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-100">
        Account activation
      </h2>
      <button
        onClick={handleActivate}
        className="cursor-pointer mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition-colors duration-200"
      >
        Click to activate
      </button>
    </>
  );
};

export default ActivationPage;
