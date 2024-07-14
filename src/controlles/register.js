import uuid4 from "uuid4";
import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const activationToken = uuid4();

  try {
    const newUser = await User.create({ email, password, name, activationToken });
    await emailService.sendActivationEmail(email, activationToken);
    res.send(newUser);
  } catch (err) {
    res.status(500).send(err);
  }
};
