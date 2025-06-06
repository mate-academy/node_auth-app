import { useNavigate } from 'react-router-dom';
import styles from './TermsPage.module.scss';

export const TermsPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/sign-up');
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => handleNavigate()}
        className={styles.iconLink}
      ></button>

      <h1 className={styles.title}>
        Тут могла б бути величезна інформаційна сторінка яку ніхто ніколи так і не прочитає.
        Але якщо ви вже тут то тримайте тортик 🍰
      </h1>
    </div>
  )
}
