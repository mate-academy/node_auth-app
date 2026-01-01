import { Outlet } from 'react-router-dom';
import './App.scss';
import { Header } from './components/Header';
import { useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { Loader } from './components/Loader/Loader';

export const App = () => {
  const { isChecked, checkAuth } = useContext(AuthContext);

  useEffect(() => {
    checkAuth();
  }, []);

  if (!isChecked) {
    return <Loader />
  }

  return (
    <div className="App">
      <Header />
      <main className='main'>
        <Outlet />
      </main>
    </div>
  )
}