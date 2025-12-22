import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { validate } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';

const getAll = async (req, res) => {
  try {
    const users = await userService.getAllActive();
    const normalized = users.map(userService.normalize);

    return res.json(normalized);
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

const updateNameOrPassword = async (req, res) => {
  const userId = req.user.id;
  const { userName, pwd, newPwd, confrm } = req.body;

  const updateData = {};
  let isPasswordValid = false;

  const userData = await userService.getByUserId(userId);

  if (!userData) {
    return res.status(404).send({
      message: 'user not found',
    });
  }

  const userNameNormalized = (userName || '').trim();

  if (userNameNormalized) {
    const NameValidErrorMessage = validate.name(userNameNormalized);

    if (!NameValidErrorMessage) {
      updateData.userName = userNameNormalized;
    } else {
      return res.status(400).send({
        message: NameValidErrorMessage,
      });
    }
  }

  if (pwd && newPwd && confrm) {
    const passwordVaildError = validate.password(newPwd);
    const isComare = newPwd === confrm;

    isPasswordValid = await bcrypt.compare(pwd, userData.password);

    if (!isPasswordValid) {
      return res.status(400).send({
        message: 'need current password',
      });
    }

    if (passwordVaildError || !isComare) {
      return res.status(400).send({
        message: 'Invalid new password or confrm',
      });
    }

    if (isPasswordValid && !passwordVaildError && isComare) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPwd, saltRounds);

      updateData.password = hashedPassword;
    }
  }

  try {
    if (Object.keys(updateData).length > 0) {
      await userService.update(userId, updateData);

      return res.status(200).send({
        message: 'Updated!',
      });
    }

    return res.status(204).send({
      message: 'No Content',
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
};

const updateEmail = async (req, res) => {
  const userId = req.user.id;
  const { pwd, newEmail } = req.body;

  if (!pwd || !newEmail) {
    return res.status(400).send({
      message: 'not found require params',
    });
  }

  const userData = await userService.getByUserId(userId);

  if (!userData) {
    return res.status(404).send({
      message: 'user not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(pwd, userData.password);

  if (!isPasswordValid) {
    return res.status(400).send({
      message: 'Invalid current password',
    });
  }

  const hasEmailError = validate.email(newEmail);

  if (hasEmailError) {
    return res.status(400).send({
      message: 'Invalid new email',
    });
  }

  const activationToken = uuidv4();
  const tokenActivationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  try {
    await userService.update(userId, {
      tokenActivationExpires: tokenActivationExpires,
      activationToken: activationToken,
      pendingEmail: newEmail,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }

  try {
    await emailService.sendEmail({
      email: newEmail,
      type: 'Activation',
      token: activationToken,
    });

    await emailService.sendEmail({
      email: userData.email,
      type: 'Update',
    });

    return res.status(200).send({
      message: 'Check new email to confirm',
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

export const userController = {
  getAll,
  updateNameOrPassword,
  updateEmail,
};
