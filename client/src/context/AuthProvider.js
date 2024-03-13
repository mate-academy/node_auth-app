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
  const [isError, setIsError] = useState(null);

  const checkResponseCode = useCheckResponseCode();

  async function registration({ email, password }) {
    try {
      await authService.register({ email, password });
    } catch (error) {
      checkResponseCode({
        code: error.response.status.toString(),
        message: error.message,
      });
    }
  }

  async function activateUser(activationToken) {
    setIsError(false);
    try {
      await authService.activate(activationToken);
    } catch (error) {
      checkResponseCode({
        code: error.response.status.toString(),
        message: error.message,
      });
    }
    setIsError(true);
  }

  async function login({ email, password }) {
    try {
      const { accessToken, user } = await authService.login({
        email,
        password,
      });
      // console.log("accessToken", accessToken);
      // console.log("user", user);

      accessTokenService.save(accessToken);
      setUser(user);
    } catch (error) {
      checkResponseCode({
        code: error.response.status.toString(),
        message: error.message,
      });
    }
  }

  async function logout() {
    try {
      await authService.logout();
      console.log("logout");

      accessTokenService.remove();
      setUser(null);
    } catch (error) {
      console.log("error client", error);
      // checkResponseCode({
      //   code: error.response.status.toString(),
      //   message: error.message,
      // });
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, registration, activateUser, login, logout, isError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
