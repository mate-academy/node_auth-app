import { jwtVerify } from 'jose';

export async function verifyAccessToken(
  token: string,
): Promise<{ id: number } | null> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const id = payload.id;
    if (typeof id !== 'number') return null;
    return { id };
  } catch {
    return null;
  }
}
