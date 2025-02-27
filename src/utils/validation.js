import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const passwordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const changeNameSchema = Joi.object({
  newName: Joi.string().min(2).max(50).required(),
});

export const validationSchemas = {
  userSchema,
  loginSchema,
  emailSchema,
  passwordSchema,
  changeNameSchema,
};
