export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const rows = await prisma.knowledgeBase.findMany();
  return json(rows);
}

const schema = z.object({ key: z.string().min(1), value: z.string().min(1) });

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user || user.role !== "admin") return error("Forbidden", 403);
  const body = await req.json();
  // поддержка массива или одного
  const items = Array.isArray(body) ? body : [body];
  const result = [];
  for (const item of items) {
    const parsed = schema.safeParse(item);
    if (!parsed.success) return error(parsed.error.message, 400);
    const r = await prisma.knowledgeBase.upsert({
      where: { key: parsed.data.key },
      update: { value: parsed.data.value },
      create: parsed.data
    });
    result.push(r);
  }
  return json(result);
}
