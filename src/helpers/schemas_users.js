/* eslint-disable max-len */
import Joi from 'joi';

const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

const profileUserSchema = Joi.object({
  name: Joi.string().optional().messages({
    'string.empty': 'Name must be a string',
  }),
  email: Joi.string().email().optional().messages({
    'string.empty': 'Email must be a string',
    'string.email': 'Invalid email',
  }),
  password: Joi.string().optional().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: Joi.string().optional().messages({
    'string.empty': 'Current newPassword is required',
  }),
  confirmation: Joi.string().optional().messages({
    'string.empty': 'Confirmation is required',
  }),
});

export const Schemas = {
  createUserSchema,
  loginUserSchema,
  profileUserSchema,
};
