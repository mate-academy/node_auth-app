import { accessTokenService } from "./accessToken";
import { api } from "./api";

const getAuthHeder = () => {
  return {
    headers: {
      Authorization:`Bearer ${accessTokenService.get()}`
    }
  }
};


const changeName = (name: string) => {
  return api.patch('/users/change-name', {name}, getAuthHeder());
};

export const userAuth = {
  changeName,
};