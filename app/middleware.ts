import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "dev-secret-change-in-prod-1234567890");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isApiAdmin = pathname.startsWith("/api/admin") || pathname.startsWith("/api/users") || pathname.startsWith("/api/dialogs");
  const isAuthApi = pathname.startsWith("/api/auth");

  if (isAuthApi) return NextResponse.next();

  // Публичные API
  const publicApi = ["/api/services", "/api/knowledge", "/api/reviews"];
  const isPublicGet = req.method === "GET" && publicApi.some((p) => pathname.startsWith(p));
  if (isPublicGet) return NextResponse.next();
  if (pathname === "/api/appointments" && req.method === "POST") return NextResponse.next(); // создание из бота/формы
  if (pathname === "/api/reviews" && req.method === "POST") return NextResponse.next();

  if (!isAdmin && !isApiAdmin) return NextResponse.next();

  const token = req.cookies.get("barber_token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    if (isAdmin) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = (payload as any).role;
    // employee не может в users/dialogs/knowledge PUT
    if (isApiAdmin && pathname.startsWith("/api/users") && role !== "admin" && req.method !== "GET") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  } catch {
    if (isAdmin) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"]
};
