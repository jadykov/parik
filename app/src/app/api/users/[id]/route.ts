export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["admin", "employee"]).optional(),
  name: z.string().min(1).optional(),
  password: z.string().min(4).optional()
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const id = Number(params.id);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.message, 400);
  const data: any = {};
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const updated = await prisma.user.update({ where: { id }, data });
  return json({ id: updated.id, login: updated.login, role: updated.role, name: updated.name });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const id = Number(params.id);
  if (user.id === id) return error("Нельзя удалить себя", 400);
  await prisma.user.delete({ where: { id } });
  return json({ ok: true });
}
