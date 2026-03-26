'use strict';

/**
 * AuthController — Mapeia requisições HTTP para o AuthService.
 * Princípio da Responsabilidade Única (SRP): apenas traduz
 * request/response, delegando a lógica ao serviço.
 */
const authService = require('../services/authService');

/**
 * POST /auth/register — Registra um novo usuário.
 * Body: { name, email, password }
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const user = await authService.register(name, email, password);

    res.status(201).json({
      message:
        'Registro realizado com sucesso!' +
        ' Verifique seu email para ativar a conta.',
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/activate/:token — Ativa a conta do usuário.
 */
async function activate(req, res, next) {
  try {
    const { token } = req.params;

    const result = await authService.activate(token);

    // Envia os tokens via cookies HTTP-only
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutos
      sameSite: 'lax',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      sameSite: 'lax',
    });

    res.json({
      message: 'Conta ativada com sucesso! Redirecionando para o perfil...',
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login — Realiza o login.
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Envia os tokens via cookies HTTP-only
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      message: 'Login realizado com sucesso! Redirecionando para o perfil...',
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout — Realiza o logout.
 */
async function logoutHandler(req, res, next) {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const tokenService = require('../services/tokenService');
      const payload = tokenService.validateRefreshToken(refreshToken);

      if (payload) {
        authService.logout(payload.id);
      }
    }

    // Remove os cookies (opções DEVEM coincidir com as usadas ao criar)
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'lax',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
    });

    res.json({
      message: 'Logout realizado com sucesso! Redirecionando para o login...',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/reset-password — Solicita a redefinição de senha.
 * Body: { email }
 */
async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    // Sempre retorna sucesso (não revela se o email existe)
    res.json({
      message:
        'Se o email estiver cadastrado, você receberá um link de redefinição.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/reset-password/:token — Confirma a redefinição de senha.
 * Body: { password, confirmation }
 */
async function confirmPasswordReset(req, res, next) {
  try {
    const { token } = req.params;
    const { password, confirmation } = req.body;

    await authService.confirmPasswordReset(token, password, confirmation);

    res.json({
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/refresh — Renova o access token.
 */
async function refreshTokens(req, res, next) {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token não fornecido' });
    }

    const result = await authService.refresh(refreshToken);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({
      message: 'Tokens renovados com sucesso',
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  activate,
  login,
  logout: logoutHandler,
  requestPasswordReset,
  confirmPasswordReset,
  refreshTokens,
};
