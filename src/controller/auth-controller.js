'use strict';

const {
  createUser,
  activateUser,
  loginUser,
  sendPasswordResetInstructions,
  resetPasswordWithToken,
  getUserId,
  updateUserName,
  changeUserPassword,
} = require('../services/auth-services');
const {
  saveToken,
  getToken,
  removeToken,
} = require('../services/token-service');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../services/jwt-service');

const createAccount = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'erro',
        code: 'CAMPOS_OBRIGATORIOS',
        message: 'Os campos de name, email e password são obrigatórios',
      });
    }

    if (
      typeof password !== 'string' ||
      typeof name !== 'string' ||
      typeof email !== 'string'
    ) {
      return res.status(400).json({
        message: 'As informações inseridas precisam ser enviadas como texto!',
      });
    }

    if (!name.trim()) {
      return res.status(400).json({
        message: 'Você precisa preencher o seu nome!',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'erro',
        code: 'SENHA_PEQUENA',
        message: 'A senha precisa ter no mínimo 6 caracteres',
      });
    }

    const userInformations = await createUser(req.body);

    return res.status(201).json({
      name: userInformations.name,
      email: userInformations.email,
    });
  } catch (error) {
    if (error.message === 'O email informado já existe') {
      return res.status(409).json({
        status: 'erro',
        code: 'EMAIL_DUPLICADO',
        message: 'O e-mail informado já existe',
      });
    } else {
      return res.status(500).json({
        status: 'erro',
        code: 'ERRO_INTERNO',
        message: 'Aconteceu algum um erro',
      });
    }
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenActivation = await activateUser({ token });

    if (!tokenActivation) {
      return res.status(400).end();
    }

    return res.status(200).json({
      message: 'Usuário ativado',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Aconteceu um erro ao ativar a conta',
    });
  }
};

const loginAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await loginUser({ email, password });

    if (!account) {
      return res.status(401).json({
        status: 'erro',
        code: 'ERRO_NO_LOGIN',
        message: 'Não foi possível efetuar o login',
      });
    }

    const accessToken = generateAccessToken(account.id);

    const refreshToken = generateRefreshToken(account.id);

    await saveToken(account.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
      },
    });
  } catch (error) {
    if (error.message === 'CONTA_NAO_ATIVADA') {
      return res.status(401).json({
        status: 'erro',
        code: 'CONTA_NAO_ATIVADA',
        message:
          'Ative sua conta pelo link enviado ao' +
          'seu e-mail antes de fazer login.',
      });
    }

    return res.status(500).end();
  }
};

const logoutAccount = async (req, res) => {
  try {
    const tokenRemoved = req.cookies.refreshToken;

    if (!tokenRemoved) {
      return res.status(401).end();
    }

    const removedCount = await removeToken(tokenRemoved);

    if (removedCount === 0) {
      return res.status(401).json({
        message: 'Sessão inválida ou já encerrada',
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({ message: 'Você saiu da conta com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Houve um erro ao sair da conta' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user.id;
    const userInfo = await getUserId(user);

    if (!userInfo) {
      return res.status(404).end();
    }

    return res.status(200).json({
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Ocorreu um erro ao acessar o seu perfil' });
  }
};

const renovateToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).end();
    }

    let decodedToken;

    try {
      decodedToken = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        message: 'Refresh token inválido ou expirado',
      });
    }

    if (!decodedToken.id) {
      return res.status(401).end();
    }

    const user = await getUserId(decodedToken.id);

    if (!user) {
      return res.status(401).end();
    }

    if (!user.isActive) {
      return res.status(401).end();
    }

    const verifyToken = await getToken(refreshToken);

    if (!verifyToken) {
      return res.status(401).end();
    }

    const accessToken = generateAccessToken(decodedToken.id);

    return res.status(200).json({
      accessToken: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Ocorreu um erro ao acessar a página',
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'O email não foi enviado' });
    }

    await sendPasswordResetInstructions({ email });

    return res.status(200).json({
      message:
        'Se o e-mail estiver cadastrado, você receberá' +
        'as instruções para redefinir sua senha.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Ocorreu um erro ao enviar o email de redefinição de senha',
    });
  }
};

const confirmPasswordReset = async (req, res) => {
  try {
    const { token, password, confirmation } = req.body;

    if (!token || !password || !confirmation) {
      return res.status(400).end();
    }

    const resetpassword = await resetPasswordWithToken({
      token,
      password,
      confirmation,
    });

    if (resetpassword === null) {
      return res
        .status(400)
        .json({ message: 'O token está expirado ou inválido.' });
    }

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    if (error.message === 'SENHA_INCORRETA') {
      return res.status(400).json({
        status: 'erro',
        code: 'SENHA_INCORRETA',
        message: 'A segunda senha informada é diferente da primeira',
      });
    }

    if (error.message === 'TOKEN_INVALIDO_OU_AUSENTE') {
      return res.status(400).json({
        status: 'erro',
        code: 'TOKEN_INVALIDO_OU_AUSENTE',
        message:
          'O token para a redefinição de senha não' +
          'foi recebido ou pode estar inválido.',
      });
    }

    if (error.message === 'SENHA_CURTA') {
      return res.status(400).json({
        status: 'erro',
        code: 'SENHA_CURTA',
        message:
          'A senha que você inseriu está curta, adicione mais caracteres.',
      });
    }

    return res
      .status(500)
      .json({ message: 'Ocorreu um erro ao alterar a sua senha.' });
  }
};

const updateProfileName = async (req, res) => {
  try {
    const user = req.user.id;
    const nameUser = req.body.name;

    if (typeof nameUser !== 'string' || !nameUser.trim()) {
      return res.status(400).end();
    }

    const updateInfo = await updateUserName(user, nameUser);

    if (!updateInfo) {
      return res.status(404).end();
    }

    return res.status(200).json({
      id: updateInfo.id,
      name: updateInfo.name,
      email: updateInfo.email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Aconteceu um erro ao atualizar o seu perfil' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const infoPassword = req.body;
    const { currentPassword, newPassword, confirmation } = infoPassword;

    if (!currentPassword || !newPassword || !confirmation) {
      return res.status(400).json({
        message: 'Algum campo para a redefinição de senha está faltando!',
      });
    }

    if (
      typeof newPassword !== 'string' ||
      typeof currentPassword !== 'string' ||
      typeof confirmation !== 'string'
    ) {
      return res.status(400).json({
        message:
          'A senha atual, a nova e a confirmação' +
          'precisam serem enviadas como texto!',
      });
    }

    if (infoPassword.newPassword.length < 6) {
      return res.status(400).json({
        message: 'A senha precisa ter no mínimo seis caracteres',
      });
    }

    if (infoPassword.newPassword !== infoPassword.confirmation) {
      return res.status(400).json({
        message: 'A nova senha e a confirmação estão diferentes!',
      });
    }

    const infoToResetPass = await changeUserPassword(
      userId,
      currentPassword,
      newPassword,
    );

    if (!infoToResetPass) {
      return res.status(400).end();
    }

    return res.status(200).json({
      message: 'Senha atualizada com sucesso!',
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Houve um erro ao atualizar a sua senha' });
  }
};

module.exports = {
  createAccount,
  activateAccount,
  loginAccount,
  logoutAccount,
  getProfile,
  renovateToken,
  requestPasswordReset,
  confirmPasswordReset,
  updateProfileName,
  changePassword,
};
