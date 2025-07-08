import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/user.js';
import { userService } from '../services/userService.js';
import bcrypt from "bcrypt";
async function getAll(req, res, next) {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
};

async function changeName(req, res) {
  const userId = req.user.id;
  const {name} = req.body;
  
  if (!name || !name.trim()) {
    throw ApiError.BadRequest('Name is required');
  };

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }
  user.name = name;

  await user.save();
  res.json({message: 'Name has been succsessfully changed'});
};

async function changePassword(req, res) {

  const userId = req.user.id;

  const { oldPassword, newPassword } = req.body;

  const user = User.findByPk(userId);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  };

  const isMatch = bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({message: "Wrong password"});
  }

  const hashedPassword = bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();
  return res.status(200).json({message: "Password has been successfully changed"});
  
};

async function changeEmail(req, res) {
  const userId = req.user.id;

  const {newEmail, password} = req.body;

  const user = User.findByPk(userId);

  if (!user) {
    throw ApiError.BadRequest('No such user');
  };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
   return res.status(400).json({message: "Wrong password"});
  }

  user.email = newEmail;
  await user.save;
  return res.status(200).json("Email has been successfully changed");
  
}


export const userController = { getAll, changeName, changePassword, changeEmail };
