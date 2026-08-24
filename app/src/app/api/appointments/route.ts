export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  clientName: z.string().min(1),
  clientPhone: z.string().min(5),
  clientTelegramId: z.string().nullable().optional(),
  clientTelegramUsername: z.string().nullable().optional(),
  serviceId: z.number().int().nullable().optional(),
  date: z.string().min(5),
  time: z.string().min(3),
  comment: z.string().nullable().optional(),
  status: z.enum(["new", "confirmed", "done", "canceled"]).optional()
});

export async function GET(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user) return error("Unauthorized", 401);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");
  const where: any = {};
  if (status) where.status = status;
  if (date) where.date = date;
  const items = await prisma.appointment.findMany({ where, orderBy: { createdAt: "desc" }, include: { service: true } });
  return json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse({
    ...body,
    serviceId: body.serviceId ? Number(body.serviceId) : null
  });
  if (!parsed.success) return error(parsed.error.message, 400);
  const data = parsed.data;
  const appt = await prisma.appointment.create({
    data: {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientTelegramId: data.clientTelegramId || null,
      clientTelegramUsername: data.clientTelegramUsername || null,
      serviceId: data.serviceId || null,
      date: data.date,
      time: data.time,
      comment: data.comment || null,
      status: data.status || "new",
      source: data.clientTelegramId ? "telegram" : "site"
    }
  });
  return json(appt, 201);
}
