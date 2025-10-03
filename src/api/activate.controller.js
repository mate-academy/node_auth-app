const { db } = require('../utils/db');

const activate = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    const user = db.user.findUnique({ where: { id: Number(id) } });

    if (!user || !user.activationToken || user.activationToken !== token) {
      return res.status(400).json({ message: 'Invalid activation link' });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        activationToken: null,
      },
    });

    return res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { activate };
