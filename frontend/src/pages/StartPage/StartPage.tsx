import styles from './StartPage.module.scss';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const StartPage: React.FC = () => {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setIsExiting(true);

    setTimeout(() => {
      navigate(path);
    }, 1300);
  };
  
  return (
    <>
      <div className={styles.block}>
        <div className={`${styles.contantBlock} ${isExiting ? 'blockSlideUp' : 'blockSlideDown'}`}>
          <div className={styles.elipsContainer}>
            <div className={styles.elips} />
            <div className={styles.elips} />
            <div className={styles.elips} />
            <div className={styles.bottomBlock}></div>
          </div>

          <div className={styles.contantContainer}>
            <h1 className={`${styles.headerText} animate__animated ${isExiting ? 'animate__fadeOutUp fadeOut_100' : 'animate__fadeInDown fadeIn_800'}`}>Cinephile</h1>
            <p className={`${styles.description} animate__animated ${isExiting ? 'animate__fadeOutUp fadeOut_200' : 'animate__fadeInDown fadeIn_600'}`}>
              Весь світ кіно у ваших руках — обирайте, дивіться, насолоджуйтесь!
            </p>

            <div className={styles.authButtons}>
            <button
              onClick={() => handleNavigate('/sign-up')}
              className={`${styles.buttonRegister} animate__animated ${isExiting ? 'animate__fadeOutUp fadeOut_400' : 'animate__fadeInDown fadeIn_400'}`}
            >
                Зареєструватись
            </button>       
            <button
              onClick={() => handleNavigate('/login')}
              className={`${styles.buttonLogin} animate__animated ${isExiting ? 'animate__fadeOutUp fadeOut_500' : 'animate__fadeInDown fadeIn_200'}`}
            >
              Увійти
            </button>
            </div>
          </div>
        </div>
        <div className={styles.bottomBackground}></div>
      </div>
    </>
  );
};
