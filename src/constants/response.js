const response = {
  200: {
    statusCode: 200,
  },
  201: {
    statusCode: 201,
  },
  202: {
    statusCode: 202,
    message: {
      needAction: 'Additional action has to be done. Please check your email.',
    },
  },
  307: {
    statusCode: 307,
    to: {
      profile: './profile',
      main: '/',
    },
  },
  400: {
    statusCode: 400,
    messages: {
      verify: `Please signin and verify your email.`,
      credentials: `There is no user with such email address or credentials are invalid`,
    },
  },
  401: {
    statusCode: 401,
    messages: {
      unauthorized: `Please login to proceed.`,
      unauthorizedSignin: `Please signin to proceed.`,
    },
  },
  404: {
    statusCode: 404,
    messages: {
      notFound: 'Page not found.',
      noUser: 'No user was found.',
    },
  },
};

module.exports = { response };
