import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import activationModel from '../models/activation.model.js';
import resetModel from '../models/reset.model.js';
import {
  sendActivationEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from '../utils/email.js';
import tokenModel from '../models/token.model.js';

const signup = async (req, res) => {
  try {
    const user = await userModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const activationData = await activationModel.create({
      userId: user._id,
    });

    await sendActivationEmail(user, activationData).catch((e) => {
      throw new Error('Could not send activation email');
    });

    res.sendStatus(201);
  } catch (e) {
    const errRes = {};

    if (e.name === 'ValidationError') {
      for (const error in e.errors) {
        if (Object.hasOwnProperty.call(e.errors, error)) {
          if (error !== 'email' && error !== 'password') {
            continue;
          }

          errRes[error] = e.errors[error].message;
        }
      }
    } else if (e.code && e.code === 11000 && e.keyValue.email) {
      errRes.email = 'Email already exists';
    } else if (e.message === 'Could not send activation email') {
      errRes.email = 'Could not send activation email';
    } else {
      errRes.general = 'Something went wrong';
    }

    res.status(400).json(errRes);
  }
};

const activation = async (req, res) => {
  try {
    const user = await userModel.findById(req.query.id);

    if (!user || user.active) {
      throw new Error('Invalid user');
    }

    await activationModel.deleteMany({ userId: user._id });

    const activationData = await activationModel.create({
      userId: user._id,
    });

    await sendActivationEmail(user, activationData).catch(() => {
      throw new Error('Could not send activation email');
    });
  } catch (e) {
    const errRes = {};

    if (e.message === 'Invalid user') {
      errRes.activationId = 'Invalid user';
    } else if (e.message === 'Could not send activation email') {
      errRes.email = 'Could not send activation email';
    } else {
      errRes.general = 'Something went wrong';
    }

    res.status(400).json(errRes);
  }
};

const activate = async (req, res) => {
  try {
    const activationData = await activationModel.findOneAndDelete({
      _id: req.body.activationId,
    });

    if (!activationData) {
      throw new Error('Invalid activation code');
    }

    await userModel.updateOne({ _id: activationData.userId }, { active: true });

    res.sendStatus(200);
  } catch (e) {
    const errRes = {};

    if (e.message === 'Invalid activation code') {
      errRes.activationId = 'Invalid activation code';
    } else {
      errRes.general = 'Something went wrong';
    }

    res.status(400).json(errRes);
  }
};

const passwordResetLink = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      throw new Error('Invalid email');
    }

    const resetData = await resetModel.create({
      userId: user._id,
    });

    await sendPasswordResetEmail(user, resetData).catch(() => {
      throw new Error('Could not send reset email');
    });
  } catch (e) {
    const errRes = {};

    if (e.message === 'Invalid email') {
      errRes.email = 'Invalid email';
    } else if (e.message === 'Could not send reset email') {
      errRes.email = 'Could not send reset email';
    } else {
      errRes.general = 'Something went wrong';
    }

    res.status(400).json(errRes);
  }
};

const passwordReset = async (req, res) => {
  try {
    const resetData = await resetModel.findOne({
      _id: req.body.resetId,
    });

    if (!resetData) {
      throw new Error('Invalid reset code');
    }

    await userModel.updateOne(
      { _id: resetData.userId },
      { password: req.body.password },
    );

    await resetData.delete();

    await tokenModel.deleteMany({ userId: resetData.userId });

    const user = await userModel.findById(resetData.userId);

    await sendPasswordChangedEmail(user).catch(() => {
      throw new Error('Could not send reset email');
    });

    res.sendStatus(200);
  } catch (e) {
    const errRes = {};

    if (e.name === 'ValidationError') {
      for (const error in e.errors) {
        if (Object.hasOwnProperty.call(e.errors, error)) {
          if (error !== 'password') {
            continue;
          }

          errRes[error] = e.errors[error].message;
        }
      }
    } else {
      errRes.general = 'Something went wrong';
    }

    res.status(400).json(errRes);
  }
};

const signin = async (req, res) => {
  try {
    const userExists = await userModel.findOne({ email: req.body.email });

    if (!userExists) {
      return res.status(400).json({ message: 'user does not exist' });
    }

    const checkPassword = await userExists.comparePassword(req.body.password);
    if (!checkPassword) {
      return res.status(400).json({ message: 'password is incorrect' });
    }

    if (!userExists.active) {
      return res.status(400).json({ message: 'user is not activated' });
    }

    const token = await tokenModel.create({
      userId: userExists._id,
      ip: req.ip,
      ua: req.headers['user-agent'],
    });

    const accessToken = jwt.sign(
      {
        id: token._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '180d' },
    );

    res.status(200).json({ accessToken });
  } catch (e) {
    res.status(400).json({ message: 'something went wrong' });
  }
};

const revoke = async (req, res) => {
  try {
    await tokenModel.deleteOne({ _id: req.user.token });

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
};

export default {
  signup,
  activation,
  activate,
  passwordResetLink,
  passwordReset,
  signin,
  revoke,
};
