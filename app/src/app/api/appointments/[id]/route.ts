export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["new", "confirmed", "done", "canceled"]).optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  comment: z.string().nullable().optional(),
  serviceId: z.number().int().nullable().optional()
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user) return error("Unauthorized", 401);
  const id = Number(params.id);
  const body = await req.json();
  const parsed = updateSchema.safeParse({ ...body, serviceId: body.serviceId !== undefined ? (body.serviceId ? Number(body.serviceId) : null) : undefined });
  if (!parsed.success) return error(parsed.error.message, 400);
  const appt = await prisma.appointment.update({ where: { id }, data: parsed.data as any });
  return json(appt);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req as any);
  if (!user) return error("Unauthorized", 401);
  if (user.role !== "admin") return error("Forbidden", 403);
  const id = Number(params.id);
  await prisma.appointment.delete({ where: { id } });
  return json({ ok: true });
}
