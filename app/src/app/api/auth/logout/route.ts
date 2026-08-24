export const dynamic = 'force-dynamic';
import { AUTH_COOKIE } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST() {
  const res = json({ ok: true });
  res.headers.set("Set-Cookie", `${AUTH_COOKIE.name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
