import { User } from "../models/User.model.js";

export function findByEmail(email) {
  return User.findOne({ where: { email }});
}