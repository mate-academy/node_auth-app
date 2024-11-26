export const password = { isLength: { options: { min: 8, max: 40 } } };

export const name = {
  isLength: { options: { min: 3, max: 20 } },
  trim: true,
  notEmpty: true,
};
