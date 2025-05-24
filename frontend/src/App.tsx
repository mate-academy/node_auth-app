import { useContext, useEffect } from 'react';
import './assets/styles/App.css';
import Header from './components/Header';
import Main from './components/Main';
import { UserContext } from './features/user/UserContext';
import { User } from './features/types';
import { privateAxiosInstance } from './api/axios';

function App() {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    (async function getMe() {
      try {
        const response = await privateAxiosInstance.get('/me');
        const { id, email, username } = response.data as User;
        setUser({
          id,
          email,
          username,
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        // navigate('/login'); - нема потреби, інакше неавторизований користувач не зможе побачити домашню сторінку
        setUser(null);
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
