import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { useLoading } from './hooks/hooks';
import { rename } from './api/users';
import { Context } from './Context';

  
export const Rename = () => {
  const { logedUser, setLogedUser, setIsRenamed, handleRefreshFail } = useContext(Context);
  const instructions = 'Enter new name into the field.';
  const [text, setText] = useState('E');
  const [name, setName] = useState('');
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
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

  const handleRename = async () => {
    setIsLoading(true);
    
    try {
      const response = await rename(logedUser.email, name);

      setIsRenamed(true);
      setLogedUser(response);    
      setName('');
      handleMessage('Successfully renamed');
    } catch (e) {
      if (e.response && e.response.status) {
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
  }

  const onRename = () => {
    if (!name) {
      handleMessage('Please enter name');
    } else {
      handleRename();
    }
  }

  useEffect(() => {
    setIsSectionVisible(true);

    for (let i = 2; i <= instructions.length + 14 ; i++) {
      timer1.current = setTimeout(() => {
        if (i <= instructions.length) {
          setText(instructions.slice(0, i));
        } else if (i === instructions.length + 7) {
          setIsNameVisible(true);
        } else if (i >= instructions.length + 14) {
          setIsButtonVisible(true);
        }
      }, (i * 10))
    }

    return () => {
      clearTimeout(timer1.current, timer2.current);
      setIsRenamed(false);
    }
  }, [setIsRenamed]);

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

            <span className='section__title section__title--with-button'>RENAME</span>
          </div>

          <p className='section__text'>
          {text}
          </p>

          <input
            className={classNames(
              'section__input',
              { 'section__input--enabled': isNameVisible}
            )}
            type="text"
            placeholder='Enter new name'
            value={name}
            disabled={isLoading}
            onChange={(event) => {
              if (name.length <= 20 && event.target.value.length <= 20) {
                setName(event.target.value);
                setMessage('');
              }
            }}
          />
        </div>

        <div className="section__container">
          <button
            className={classNames(
              'section__button',
              { 'section__button--enabled': isButtonVisible}
            )}
            disabled={isLoading}
            onClick={onRename}
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
      </section>
    )
  )
};

