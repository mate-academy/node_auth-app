export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
