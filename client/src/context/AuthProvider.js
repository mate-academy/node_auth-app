import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
import { accessTokenService } from "../services/accessTokenService";
import useCheckResponseCode from "../hooks/useCheckResponseCode";

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(null);

  const checkResponseCode = useCheckResponseCode();

  const showError = (error) =>
    checkResponseCode({
      // code: error.response.status.toString(),
      message: error.message,
    });

  async function registration({ email, password }) {
    setIsLoading(true);

    try {
      await authService.register({ email, password });
      return true;
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function activateUser(activationToken) {
    setIsLoading(true);

    try {
      await authService.activate(activationToken);
      return true;
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login({ email, password }) {
    setIsLoading(true);

    try {
      const { accessToken, user } = await authService.login({
        email,
        password,
      });

      accessTokenService.save(accessToken);
      setUser(user);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);

    try {
      await authService.logout();
      accessTokenService.remove();
      setUser(null);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        registration,
        activateUser,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
