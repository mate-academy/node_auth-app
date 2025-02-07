import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { isEmail, isStrongPassword } from '../utils/check.js';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (v) => isEmail(v),
      message: () => 'Invalid email',
    },
  },
  active: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (v) => isStrongPassword(v),
    },
  },
});

userSchema.pre('save', function pre(next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (!err) {
        bcrypt.hash(user.password.trim(), salt, (err2, hash) => {
          if (!err2) {
            user.password = hash;
            next();
          } else {
            next(err2);
          }
        });
      } else {
        next(err);
      }
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password.trim());
};

export default model('user', userSchema);
