function normalize({ id, name, email }) {
  const normalizeUser = { id: id, name: name, email: email };

  return normalizeUser;
}

export const userService = { normalize };
