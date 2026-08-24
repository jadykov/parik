export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ status: z.enum(["new", "published", "hidden"]) });

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user) return error("Unauthorized", 401);
  const id = Number(params.id);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(parsed.error.message, 400);
  const r = await prisma.review.update({ where: { id }, data: { status: parsed.data.status } });
  return json(r);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const id = Number(params.id);
  await prisma.review.delete({ where: { id } });
  return json({ ok: true });
}
