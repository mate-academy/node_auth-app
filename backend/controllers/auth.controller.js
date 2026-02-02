// ./auth.controller.js
import { user } from "../models/user.js";

export const activate = async (req, res) => {
  try {
    const { token } = req.params;

    const userToActivate = await user.findOne({ activationToken: token });
    if (!userToActivate) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (userToActivate.isActivated) {
      return res.status(400).json({ message: "User already activated" });
    }

    userToActivate.isActivated = true;
    userToActivate.activationToken = null;
    await userToActivate.save();

    const clientHost = process.env.CLIENT_HOST || "http://localhost:3000";
    return res.redirect(clientHost);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Activation failed" });
  }
};
