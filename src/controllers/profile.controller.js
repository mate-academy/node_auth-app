import * as userModel from '../services/user.service.js';

const getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(userModel.normalizeUser(user));
  } catch (err) {
    return res.status(500).json({ message: 'Cannot fetch user data' });
  }
};

export const profileController = {
  getProfile,
};
