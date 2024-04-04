import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { useLoading } from './hooks/hooks';
import { getUsers } from './api/users';
import { Context } from './Context';
import { Users } from './Users';
  
export const UserList = () => {
  const { logedUser, handleRefreshFail } = useContext(Context);
  const instructions = 'List of all activated users.';
  const [text, setText] = useState('E');
  const [isListVisible, setIsListVisible] = useState(false);
  const [areButtonsVisible, setAreButtonsVisible] = useState(false);
  const [isReturnVisible, setIsReturnVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionVisible, setisSectionVisible] = useState(false);
  const [users, setUsers] = useState(null);
  const [page, setPage] = useState(0);
  const perPage = 5;
  const currentStart = page * perPage;
  const currentEnd = users ? (
    (currentStart + perPage) <= users.length
      ? currentStart + perPage
      : users.length
  ) : 0;
  const pagesAmount = users ? (
    users.length % perPage !== 0
      ? Math.ceil(users.length / perPage)
      : users.length / perPage
  ) : 0;
  let timer1 = useRef(null);
  let timer2 = useRef(null);
  let interval = useRef(null);
  const [message, setMessage] = useLoading(interval, '');

  const loadUsers = useCallback(async () => {
    const handleMessage = (errorMessage) => {
      for (let i = 1; i <= errorMessage.length + 1 ; i++) {
        timer2.current = setTimeout(() => {
          setMessage(errorMessage.slice(0, i));
        }, (i * 25))
      }
    };

    setIsLoading(true);
    setisSectionVisible(true);
    setIsReturnVisible(true);
    
    try {
      const response = await getUsers();

      if (response && response.length === 1) {
        setUsers(response);
        setMessage('');
      } else if (response && response.length > 1) {
        setUsers(response.sort((curr, prev) => curr.id - prev.id));
        setMessage('');
      } else {
        handleMessage('No activated users');
      } 
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
  }, [setMessage, handleRefreshFail]);

  useEffect(() => {
    loadUsers();

    for (let i = 2; i <= instructions.length + 14 ; i++) {
      timer1.current = setTimeout(() => {
        if (i <= instructions.length) {
          setText(instructions.slice(0, i));
        } else if (i === instructions.length + 7) {
          setIsListVisible(true);
        } else if (i === instructions.length + 14) {
          setAreButtonsVisible(true);
        }
      }, (i * 10))
    }

    return () => clearTimeout(timer1.current, timer2.current)
  }, [loadUsers]);

  useEffect(() => {
    if (isLoading && isListVisible) {
      setMessage('...');
    }
  }, [isLoading, setMessage, isListVisible]);

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
                { 'section__button--enabled': isReturnVisible},
              )}
              disabled={isLoading}
            >
              {'<-'}
            </NavLink>

            <span className='section__title section__title--with-button'>USERS</span>
          </div>

          <p className='section__text'>
          {text}
          </p>

          {isListVisible && (
            <div className="section__list">
              {!isLoading && users && users.length > 0
                ? (
                  <Users users={users.slice(currentStart, currentEnd)}/>
                ) : (
                  <div
                    className={classNames(
                      'section__error',
                      'section__error--list',
                      { 'section__error--enabled': message || isLoading}
                    )}
                  >
                    {`>${message}<`}
                  </div>
              )}
            </div>
          )}
        </div>

        <div className="section__container section__container--list">
          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': page === 0}
            )}
            disabled={isLoading || !users || page === 0}
            onClick={() => setPage(0)}
          >
            {'<<'}
          </button>

          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': page === 0}
            )}
            disabled={isLoading || !users || page === 0}
            onClick={() => setPage(page - 1)}
          >
            {'<'}
          </button>

          <div
            className={classNames(
              'section__page_container',
              { 'section__page_container--enabled': areButtonsVisible },
            )}
          >
            {`${users && users.length > 0 ? page + 1 : 0} / ${pagesAmount}`}
          </div>

          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': !users || (users && currentEnd >= users.length)},
            )}
            disabled={isLoading || !users || (users && currentEnd >= users.length)}
            onClick={() => setPage(page + 1)}
          >
            {'>'}
          </button>

          <button
            className={classNames(
              'section__button',
              'section__button--list',
              { 'section__button--enabled': areButtonsVisible},
              {'section__button--disabled': !users || (users && (page * perPage) + perPage >= users.length)}
            )}
            disabled={isLoading || !users || (page * perPage) + perPage >= users.length}
            onClick={() => {
                if (users.length % perPage === 0) {
                  setPage(Math.floor(users.length / perPage) - 1)
                } else {
                  setPage(Math.floor(users.length / perPage))
                }
            }}
          >
            {'>>'}
          </button>
        </div>
      </section>
    )
  )
};
