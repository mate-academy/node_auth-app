async function changePassword(req, res, next) {
  const { newPassword, userId } = req.body;

  const passwordErrors = validatePassword(newPassword);

  if (passwordErrors) {
    throw ApiError.BadRequest('Incorrect data', passwordErrors);
  }

  authSer;
}

export const updatePassword = async (email, newPassword) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw ApiError.NotFound();
  }

  const newHashedPassword = await hashPassword(newPassword);

  await user.update('password', newHashedPassword);
};
