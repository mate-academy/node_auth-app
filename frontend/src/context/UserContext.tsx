import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { userService } from "../services/userService";
import type { User } from "../../types/User";

interface UpdateEmailResponse {
  user: User;
  message: string;
}

interface UserContextType {
  updateName: (newName: string) => Promise<void>;
  updatePassword: (currentPass: string, newPass: string) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<UpdateEmailResponse>;
}

export const UserContext = React.createContext<UserContextType>({} as UserContextType);

type Props = {
  children: React.ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const { user, setUser } = useContext(AuthContext);

  const updateName = async (newName: string) => {
    if (!user) {
      return;
    }

    const updatedUser = await userService.changeName(newName);
    setUser(updatedUser);
  }

  const updatePassword = async (currentPass: string, newPass: string) => {
    if (!user) {
      return;
    }

    await userService.changePassword(currentPass, newPass);
  }

  const updateEmail = async (newEmail: string, password: string) => {
    if (!user) {
      throw new Error("User is not authenticated");
    }

    return await userService.changeEmail(newEmail, password);
  }

  return (
    <UserContext.Provider value={{ updateName, updatePassword, updateEmail }}>
      {children}
    </UserContext.Provider>
  )
}