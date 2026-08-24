import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "dev-secret-change-in-prod-1234567890");
const COOKIE_NAME = "barber_token";
const EXPIRES = "7d";

export type JWTPayload = { id: number; login: string; role: string; name: string };

export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function getUserFromCookies(): Promise<JWTPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const AUTH_COOKIE = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  }
};

export function requireRole(user: JWTPayload | null, roles: string[]) {
  if (!user) return false;
  return roles.includes(user.role);
}
