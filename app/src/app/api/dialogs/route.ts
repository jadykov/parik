export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req as any);
  if (!user) return error("Unauthorized", 401);
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 500);
  const items = await prisma.dialog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return json(items);
}
