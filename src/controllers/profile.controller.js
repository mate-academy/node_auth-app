import { profileService } from '../services/profile.service.js';

const getProfile = async (req, res) => {
  const { id } = req.params;
  const user = await profileService.getUserById(id);

  res.send(user);
};

export const profileController = {
  getProfile,
};
