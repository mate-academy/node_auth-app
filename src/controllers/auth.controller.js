// ./auth.controller.js
import { user } from "../models/user.js";

export const activate = async (req, res) => {
  try {
    const { token } = req.params;

    const userToActivate = await user.findOne({ activationToken: token });
    if (!userToActivate) {
      return res.status(400).json({ message: "Invalid token" });
    }

    userToActivate.isActivated = true;
    userToActivate.activationToken = null;
    await userToActivate.save();

    res.redirect(process.env.CLIENT_HOST);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Activation failed" });
  }
};
