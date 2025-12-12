import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
