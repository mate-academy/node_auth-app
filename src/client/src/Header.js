  import React, {
    useEffect,
    useState,
    useRef,
  } from 'react';
  import {
    NavLink,
    Outlet,
    useLocation,
  } from 'react-router-dom';
  import classNames from 'classnames';

export const Header = () => {
  const message = 'AUTH APP :)';
  const [text, setText] = useState('A');
  const [areButtonsVisible, setAreButtonsVisible] = useState(false);
  const { pathname } = useLocation();
  const animationCondition = pathname === '/';
  const buttonCondition = pathname === '/login'
      || pathname === '/registration'
      || pathname === '/';
  let timer = useRef(null);

  useEffect(() => {
    setAreButtonsVisible(false);
    
    if (animationCondition) {
      for (let i = 2; i <= message.length + 1; i++) {
        timer.current = setTimeout(() => {
          setText(message.slice(0, i));

          if (i === message.length + 1) {
            setAreButtonsVisible(true);
          }
        }, (i * 70))
      }
  
      return () => clearTimeout(timer.current);
    } else {
      setText(message);
      setAreButtonsVisible(true);
    }
  }, [pathname, animationCondition]);

  return (
    <>
      <h2 className="main__title">{text}</h2>

      <header className="main__container">
        <NavLink
          className={({ isActive }) => classNames(
            'main__button',
            { 'main__button--enabled': areButtonsVisible},
            { 'main__button--focused': isActive},
            { 'main__button--hidden': !buttonCondition},
          )}
          to="login"
        >
          Sign in
        </NavLink>

        <NavLink
          className={({ isActive }) => classNames(
            'main__button',
            { 'main__button--enabled': areButtonsVisible},
            { 'main__button--focused': isActive},
            { 'main__button--hidden': !buttonCondition},
          )}
          to="registration"
        >
          Register
        </NavLink>          
      </header>

      <div>
        <Outlet />
      </div>
    </>
  )
}
