'use strict';

/**
 * Factory do servidor Express.
 * Princípio da Inversão de Dependência (DIP): a criação do app
 * é separada do start, permitindo testes isolados.
 *
 * Configuração:
 * 1. Middlewares globais (JSON parser, cookie parser, CORS)
 * 2. Sessão e Passport (para OAuth)
 * 3. Rotas de autenticação (/auth)
 * 4. Rotas de perfil (/profile)
 * 5. Rotas OAuth (/auth)
 * 6. Handler 404 para rotas não encontradas
 * 7. Middleware global de tratamento de erros
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const expensesRoutes = require('./routes/expensesRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { authMiddleware } = require('./middlewares/authMiddleware');

require('./config/passport'); // Loads robust OAuth strategies

function createServer() {
  const app = express();

  // === Middlewares Globais ===
  app.use(express.json());
  app.use(cookieParser());

  // === Prevenção de Cache ===
  // Evita vazamento de dados via cache do navegador na troca de usuário
  app.use((req, res, next) => {
    res.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  });

  app.use(
    cors({
      origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:5173', // Vite dev server
      ],
      credentials: true, // Permite envio de cookies
    }),
  );

  // === Sessão (necessária para Passport OAuth) ===
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // true em produção com HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      },
    }),
  );

  // === Passport.js ===
  app.use(passport.initialize());
  app.use(passport.session());

  // === Rotas ===
  app.use('/auth', authRoutes);
  app.use('/profile', userRoutes);
  app.use('/auth', oauthRoutes);

  // === Rotas de Contabilidade ===
  app.use('/accounting/expenses', authMiddleware, expensesRoutes);
  app.use('/accounting/categories', authMiddleware, categoriesRoutes);

  // === Rota raiz ===
  app.get('/', (req, res) => {
    res.json({
      message: 'Auth App API',
      endpoints: {
        register: 'POST /auth/register',
        activate: 'GET /auth/activate/:token',
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        refresh: 'GET /auth/refresh',
        resetPassword: 'POST /auth/reset-password',
        confirmReset: 'POST /auth/reset-password/:token',
        profile: 'GET /profile',
        changeName: 'PATCH /profile/name',
        changePassword: 'PATCH /profile/password',
        changeEmail: 'PATCH /profile/email',
        googleLogin: 'GET /auth/google',
        githubLogin: 'GET /auth/github',
      },
    });
  });

  // === 404 — Rota não encontrada ===
  app.use((req, res) => {
    res.status(404).json({
      message: 'Página não encontrada',
    });
  });

  // === Middleware global de erros ===
  app.use(errorMiddleware);

  return app;
}

module.exports = { createServer };
