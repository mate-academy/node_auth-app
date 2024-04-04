import React, { useCallback, useState } from 'react';

export const Context = React.createContext({
  logedUser: null,
  setLogedUser: () => {},
  resetingUser: null,
  setResetingUser: () => {},
  isRenamed: false,
  setIsRenamed: () => {},
  handleRefreshFail: () => {},
});

export const Provider = ({ children }) => {
  const [logedUser, setLogedUser] = useState(null);
  const [resetingUser, setResetingUser] = useState(null);
  const [isRenamed, setIsRenamed] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const handleRefreshFail = useCallback(async () => {
    localStorage.removeItem('accessToken');
    setRefreshError(true);
    setLogedUser(null);
  }, []);
  const contextValue = {
    logedUser,
    setLogedUser,
    resetingUser,
    setResetingUser,
    isRenamed,
    setIsRenamed,
    refreshError,
    setRefreshError,
    handleRefreshFail,
  };
  
  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};
 