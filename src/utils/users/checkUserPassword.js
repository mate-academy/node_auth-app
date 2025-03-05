const { ApiError } = require('../../exeptions/auth.error');
const { checkPassword } = require('../password/checkPassword');
const { passwordSchema } = require('../validation/password');

const checkUserPassword = async (
  oldPass,
  currentPass,
  newPass,
  confirmPass,
) => {
  if (!(oldPass && newPass && confirmPass)) {
    throw ApiError.badRequest(
      'Old,new and confirmed password is required for change password',
    );
  }

  if (!(await checkPassword(oldPass, currentPass))) {
    throw ApiError.badRequest('The old password is incorrect');
  }

  if (newPass !== confirmPass) {
    throw ApiError.badRequest(
      'The new password must match the confirmed password.',
    );
  }

  await passwordSchema.validate({ password: newPass });
};

module.exports = { checkUserPassword };
