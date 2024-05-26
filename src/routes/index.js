const { authRoutes } = require('../routes/routes.auth.js');
const { profileRoutes } = require('../routes/routes.profile.js');
const { resetRoutes } = require('../routes/routes.reset.js');
const { profileUpdateRoutes } = require('../routes/routes.change.js');

function registerRoutes(app) {
  app.use('/', authRoutes);
  app.use('/profile/', profileRoutes);
  app.use('/reset/', resetRoutes);
  app.use('/profile/change/', profileUpdateRoutes);
}

module.exports = registerRoutes;
