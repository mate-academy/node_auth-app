import { useContext, useEffect } from 'react';
import './assets/styles/App.css';
import Header from './components/Header';
import Main from './components/Main';
import { UserContext } from './features/user/UserContext';
import axios from 'axios';
import { User } from './features/types';

function App() {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    (async function getMe() {
      const response = await axios.get('http://localhost:3005/me', {
        withCredentials: true,
      });
      if (response.status === 200) {
        const { id, email, username } = response.data as User;
        setUser({
          id,
          email,
          username,
        });
      }
    })();
  }, [setUser]);

  return (
    <>
      <Header />
      <Main />
    </>
  );
}

export default App;
