import { Schema, model } from 'mongoose';

const resetSchema = new Schema({
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

export default model('reset', resetSchema);
