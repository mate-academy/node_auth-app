export const normalizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  };
};
