import userModel from '../models/user.model.js';
import { sendEmailChangedEmail } from '../utils/email.js';

const userInfo = async (req, res) => {
  try {
    res.status(200).json({
      name: req.user.name,
      email: req.user.email,
    });
  } catch (e) {
    res.sendStatus(400);
  }
};

const changeName = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      throw new Error('Invalid user');
    }

    if (!req.body.name) {
      throw new Error('Name is required');
    } else if (req.body.name === user.name) {
      throw new Error('Name is the same');
    } else if (req.body.name === '') {
      throw new Error('Name cannot be empty');
    }

    user.name = req.body.name;

    await user.save();

    res.json({ name: user.name });
  } catch (e) {
    res.status(400).json({ general: 'Something went wrong' });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      throw new Error('Invalid user');
    }

    if (!req.body.password) {
      throw new Error('Password is required');
    } else if (req.body.password === req.body.newPassword) {
      throw new Error('New password is the same as the old one');
    } else if (req.body.password === '') {
      throw new Error('Password cannot be empty');
    }

    const isMatch = await user.comparePassword(req.body.password);

    if (!isMatch) {
      throw new Error('Invalid password');
    }

    user.password = req.body.newPassword;

    await user.save();

    res.sendStatus(200);
  } catch (e) {
    const errRes = {};

    if (e.message === 'Invalid user') {
      errRes.general = 'Something went wrong';
    } else if (e.message === 'Password is required') {
      errRes.password = 'Password is required';
    } else if (e.message === 'New password is the same as the old one') {
      errRes.newPassword = 'New password is the same as the old one';
    } else if (e.message === 'Password cannot be empty') {
      errRes.password = 'Password cannot be empty';
    } else if (e.message === 'Invalid password') {
      errRes.password = 'Invalid password';
    } else {
      errRes.general = 'Something went wrong';
    }

    res.status(400).json(errRes);
  }
};

const changeEmail = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      throw new Error('Invalid user');
    }

    if (!req.body.email) {
      throw new Error('Email is required');
    } else if (req.body.email === user.email) {
      throw new Error('Email is the same');
    } else if (req.body.email === '') {
      throw new Error('Email cannot be empty');
    }

    user.email = req.body.email;

    await user.save();

    sendEmailChangedEmail(user);

    res.json({ email: user.email });
  } catch (e) {
    res.status(400).json({ general: 'Something went wrong' });
  }
};

export default {
  userInfo,
  changeName,
  changePassword,
  changeEmail,
};
