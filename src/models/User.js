import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cryptoModule from 'crypto';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: false,
      select: false,
    },
    activationToken: String,
    activationExpires: Date,
    socialAccounts: [
      {
        provider: String,
        providerId: String,
      },
    ],
  },
  { timestamps: true },
);

// Password encryption middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate activation token
userSchema.methods.createActivationToken = function () {
  const activationToken = crypto.randomBytes(32).toString('hex');

  this.activationToken = crypto
    .createHash('sha256')
    .update(activationToken)
    .toString('hex');
  this.activationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return activationToken;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = cryptoModule
    .createHash('sha256')
    .update(resetToken)
    .toString('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default mongoose.model('User', userSchema);
