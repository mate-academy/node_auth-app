export type NormalizedUser = { id: number; email: string };

export function isNormalizedUser(user: unknown): user is NormalizedUser {
  if (typeof user !== 'object' || user === null) {
    return false;
  }

  const candidate = user as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' && typeof candidate.email === 'string'
  );
}
