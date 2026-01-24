import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/api.js';
import UpdateEmailForm from '../components/UpdateEmailForm.jsx';
import UpdatePasswordForm from '../components/UpdatePasswordForm.jsx';

export default function Profile() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [nameProfile, setNameProfile] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/profile').then((res) => {
      setUser(res.data);
      setNameProfile(res.data.name);
    });
  }, []);

  async function updateName(e) {
    e.preventDefault();
    await api.put('/profile/name', { nameProfile });
    alert('Updated name');
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <h2>Profile</h2>

      <p>Current email: {user.email}</p>

      <form onSubmit={updateName}>
        <h3>Change name</h3>
        <input
          value={nameProfile}
          onChange={(e) => setNameProfile(e.target.value)}
        />
        <button>Save name</button>
      </form>

      <hr />

      <UpdatePasswordForm />

      <hr />

      <UpdateEmailForm />

      <hr />

      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
