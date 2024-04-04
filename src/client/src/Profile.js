import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import {
  Outlet,
  useLocation,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { Context } from './Context';
import classNames from 'classnames';
import { logoutUser } from './api/users';

export const Profile = () => {
  const {
    logedUser,
    setLogedUser,
    isRenamed,
  } = useContext(Context);
  const message = `Welcome\n${logedUser.name}`;
  const [text, setText] = useState('W');
  const [isLogingOut, setIsLogingOut] = useState(false);
  const [visibleButtonsAmount, setVisibleButtonsAmount] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const animationCondition = pathname === `/profile/${logedUser.id}`;
  let timer = useRef(null);

  const onLogOut = async () => {
    setIsLogingOut(true);

    try {
      await logoutUser();   
    } catch {
      navigate('/error');
    } finally {
      localStorage.removeItem('accessToken');
      setLogedUser(null);
      setIsLogingOut(false);
    }
  };

  useEffect(() => {
    setVisibleButtonsAmount(0);

    if (animationCondition) {
      for (let i = 2; i <= message.length + 5; i++) {
        timer.current = setTimeout(() => {
          setText(message.slice(0, i));
    
          switch (i) {
            case message.length + 1:
              setVisibleButtonsAmount(1);
              break;
            case message.length + 2:
              setVisibleButtonsAmount(2);
              break;
            case message.length + 3:
              setVisibleButtonsAmount(3);
              break;
            case message.length + 4:
              setVisibleButtonsAmount(4);
              break;
            case message.length + 5:
              setVisibleButtonsAmount(5);
              break;
            default:
          } 
        }, (i * 50))
      }
    } else {
      if (isRenamed) {
        for (let i = 9; i <= message.length + 1; i++) {
          timer.current = setTimeout(() => {
            setText(message.slice(0, i));
          }, (i * 50))
        }
      } else {
        setText(message);
      }
      
      setVisibleButtonsAmount(0);
    }

    return () => clearTimeout(timer.current);
  }, [isRenamed, message, animationCondition, setText]);
  
  return (
    <>
      <h4 className="main__title">{text}</h4>
      
      {animationCondition && (
        <div className="main__container main__container--profile">
        <button
          className={classNames(
            'main__button',
            'main__button--profile',
            { 'main__button--enabled': visibleButtonsAmount >= 1 },
            { 'main__button--disabled': isLogingOut},
          )}
          onClick={onLogOut}
        >
          Log out
        </button>
        <NavLink
          className={({ isActive }) => classNames(
            'main__button',
            'main__button--profile',
            { 'main__button--enabled': visibleButtonsAmount >= 2 },
            { 'main__button--focused': isActive},
            { 'main__button--disabled': isLogingOut},
          )}
          to={`/profile/${logedUser.id}/users`}
        >
          Users
        </NavLink>
        <NavLink
          className={({ isActive }) => classNames(
            'main__button',
            'main__button--profile',
            { 'main__button--enabled': visibleButtonsAmount >= 3 },
            { 'main__button--focused': isActive},
            { 'main__button--disabled': isLogingOut},
          )}
          to={`/profile/${logedUser.id}/rename`}
        >
          Change name
        </NavLink>
        <NavLink
          className={({ isActive }) => classNames(
            'main__button',
            'main__button--profile',
            { 'main__button--enabled': visibleButtonsAmount >= 4 },
            { 'main__button--focused': isActive},
            { 'main__button--disabled': isLogingOut},
          )}
          to={`/profile/${logedUser.id}/change+email`}
        >
          Change email
        </NavLink>
        <NavLink
          className={({ isActive }) => classNames(
            'main__button',
            'main__button--profile',
            { 'main__button--enabled': visibleButtonsAmount >= 5 },
            { 'main__button--focused': isActive},
            { 'main__button--disabled': isLogingOut},
          )}
          to={`/profile/${logedUser.id}/change+password`}
        >
          Change password
        </NavLink>
      </div>
      )}

      <div>
        <Outlet />
      </div>
    </>
  )
};
