import { Link } from 'react-router-dom';
import './HomePage.scss';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Привіт!</h1>
      <h1>Радів вітати у нас на сайті</h1>

      <p>
        Немає акаунта? <Link to="/registration">Зареєструватися</Link>
      </p>

      <p>
        Ви вже зареєстровані? <Link to="/login">Увійти</Link>
      </p>
    </div>
  );
};

export default HomePage;
