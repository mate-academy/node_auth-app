import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container centered text-center">
      <h1 className="error-code">404</h1>
      <h2>Сторінку не знайдено</h2>
      <p>Маршрут, за яким ви звернулися, не існує або його було переміщено.</p>
      <button onClick={() => navigate('/')} className="btn-primary">
        Повернутися на головну
      </button>
    </div>
  );
};

export default NotFoundPage;
