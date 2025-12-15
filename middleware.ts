import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MVP_MODE = process.env.NEXT_PUBLIC_MVP_OPEN === "1";

function isAllowed(cookie: string | undefined) {
  if (!cookie) return false;
  const valid =
    process.env.TOOYOUNG_PASSWORDS?.split(",").map((s) => s.trim()) ?? [];
  const admin = process.env.TOOYOUNG_ADMIN_PASSWORD;
  return valid.includes(cookie) || cookie === admin;
}

export function middleware(req: NextRequest) {
  // MVP 模式：全站放行
  if (MVP_MODE) {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  const publicPaths = new Set<string>([
    "/",
    "/login",
    "/about",
    "/features",
    "/contact",
  ]);
  const publicPrefixes = ["/legal", "/timeline", "/symptoms", "/tags", "/share"];
  const systemPrefixes = ["/cases", "/dashboard", "/summary", "/analytics", "/scales"];

  const isPublicExact = publicPaths.has(pathname);
  const isPublicPrefix = publicPrefixes.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`),
  );

  // 公開/入口層放行
  if (isPublicExact || isPublicPrefix) {
    return NextResponse.next();
  }

  // auth API 放行
  if (pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  const hasDemoKey =
    Boolean(req.cookies.get("tooyoung_auth")?.value) ||
    Boolean(req.cookies.get("tooyoung_demo")?.value);

  const isSystemRoute = systemPrefixes.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isSystemRoute && !hasDemoKey) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // 登入驗證
  const cookie = req.cookies.get("tooyoung_auth")?.value;
  const allowed = isAllowed(cookie);

  if (!allowed) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og-image.png).*)"],
};
