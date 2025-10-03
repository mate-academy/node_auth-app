const { db } = require('../utils/db');

const activate = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const user = await db.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user || user.activationToken !== token) {
      return res.status(400).json({ message: 'Invalid activation link' });
    }

    await db.user.update({
      where: { id: user.id },
      data: { isActive: true, activationToken: null },
    });

    return res.redirect(process.env.CLIENT_URL + '/profile');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Activation error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { activate };
