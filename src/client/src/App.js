import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { Context } from './Context';
import { refresh } from './api/users';
import { Loader } from './Loader';
import { RoutesProvider } from './RoutesProvider';
import { useLocation } from 'react-router-dom';

export const App = () => {
  const { setLogedUser, handleRefreshFail } = useContext(Context);
  const [areBordersVisible, setAreBordersVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { pathname } = useLocation();
  const timer = useRef(null);
  const animationCondition = pathname === '/'
    || pathname === '/error'
    || pathname === '/login+error'
    || pathname.split('/')[1] === 'activate';

  const checkAuth = useCallback(async () => {
    setIsChecked(false);

    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const { user, accessToken } = await refresh();
        
        localStorage.setItem('accessToken', accessToken);
        setLogedUser(user);
      } catch(e) {
        handleRefreshFail();
      } finally {
        setIsChecked(true);
      }
    } else {
      setIsChecked(true);
    }
  }, [setLogedUser, handleRefreshFail]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (animationCondition) {
      for (let i = 0; i <= 7; i++) {
        timer.current = setTimeout(() => {
    
        switch (i) {
          case 1:
            setAreBordersVisible(false);
            break;
          case 2:
            setAreBordersVisible(false);
            break;
          case 5:
            setAreBordersVisible(false);
            break;
          case 6:
            setAreBordersVisible(false);
            break;
          default:
            setAreBordersVisible(true);
            break;
          } 
        }, (i * 50))
      }  
    } else {
      setAreBordersVisible(true);
    }

    return () => clearTimeout(timer.current);
  }, [pathname, animationCondition]);

  return (
    <div className="App">
      <main
        className={classNames(
          'main',
          { 'main--withoutBorders': !areBordersVisible },
        )}
      >
        {!isChecked ? (
          <Loader />
        ) : (
          <RoutesProvider />
        )}
      </main>
    </div>
  )
};
