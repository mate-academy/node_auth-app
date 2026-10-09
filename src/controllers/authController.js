const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodeCrypto = require('crypto');
const { sendEmail } = require('../utils/email');
const { generateToken } = require('../utils/token');

// Strong password rule: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Password validation
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and ' +
          'include an uppercase letter, a lowercase letter, and a number.',
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 3. Create the user
    const user = new User({ name, email, password });

    // 4. Generate activation token
    const token = nodeCrypto.randomBytes(32).toString('hex');

    // 5. Attach token to user and save
    user.activationToken = token;
    await user.save();

    // 6. Send activation email
    const activationLink = `${process.env.CLIENT_URL}/activate/${token}`;

    await sendEmail(
      email,
      'Activate your account',
      `Click here: ${activationLink}`,
    );

    res.status(201).json({
      message: 'Registration successful. Please check your email to activate.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.activate = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ activationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isActive = true;
    user.activationToken = undefined; // Clear the token
    await user.save();

    res.json({ message: 'Account activated successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: 'Please activate your email first.' });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({ token, message: 'Login successful.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  // With JWT, logout is handled client-side by deleting the token.
  res.json({ message: 'Logged out successfully.' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = nodeCrypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      'Password Reset',
      `Click here to reset: ${resetLink}`,
    );

    res.json({ message: 'Email sent. Please check your inbox.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmation } = req.body;

    if (password !== confirmation) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res
        .status(400)
        .json({ message: 'Password does not meet requirements' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password; // Pre-save hook will hash this
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
