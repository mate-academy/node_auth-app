import usr from './user.service.ts';
import tkn from './token.service.ts';
import eml from './email/email.service.ts';

const srv = {
  usr: usr,
  tkn: tkn,
  eml: eml,
};

export default srv;
