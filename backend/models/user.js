import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    isActivated: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export const user = mongoose.model("User", userSchema);
