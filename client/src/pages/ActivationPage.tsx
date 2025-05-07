import { useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ActivationPage = () => {
  const {token, email} = useParams();
  const navigate = useNavigate();
  const {activate, activationStatus} = useAuth();


  useEffect(() => {
    if(!email || !token) return;

    const activateUser = async () => {
      await activate(email, token).then(() => {
        navigate('/profile')
      });
    }
    activateUser()
  }, [email,token]);

  return (
    <main className='main'>
      <div className="container">
        <h1 className='title'>
          {activationStatus === 'loading' && <p>Activation... ⏳</p>}
          {activationStatus === 'success' && <p>Account is activated...</p>}
          {activationStatus === 'error' && <p>Error!</p>}
        </h1>
      </div>
    </main>
  )
}

export default ActivationPage;
