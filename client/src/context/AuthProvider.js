import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
import { accessTokenService } from "../services/accessTokenService";

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState("shhshs");

  async function registration({ email, password }) {
    const data = await authService.register({ email, password });

    console.log("registration", data);
  }

  async function login({ email, password }) {
    const { accessToken, user } = await authService.login({ email, password });

    console.log(accessToken, user);
    accessTokenService.save(accessToken);
    setUser(user);
  }

  async function logout() {
    await authService.logout();
    console.log(logout);

    accessTokenService.remove();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, registration, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
