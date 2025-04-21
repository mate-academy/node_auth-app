const authService = require('../services/auth.service');
const validator = require('validator');
const authmiddleware = require('../middlewares/auth.middleware');

const registration = async (req, res) => {
  const { name, email, password } = req.body;

  // check of empty values
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name/ email/ password is empty' });
  }

  // check if email is Valid
  const isValidEmail = validator.isEmail(email);

  if (!isValidEmail) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  // check if password satisfies the criterias
  const isValidPassword = validator.isStrongPassword(password, {
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  });

  if (!isValidPassword) {
    return res.status(400).json({ message: 'Password is not strong' });
  }

  // Check if user already exists
  const user = await authService.isuserAlreadyExists(email);

  if (user) {
    return res.status(400).json({ message: 'User Already Exists' });
  }

  // Generate Activation Key
  const activationKey = authmiddleware.generateJwtToken(email);

  const registerUser = {
    name,
    email,
    password,
    activationKey,
  };

  const newUser = await authService.registerNewUser(registerUser);

  if (!newUser) {
    return res.status(500).json('Unable to register user');
  }

  // Send Email for activation
  res.status(200).json({
    message:
      'registration completed.' +
      'Please activate the link sent to your registered email',
  });
};

const activateUser = async (req, res) => {
  const decoded = authmiddleware.verifyJwtToken(req.params.token);

  if (decoded.email) {
    const checkUser = await authService.isuserAlreadyExists(decoded.email);

    if (checkUser && checkUser.isactive) {
      return res.status(200).json({ message: 'User already active' });
    } else {
      const activated = await authService.activateUser(checkUser.email);

      if (!activated) {
        return res.status(404).json({ message: 'Unable to activate user' });
      }
    }
  } else {
    return res.status(404).json({ message: 'Link not valid' });
  }

  return res.status(200).json({ message: 'Account activated successfully' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const loginResult = await authService.verifyCredentials(email, password);

  if (loginResult.success) {
    const loginToken = authmiddleware.generateJwtToken(
      loginResult.user.email,
      loginResult.user.id,
    );

    return res.status(loginResult.code).json({
      message: 'Login Successful',
      token: loginToken,
      user: {
        name: loginResult.user.name,
        email: loginResult.user.email,
      },
    });
  } else {
    return res.status(loginResult.code).json({ message: loginResult.message });
  }
};

const triggertResetPasswordLink = async (req, res) => {
  const user = await authService.isuserAlreadyExists(req.body.email);

  if (!user) {
    return res.status(401).json({ message: `Email doesn't exists.` });
  }

  const activationToken = authmiddleware.generateJwtToken(user.email, user.id);

  const triggerResetLink = await authService.triggerResetPassword({
    email: user.email,
    token: activationToken,
  });

  if (triggerResetLink) {
    return res
      .status(triggerResetLink.code)
      .json({ message: triggerResetLink.message });
  }
};

const resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const { newPassword, confirmPassword } = req.body;

  let decodedToken;

  try {
    decodedToken = authmiddleware.verifyJwtToken(resetToken);
  } catch (err) {
    return res
      .status(401)
      .json({ message: 'Token Expired. Please reset again', error: err });
  }

  const getPwdLink = await authService.getPasswordResetData(
    decodedToken.email,
    resetToken,
  );

  if (!getPwdLink) {
    return res.status(401).json({ message: 'Password Reset Data not found' });
  }

  if (
    decodedToken.expiresAt < new Date() &&
    getPwdLink.expiresAt < new Date()
  ) {
    return res.status(401).json({ message: 'Password Reset Link expired.' });
  }

  const isValidPassword = validator.isStrongPassword(newPassword, {
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  });

  if (!isValidPassword) {
    return res
      .status(400)
      .json({ message: 'Password did not meet the minimum criteria' });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: 'Password and confirmation password did not match' });
  }

  const userData = {
    email: decodedToken.email,
    id: decodedToken.userId,
    newPassword: newPassword,
    token: resetToken,
  };
  const updatedPassword = await authService.updatePassword(userData);

  if (updatedPassword.success) {
    return res
      .status(updatedPassword.code)
      .json({ message: updatedPassword.message });
  } else {
    return res
      .status(updatedPassword.code)
      .json({ error: updatedPassword.error });
  }
};

const authController = {
  registration,
  activateUser,
  loginUser,
  triggertResetPasswordLink,
  resetPassword,
};

module.exports = authController;
