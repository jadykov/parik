export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const where: any = {};
  // публичный: только published; админ видит все
  const user = await getUserFromRequest(req as any);
  if (!user) where.status = "published";
  else if (status) where.status = status;

  const items = await prisma.review.findMany({ where, orderBy: { createdAt: "desc" } });
  return json(items);
}

const createSchema = z.object({
  text: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  clientName: z.string().nullable().optional(),
  clientTelegramId: z.string().nullable().optional()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse({ ...body, rating: Number(body.rating) });
  if (!parsed.success) return error(parsed.error.message, 400);
  const r = await prisma.review.create({ data: { text: parsed.data.text, rating: parsed.data.rating, clientName: parsed.data.clientName || null, clientTelegramId: parsed.data.clientTelegramId || null, status: "new" } });
  return json(r, 201);
}
