const {
  findUserById,
  updateUser,
  updateUserPassword,
  changeUserEmail,
} = require('../services/userService');
const { sendEmailChangeNotification } = require('../services/emailService');

const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const updatedUser = await updateUser(req.user.id, { name });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const updatedUser = await updateUserPassword(
      req.user.id,
      oldPassword,
      newPassword,
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error.message === 'Invalid current password') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const changeEmail = async (req, res, next) => {
  try {
    const { password, newEmail } = req.body;
    const oldEmail = req.user.email;

    const updatedUser = await changeUserEmail(req.user.id, password, newEmail);

    // Send notification to old email
    await sendEmailChangeNotification(oldEmail, newEmail);

    res.json({
      success: true,
      message:
        'Email changed successfully. A notification has been sent to your old email.',
      data: updatedUser,
    });
  } catch (error) {
    if (
      error.message === 'Invalid password' ||
      error.message === 'Email already in use'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
};
