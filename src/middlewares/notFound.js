function notFound(req, res) {
  return res.status(404).send({ message: 'Not found' });
}

module.exports = {
  notFound,
};
