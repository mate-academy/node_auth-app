import React, { useMemo, useState } from 'react';
import { accessTokenService } from '../services/accessTokenService.js';
import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';

export const ProfileContext = React.createContext({});

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  async function getProfile() {
    try {
      const { name, email, id } = await userService.getMe();

      setProfile({ name, email, id });
    } catch (error) {
      console.log('User is not authentincated');
    }
  }

  const value = useMemo(
    () => ({
      profile,
      getProfile,
    }),
    [profile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
