// import { ApiError } from '../exceptions/api.error.js';
// import { emailService } from '../services/email.service.js';
// import { emailChangesService } from '../services/emailChanges.service.js';
import { userService } from '../services/user.service.js';
// import { validateEmail } from '../validators/emailValidator.js';
// import { validateName } from '../validators/nameValidator.js';
// import { validatePassword } from '../validators/passwordValidator.js';
// import bcrypt from 'bcrypt';
// import { v4 as uuidv4 } from 'uuid';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

// const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { password, newPassword, email, newEmail } = req.body;

//   const user = await userService.getUserById(id);

//   if (!user) {
//     throw ApiError.badRequest('No such user');
//   }

//   const errors = {
//     password: validatePassword(password),
//     newPassword: validatePassword(newPassword),
//     email: validateEmail(email),
//     newEmail: validateEmail(newEmail),
//   };

//   if (password) {
//     if (errors.password) {
//       throw ApiError.badRequest('Bad request', errors);
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       throw ApiError.badRequest('Wrong password');
//     }
//   }

//   if (newPassword) {
//     if (errors.newPassword) {
//       throw ApiError.badRequest('Bad request', errors);
//     }

//     const hashedNewPass = await bcrypt.hash(newPassword, 10);

//     user.password = hashedNewPass;
//   }

//   if (email) {
//     if (errors.email) {
//       throw ApiError.badRequest('Bad request', errors);
//     }

//     const userByEmail = await userService.getUserByEmail(email);

//     if (!userByEmail) {
//       throw ApiError.badRequest('There is no user with this email');
//     }

//     if (userByEmail.email !== user.email) {
//       throw ApiError.badRequest('This is not your email address');
//     }
//   }

//   if (newEmail) {
//     if (errors.newEmail) {
//       throw ApiError.badRequest('Bad request', errors);
//     }

//     const userByNewEmail = await userService.getUserByEmail(newEmail);

//     if (userByNewEmail) {
//       throw ApiError.badRequest('This email is already being used');
//     }

//     if (newEmail === email) {
//       throw ApiError.badRequest('Emails cannot be the same');
//     }

//     const confirmNewEmailToken = uuidv4();

//     await emailChangesService.create({
//       userId: user.id,
//       oldEmail: email,
//       newEmail,
//       confirmNewEmailToken,
//     });

//     await emailService.sendConfirmNewEmail({
//       email,
//       newEmail,
//       confirmNewEmailToken,
//     });

//     await emailService.sendNotificationToOldEmail({ email, newEmail });
//   }

//   await user.save();

//   const normalizedUser = userService.normalize(user);

//   res.status(200);
//   res.send(normalizedUser);
// };

export const userController = {
  getAllActivated,
  // updateUser,
};
