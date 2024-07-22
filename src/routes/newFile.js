const { userController } = require('../controlles/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { userRouter } = require('./user.route.js');

userRouter.get('/', authMiddleware, userController.allUserActivated);
