export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isActive: user.isActive,
});
