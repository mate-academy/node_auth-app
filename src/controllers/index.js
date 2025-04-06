import { register } from './register.js';
import { activate } from './activate.js';
import { login } from './login.js';
import { signOut } from './signout.js';
import { passwordChange } from './passwordChange.js';
import { changeMail } from './emailChange.js';

export const authController = {
  register,
  activate,
  login,
  signOut,
  passwordChange,
  changeMail,
};
