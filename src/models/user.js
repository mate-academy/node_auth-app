// users.js //

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  isActivated: { type: Boolean, default: false },
  activationToken: { type: String },
});

export const user = mongoose.model("User", userSchema);
