export type NormalizedUser = ReturnType<typeof normalizeUser>;

export const normalizeUser = ({ id, name, email }) => {
  return { id, name, email };
}