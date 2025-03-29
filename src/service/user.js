import UserSchema from '../model/user.js';
import { bcryptService } from './bcrypt.js';
import { emailService } from './emails/sender.js';

const dto = ({ id, email, name }) => ({ id, email, name });

const create = ({ email, password, name, activationToken }) => {
  return UserSchema.create({
    email,
    password,
    name,
    activationToken,
  });
};

const findByEmail = ({ email }) => {
  return UserSchema.findOne({ where: { email } });
};

const findById = ({ id }) => {
  return UserSchema.findOne({ where: { id } });
};

const update = ({ data, id }) => {
  return UserSchema.update(data, { where: { id } })
    .then(([rowsUpdate]) => {
      if (rowsUpdate === 0) {
        throw new Error('Update failed');
      }

      return { success: true };
    })
    .catch((error) => {
      // console.log('error', error);

      return { success: false, error: error.message };
    });
};

const updatePassword = async (
  res,
  { password, newPassword, confirmPassword },
  dbUser,
) => {
  if (password && newPassword && confirmPassword) {
    const isPasswordCorrect = await bcryptService.isPasswordCorrect(
      password,
      dbUser.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).send({ error: 'Incorrect current password' });
    }

    return bcryptService.hashPassword(newPassword);
  }

  return null;
};

const updateEmail = async (res, { email, newEmail, password }, dbUser) => {
  if (email && newEmail && password) {
    const isPasswordCorrect = await bcryptService.isPasswordCorrect(
      password,
      dbUser.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).send({ error: 'Incorrect current password' });
    }

    if (dbUser.email !== email) {
      return res.status(401).send({ error: 'Incorrect current email' });
    }

    await emailService.sendChangeEmail({
      email,
      newEmail: newEmail,
    });

    return newEmail;
  }

  return null;
};

const updateName = ({ name }) => {
  return name || null;
};

export const userService = {
  dto,
  create,
  findByEmail,
  findById,
  update,
  updatePassword,
  updateEmail,
  updateName,
};
