const unknownEndpoint = (req, res) => {
  res.status(404).send({ message: 'unknown endpoint' });
};

module.exports = {
  unknownEndpoint,
};
