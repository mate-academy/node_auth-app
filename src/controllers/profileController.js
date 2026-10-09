const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/email');

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      oldPassword,
      newPassword,
      confirmation,
      email,
      passwordForEmail,
    } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Change Name
    if (name) {
      user.name = name;
    }

    // 2. Change Password (require old, new, confirmation)
    if (newPassword) {
      if (newPassword !== confirmation) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect old password' });
      }
      user.password = newPassword; // Mongoose pre-save hook handles hashing
    }

    // 3. Change Email (require password, new email, notify old email)
    if (email && email !== user.email) {
      const isMatch = await bcrypt.compare(passwordForEmail, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Incorrect password to change email' });
      }

      const oldEmail = user.email;

      user.email = email;

      // Notify old email
      await sendEmail(
        oldEmail,
        'Email Changed',
        'Your email has been updated successfully.',
      );
      // Optionally send a confirmation to the new email
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
