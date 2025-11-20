'use strict';

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const autenticado = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.user = dados;
    next();
  } catch (error) {
    return res.status(401).redirect('/login');
  }
};
