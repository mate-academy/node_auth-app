const create = (status, message) => {
  const err = new Error(message);

  err.status = status;

  return err;
};

const badRequest = (message) => create(400, message);
const unauthorized = (message) => create(401, message);
const forbidden = (message) => create(403, message);
const notFound = (message) => create(404, message);

export { badRequest, forbidden, notFound, unauthorized };
