import { Schema, model } from 'mongoose';

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  ip: {
    type: String,
    required: true,
  },
  ua: {
    type: String,
    required: true,
  },
  expires: {
    type: Number,
    required: true,
    default: () => Date.now() + 24 * 60 * 60 * 1000,
  },
});

export default model('token', tokenSchema);
