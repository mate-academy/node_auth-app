export const normalizeUser = ({ id, name, email, activationToken }) => ({
  id,
  name,
  email,
  isActive: !Boolean(activationToken),
});
