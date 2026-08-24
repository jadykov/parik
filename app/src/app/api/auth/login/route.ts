export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { error, json } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({ login: z.string().min(1), password: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("login и password обязательны", 400);
  const { login, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { login } });
  if (!user) return error("Неверный логин или пароль", 401);
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return error("Неверный логин или пароль", 401);
  const token = await signToken({ id: user.id, login: user.login, role: user.role, name: user.name });
  const res = json({ id: user.id, login: user.login, role: user.role, name: user.name });
  res.headers.set("Set-Cookie", `${AUTH_COOKIE.name}=${token}; Path=${AUTH_COOKIE.options.path}; HttpOnly; SameSite=${AUTH_COOKIE.options.sameSite}; Max-Age=${AUTH_COOKIE.options.maxAge}${AUTH_COOKIE.options.secure ? "; Secure" : ""}`);
  return res;
}
