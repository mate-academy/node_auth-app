function normalizeUser({ id, email, firstName, lastName }) {
  return {
    id,
    email,
    firstName,
    lastName,
  };
}

export default normalizeUser;
