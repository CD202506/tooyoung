export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };

  const valid =
    process.env.TOOYOUNG_PASSWORDS?.split(",").map((s) => s.trim()) ?? [];
  const admin = process.env.TOOYOUNG_ADMIN_PASSWORD;

  const ok = Boolean(password) && (valid.includes(password as string) || password === admin);

  if (!ok) {
    return NextResponse.json({ ok: false });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("tooyoung_auth", password as string, {
    path: "/",
    httpOnly: false,
  });
  return res;
}
