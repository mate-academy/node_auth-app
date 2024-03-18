import { FC, ReactNode, createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
import { accessTokenService } from "../services/accessTokenService";
import useHandleRequest from "../hooks/useHandleRequest";

interface RequestResult {
  isSuccess: boolean;
  errors: CustomServerErrors | null;
}

interface AuthContextType {
  user: User | null;
  registration: (userData: UserData) => Promise<RequestResult>;
  activateUser: (activationToken: string) => Promise<RequestResult>;
  login: (userData: UserData) => Promise<RequestResult>;
  sendRecoveringPasswordLink: (email: string) => Promise<RequestResult>;
  resetPassword: (
    password: string,
    resetPasswordToken: string
  ) => Promise<RequestResult>;
  verifyResetPasswordToken: (
    resetPasswordToken: string | undefined
  ) => Promise<RequestResult>;
  logout: () => Promise<RequestResult>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type UserData = {
  email: string;
  password: string;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const { handleRequest, isLoading } = useHandleRequest();

  const registration = (userData: UserData) =>
    handleRequest(authService.register(userData), () => {});
  const activateUser = (activationToken: string) =>
    handleRequest(authService.activate(activationToken), () => {});
  const login = (userData: UserData) =>
    handleRequest(
      authService.login(userData),
      ({ accessToken, user }: { accessToken: string; user: User }) => {
        accessTokenService.save(accessToken);
        setUser(user);
      }
    );
  const sendRecoveringPasswordLink = (email: string) =>
    handleRequest(authService.sendResetEmailForPassword({ email }), () => {});
  const verifyResetPasswordToken = (resetPasswordToken: string | undefined) =>
    handleRequest(
      authService.checkResetPasswordToken(resetPasswordToken),
      () => {}
    );
  const resetPassword = (password: string, resetPasswordToken: string) =>
    handleRequest(
      authService.resetPassword({ password }, resetPasswordToken),
      () => {}
    );
  const logout = () =>
    handleRequest(authService.logout(), () => {
      accessTokenService.remove();
      setUser(null);
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        registration,
        activateUser,
        login,
        sendRecoveringPasswordLink,
        verifyResetPasswordToken,
        resetPassword,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
