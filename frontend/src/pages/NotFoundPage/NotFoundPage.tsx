import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

export const NotFoundPage = () => {
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
        404
      </h1>
    </div>
  )
}
