const zod = (err, res) => {
  const issue = err.errors.length === 1 ? 'issue' : 'issues';

  const formattedErrors = {
    [issue]: err.errors.reduce((acc, { path, message, code }) => {
      const field = path[0];

      if (!acc[field]) {
        acc[field] = {};
      }

      if (!acc[field][code]) {
        acc[field][code] = [];
      }
      acc[field][code].push(message);

      return acc;
    }, {}),
  };

  return res.status(400).send(formattedErrors);
};

export default zod;
