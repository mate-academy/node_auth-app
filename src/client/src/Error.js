import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import { NavLink } from 'react-router-dom';
import { Context } from './Context';
import classNames from 'classnames';

export const Error = ({ errorMessage = "Oops, 404 :(" }) => {
  const { setRefreshError } = useContext(Context);
  const message = errorMessage;
  const [text, setText] = useState('A');
  const [isButtonVisible, setIisButtonVisible] = useState(false);
  let timer = useRef(null);

  useEffect(() => {
    for (let i = 2; i <= message.length + 1; i++) {
      timer.current = setTimeout(() => {
        setText(message.slice(0, i));

        if (i === message.length + 1) {
          setIisButtonVisible(true);
        }
      }, (i * 70))
    }

    return () => {
      clearTimeout(timer.current);
      setRefreshError(false);
    };
  }, [message, setRefreshError]);

  return (
    <>
      <h4 className="main__title">{text}</h4>

      <div className="main__container">
        <NavLink
          className={classNames(
            'main__button',
            { 'main__button--enabled': isButtonVisible},
          )}
          to="/"
        >
          Back to app
        </NavLink>        
      </div>
    </>
  )
}

