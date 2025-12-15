import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * MVP MODE：
 * - 當 NEXT_PUBLIC_MVP_OPEN === "1"
 * - 全站放行（不檢查 cookie）
 * - 讓測試者可一路從公共層進到第二層
 */
const MVP_OPEN = process.env.NEXT_PUBLIC_MVP_OPEN === "1";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/features",
  "/about",
  "/contact",
  "/legal/privacy",
  "/legal/terms",
]);

function isAllowed(cookie: string | undefined) {
  if (!cookie) return false;
  const valid =
    process.env.TOOYOUNG_PASSWORDS?.split(",").map((s) => s.trim()) ?? [];
  const admin = process.env.TOOYOUNG_ADMIN_PASSWORD;
  return valid.includes(cookie) || cookie === admin;
}

export function middleware(req: NextRequest) {
  // TODO(Auth 暫停): temporarily disable gating for public bridge
  return NextResponse.next();

  // ? MVP 模式：全站放行
  if (MVP_OPEN) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("tooyoung_auth")?.value;
  const allowed = isAllowed(cookie);

  if (PUBLIC_PATHS.has(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Allow auth route
  if (req.nextUrl.pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  if (!allowed) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og-image.png).*)"],
};
