export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  durationMin: z.number().int().min(1).optional(),
  description: z.string().nullable().optional()
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const id = Number(params.id);
  const body = await req.json();
  const parsed = schema.safeParse({ ...body, price: body.price !== undefined ? Number(body.price) : undefined, durationMin: body.durationMin !== undefined ? Number(body.durationMin) : undefined });
  if (!parsed.success) return error(parsed.error.message, 400);
  const s = await prisma.service.update({ where: { id }, data: parsed.data as any });
  return json(s);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const id = Number(params.id);
  await prisma.service.delete({ where: { id } });
  return json({ ok: true });
}
