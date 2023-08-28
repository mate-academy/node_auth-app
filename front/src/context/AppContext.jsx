import React, { useMemo, useState } from "react";
import { authService } from "../services/authService";
import { accessTokenService } from "../services/accessTokenService";

export const AppContext = React.createContext({});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecked, setChecked] = useState(true);
  const [isActivated, setIsActivated] = useState(false);

  async function activate(activationToken) {
    const { accessToken, user } = await authService.activate(activationToken);

    if (user) {
      accessTokenService.save(accessToken);
      setUser(user);
      setIsActivated(true);
    }
  }

  async function checkAuth() {
    try {
      const { accessToken, user, isActivated } = await authService.refresh();

      accessTokenService.save(accessToken);
      setIsActivated(isActivated);
      setUser(user);
    } catch (error) {
    } finally {
      setChecked(true);
    }
  }

  async function login({ email, password }) {
    const { accessToken, user, isActivated } = await authService.login({
      email,
      password,
    });

    accessTokenService.save(accessToken);
    setUser(user);
    setIsActivated(isActivated);
  }

  async function logout() {
    await authService.logout();

    accessTokenService.remove();
    setUser(null);
    setIsActivated(false);
  }

  const value = useMemo(
    () => ({
      isChecked,
      isActivated,
      user,
      setUser,
      checkAuth,
      activate,
      setIsActivated,
      login,
      logout,
    }),
    [user, isChecked]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
