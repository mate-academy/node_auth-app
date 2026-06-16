const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    process.stdout.write('MongoDB connected ✅\n');
  } catch (error) {
    process.stderr.write(`MongoDB connection error: ${error.message}\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
