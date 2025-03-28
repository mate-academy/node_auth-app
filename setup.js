const { Token } = require('./src/models/token.js');
const { User } = require('./src/models/user.js');


const syncModels = async () => {
  try {
    await User.sync({ force: true });

    await Token.sync({ force: true });
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

syncModels();
