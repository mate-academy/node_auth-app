import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { useLoading } from './hooks/hooks';
import {
  clearCredentials,
  resetEmail,
  verifyEmail,
  verifyPassword,
} from './api/users';
import { Context } from './Context';

export const ChangeEmail = () => {
  const { logedUser, setLogedUser, handleRefreshFail } = useContext(Context);
  const instructions = 'Enter your password first. Then enter new email and and check your email box.';
  const [text, setText] = useState('E');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  let timer1 = useRef(null);
  let timer2 = useRef(null);
  let interval = useRef(null);
  const [message, setMessage] = useLoading(interval, '');

  const handleMessage = (errorMessage) => {
    for (let i = 1; i <= errorMessage.length + 1 ; i++) {
      timer2.current = setTimeout(() => {
        setMessage(errorMessage.slice(0, i));
      }, (i * 25))
    }
  };
  
  const handleVerify = async () => {
    setIsLoading(true);
      
    try {
      await verifyPassword(logedUser.email, password);
  
      setIsVerified(true);
      handleMessage('Verified');
    } catch (e) {
      if (e.response) {
        switch (e.response.status) {
          case 401:
            handleRefreshFail();
            break;
          default:
            handleMessage(e.response.data.message);
            break;
        }
      } else {
        handleMessage(e.message);
      }
    } finally {
      setIsLoading(false);
      clearInterval(interval.current);
      clearTimeout(timer2.current);
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
      
    try {
      await verifyEmail(newEmail);

      setCurrentEmail(newEmail);
      handleMessage('Email has been sent');
    } catch (e) {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              handleRefreshFail();
              break;
            default:
              handleMessage(e.response.data.message);
              break;
          }
        } else {
          handleMessage(e.message);
        }
      } finally {
        setIsLoading(false);
        clearInterval(interval.current);
        clearTimeout(timer2.current);
      }
  };

  const handleReset = async () => {
    setIsLoading(true);

    try {
      await clearCredentials();

      const response = await resetEmail(logedUser.email, currentEmail, resetToken);

      setLogedUser(response);
      setCurrentEmail('');
      setNewEmail('');
      handleMessage('Successfully reseted');
    } catch (e) {
      if (e.response) {
        switch (e.response.status) {
          case 401:
            handleRefreshFail();
            break;
          default:
            handleMessage(e.response.data.message);
            break;
        }
      } else {
        handleMessage(e.message);
      }
    } finally {
      setIsLoading(false);
      clearInterval(interval.current);
      clearTimeout(timer2.current);
    }
  };

  const onVerify = () => {
    if (!password) {
      handleMessage('Please enter old password');
    } else {
      handleVerify();
    }
  };

  const onSend = () => {
    if (!newEmail) {
      handleMessage('Please enter new email');
    } else {
      handleSend();
    }
  };

  const onReset = () => {
    if (!resetToken) {
      handleMessage('Please enter token');
    } else {
      handleReset();
    }
  }

  useEffect(() => {
    setIsSectionVisible(true);

    for (let i = 2; i <= instructions.length + 14 ; i++) {
      timer1.current = setTimeout(() => {
        if (i <= instructions.length) {
          setText(instructions.slice(0, i));
        } else if (i === instructions.length + 7) {
          setIsInputVisible(true);
        } else if (i >= instructions.length + 14) {
          setIsButtonVisible(true);
        }
      }, (i * 10))
    }
  
    return () => clearTimeout(timer1.current, timer2.current)
  }, []);
  
  useEffect(() => {
    if (isLoading) {
      setMessage('...');
    }
  }, [isLoading, setMessage]);
  
  return (
    isSectionVisible && (
      <section className="section section--profile">  
        <div className='section__field'>
          <div className='section__field-container'>
            <NavLink
              to={`/profile/${logedUser.id}`}
              className={classNames(
                'section__button',
                'section__button--back',
                { 'section__button--enabled': isSectionVisible},
              )}
              disabled={isLoading}
            >
              {'<-'}
            </NavLink>
  
            <span className='section__title section__title--with-button'>CHANGE EMAIL</span>
          </div>
  
          <p className='section__text'>
            {text}
          </p>
  
          {!isVerified && (
            <input
              className={classNames(
                'section__input',
                { 'section__input--enabled': isInputVisible}
              )}
              type="password"
              placeholder='Enter password'
              value={password}
              disabled={isLoading}
              onChange={(event) => {
                if (password.length <= 20 && event.target.value.length <= 20) {
                  setPassword(event.target.value);
                  setMessage('');
                }  
              }}
            />
          )}
  
          {isVerified && (
            <>
              <input
                className={classNames(
                  'section__input',
                  { 'section__input--enabled': isInputVisible}
                )}
                type="email"
                placeholder='Enter new email'
                value={newEmail}
                disabled={isLoading || currentEmail}
                onChange={(event) => {
                  if (newEmail.length <= 30 && event.target.value.length <= 30) {
                    setNewEmail(event.target.value);
                    setMessage('');
                  }
                }}
              />

              {currentEmail && (
                <input
                  className={classNames(
                    'section__input',
                    { 'section__input--enabled': isInputVisible}
                  )}
                  type="text"
                  placeholder='Enter token fron email'
                  value={resetToken}
                  disabled={isLoading}
                  onChange={(event) => {
                    setResetToken(event.target.value);
                    setMessage('');
                  }}
                />
              )}      
            </>    
          )}
        </div>

        <div className="section__container">
          {!isVerified && (
            <button
              className={classNames(
                'section__button',
                { 'section__button--enabled': isButtonVisible}
              )}
              disabled={isLoading}
              onClick={onVerify}
            >
              Verify
            </button>
          )}

          {isVerified && (
            <button
              className={classNames(
                'section__button',
                'section__button--reset',
                { 'section__button--enabled': isButtonVisible}
              )}
              disabled={isLoading}
              onClick={onSend}
            >
              {currentEmail ? 'Send again' : 'Send'}
            </button>
          )}

          <div
            className={classNames(
              'section__error',
              { 'section__error--enabled': message || isLoading}
            )}
          >
            {`>${message}<`}
          </div>
        </div>

        {currentEmail && (
          <button
            className={classNames(
              'section__button',
              'section__button--reset',
              { 'section__button--enabled': isButtonVisible}
            )}
            disabled={isLoading}
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </section>
    )
  )
};
