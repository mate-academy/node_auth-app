import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import classNames from 'classnames';
import {
  loginUser,
  rememberCredentials,
  clearCredentials,
  getCredentials,
} from "./api/users";
import { useLoading } from './hooks/hooks';
import { NavLink } from 'react-router-dom';
import { Context } from './Context';

export const Login = () => {
  const { setLogedUser } = useContext(Context);
  const instructions = 'Please enter your password and email.';
  const [text, setText] = useState('P');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckboxVisible, setIsCheckboxVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isSectionVisible, setisSectionVisible] = useState(false);
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

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      isRemembered ? (
        await rememberCredentials(email, password)
      ) : (
        await clearCredentials()
      );

      const { user, accessToken } = await loginUser(email, password);

      localStorage.setItem('accessToken', accessToken);
      setLogedUser(user);
      setMessage('');
      setEmail('');
      setPassword('');
    } catch (e) {
      if (e.response) {
        handleMessage(e.response.data.message);
      } else {
        handleMessage(e.message);
      }
    } finally {
      setIsLoading(false);
      clearInterval(interval.current);
      clearTimeout(timer2.current);
    }
  };

  const onLogin = () => {
    if (!email) {
      handleMessage('Please enter email');
    } else if (!password) {
      handleMessage('Please enter password');
    } else {
      handleLogin();
    }
  };

  const loadCredentials = async () => {
    try {
      const response = await getCredentials();

      setEmail(response.email);
      setPassword(response.password);
      setIsRemembered(true);
    } catch {
      return;
    }
  };

  useEffect(() => {
    setisSectionVisible(true);
    loadCredentials();

    for (let i = 2; i <= instructions.length + 28 ; i++) {
      timer1.current = setTimeout(() => {
        if (i <= instructions.length) {
          setText(instructions.slice(0, i));
        } else if (i === instructions.length + 7) {
          setIsEmailVisible(true);
        } else if (i === instructions.length + 14) {
          setIsPasswordVisible(true);
        } else if (i === instructions.length + 21) {
          setIsCheckboxVisible(true);
        } else if (i === instructions.length + 28) {
          setIsButtonVisible(true)
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
      <section className="section">
      
        <div className='section__field'>
          <span className='section__title'>LOGIN</span>

          <p className='section__text'>
          {text}
          </p>

          <input
            className={classNames(
              'section__input',
              { 'section__input--enabled': isEmailVisible}
            )}
            type="email"
            placeholder='Enter e-mail.'
            value={email}
            disabled={isLoading}
            onChange={(event) => {
              if (email.length <= 30 && event.target.value.length <= 30) {
                setEmail(event.target.value);
                setMessage('');
              }
            }}
            />
          
          <input
            className={classNames(
              'section__input',
              { 'section__input--enabled': isPasswordVisible}
            )}
            type="password"
            placeholder='Enter password.'
            value={password}
            disabled={isLoading}
            onChange={(event) => {
              if (password.length <= 20 && event.target.value.length <= 20) {
                setPassword(event.target.value);
                setMessage('');
              }
            }}
          />

          {isCheckboxVisible && (
            <div className="section__remember-container">
              <button
                className={classNames(
                  'section__remember-button',
                  { 'section__remember-button--enabled': isButtonVisible},
                  { 'section__remember-button--clicked': isRemembered},
                )}
                onClick={() => setIsRemembered(!isRemembered)}
              />
              <span
                className="section__text section__text--remember"
              >
                Remember me
              </span>
            </div>
          )}

        </div>

        <div className="section__container">
          <button
            className={classNames(
              'section__button',
              { 'section__button--enabled': isButtonVisible}
            )}
            disabled={isLoading}
            onClick={onLogin}
          >
            Submit
          </button>
          <div
            className={classNames(
              'section__error',
              { 'section__error--enabled': message || isLoading}
            )}
          >
            {`>${message}<`}
          </div>
        </div>

        <NavLink
          to="/verify"
          className={classNames(
            'section__button',
            'section__button--reset',
            { 'section__button--enabled': isButtonVisible}
          )}
          disabled={isLoading}
          onClick={() => {}}
        >
          Reset password
        </NavLink>

      </section>
    )
  )
}