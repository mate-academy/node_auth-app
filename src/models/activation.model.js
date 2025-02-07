import { Schema, model } from 'mongoose';

const activationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  expires: {
    type: Number,
    required: true,
    default: () => Date.now() + 24 * 60 * 60 * 1000,
  },
});

export default model('activation', activationSchema);
