const { z } = require('zod');

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const nameSchema = z.string().min(2);

const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

module.exports = {
  registrationSchema,
};
