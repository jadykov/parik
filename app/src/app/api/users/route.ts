export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user) return error("Unauthorized", 401);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, login: true, role: true, name: true, createdAt: true } });
  return json(users);
}

const schema = z.object({
  login: z.string().min(2),
  password: z.string().min(4),
  role: z.enum(["admin", "employee"]),
  name: z.string().min(1)
});

export async function POST(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.message, 400);
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const created = await prisma.user.create({ data: { login: parsed.data.login, passwordHash: hash, role: parsed.data.role, name: parsed.data.name } });
  return json({ id: created.id, login: created.login, role: created.role, name: created.name }, 201);
}
