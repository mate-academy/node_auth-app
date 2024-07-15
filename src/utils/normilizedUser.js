export const normalizedUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};
