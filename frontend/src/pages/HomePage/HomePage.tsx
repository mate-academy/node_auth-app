import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import Navbar from '../../components/common/Navbar';
import LoginModal from '../../components/auth/LoginModal/LoginModal';
import RegisterModal from '../../components/auth/RegisterModal/RegisterModal';

const HomePage = () => {
  const { isLoginOpen, isRegisterOpen } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <div className="page-container">
      <Navbar />

      <main className="home-content centered">
        <h1>Вітаємо в Auth.API</h1>
        <p>Надійна система авторизації та управління доступом.</p>
      </main>

      {isLoginOpen && <LoginModal />}
      {isRegisterOpen && <RegisterModal />}
    </div>
  );
};

export default HomePage;
