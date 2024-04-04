import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { activate } from "./api/users";
import { useLocation } from "react-router-dom";
import { useLoading } from './hooks/hooks';
import { Context } from "./Context";

export const Activation = () => {
  const { setLogedUser } = useContext(Context);
  const [isActivating, setIsActivating] = useState(false);
  const { pathname } = useLocation();
  const token = pathname.split('/')[2];
  let timer1 = useRef(null);
  let interval = useRef(null);
  const [message, setMessage] = useLoading(interval, '');
  
  const handleActivation = useCallback(async () => {
    const handleMessage = async (str) => {
      clearInterval(interval.current)
      setMessage(str[0]);
  
      for (let i = 1; i <= str.length + 1; i++) {
        timer1.current = setTimeout(() => {
          setMessage(str.slice(0, i));
        }, (i * 40))
      }
    };

    setIsActivating(true);

    try {
      const { user, accessToken } = await activate(token);

      localStorage.setItem('accessToken', accessToken);
      setLogedUser(user);  
    } catch (e) {
      if (e.response) {
        handleMessage(e.response.data.message);
      } else {
        handleMessage(e.message);
      }
    } finally {
      clearTimeout(timer1.current);
      setIsActivating(false);
    }
  }, [token, setMessage, setIsActivating, setLogedUser]);

  useEffect(() => {
    if (isActivating) {
      setMessage('...');
    }
  }, [isActivating, setMessage])

  useEffect(() => {
    handleActivation();
    
    return clearTimeout(timer1.current);
  }, [handleActivation, token]);

  return (
    <h4 className="activation">{isActivating ? `>Activating${message}<` : `>${message}<`}</h4>
  )
}