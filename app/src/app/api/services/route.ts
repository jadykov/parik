export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { price: "asc" } });
  return json(services);
}

const schema = z.object({
  title: z.string().min(1),
  price: z.number().int().min(0),
  durationMin: z.number().int().min(1),
  description: z.string().nullable().optional()
});

export async function POST(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const body = await req.json();
  const parsed = schema.safeParse({ ...body, price: Number(body.price), durationMin: Number(body.durationMin) });
  if (!parsed.success) return error(parsed.error.message, 400);
  const s = await prisma.service.create({ data: parsed.data as any });
  return json(s, 201);
}
