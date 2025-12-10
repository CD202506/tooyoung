import { NextResponse } from "next/server";
import { validateShareAccess } from "@/lib/privacy";

type RouteContext = {
  params: { token: string };
};

export async function GET(_request: Request, context: RouteContext) {
  const token = context.params.token;
  const result = await validateShareAccess(token);

  if (!result.allowed) {
    if (result.reason === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (result.privacy === "limited") {
    return NextResponse.json({
      privacy: result.privacy,
      profile: result.profile,
      events: result.events,
      metrics: result.metrics ?? {},
    });
  }

  return NextResponse.json({
    privacy: result.privacy,
    profile: result.profile,
    events: result.events,
  });
}
