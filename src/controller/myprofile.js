const { transport } = require('../config/mailconfig.js');
const { User } = require('../models/Users.js');
const bcrypt = require('bcrypt');

async function myProfile(req, res) {
  try {
    const user = req.user;

    return res.status(200).json({ message: 'authenticated user', user });
  } catch (error) {
    res.status(500).json({ message: 'Error: user without permission', error });
  }
}

async function editMyProfileName(req, res) {
  try {
    const { name } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(400).json({ message: 'user not exist' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'name not valid' });
    }

    const userUpdate = await user.update({ name });

    return res.status(201).json({ message: 'edit name sucess', userUpdate });
  } catch (error) {
    res.status(500).json({ message: 'error edit Name date user' });
  }
}

async function editMyProfilePassword(req, res) {
  try {
    const { password, newPassword, confirmPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(400).json({ message: 'user not exist' });
    }

    if (!newPassword || newPassword.trim() === '' || newPassword.length < 8) {
      return res.status(400).json({ message: 'new Password not valid' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'passwords do not match' });
    }

    const isOldPassword = await bcrypt.compare(password, user.password);

    if (!isOldPassword) {
      return res.status(400).json({ message: 'old Password not valid' });
    }

    if (!user.is_active) {
      return res.status(400).json({ message: 'user not active' });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashNewPassword,
    });

    return res.status(200).json({ message: 'new Password sucess' });
  } catch (error) {
    res.status(500).json({ message: 'error edit Password date user' });
  }
}

async function editMyProfileEmail(req, res) {
  try {
    const { password, newEmail, confirmEmail } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    if (!newEmail || newEmail.trim() === '') {
      return res.status(400).json({ message: 'new email not valid' });
    }

    if (newEmail !== confirmEmail) {
      return res.status(400).json({ message: 'email do not match' });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(400).json({ message: 'password not valid' });
    }

    const isNewEmailExist = await User.findOne({
      where: {
        email: newEmail,
      },
    });

    if (isNewEmailExist) {
      return res.status(400).json({ message: 'new email not valid user' });
    }

    const oldEmail = user.email;

    const emailUpdate = await user.update({
      email: newEmail,
    });

    await transport.sendMail({
      from: '"A Minha Aplicação" <no-reply@exemplo.com>',
      to: oldEmail,
      subject: 'email notification regarding a change of email address',
      text: `Olá ${user.name},`,
      html: `<p>Olá <b>${user.name}</b>,Email address successfully changed </p>`,
    });

    return res.status(200).json({ message: 'new email sucess', emailUpdate });
  } catch (error) {
    res.status(500).json({ message: 'error edit Email date user' });
  }
}

module.exports = {
  myProfile,
  editMyProfileName,
  editMyProfilePassword,
  editMyProfileEmail,
};
