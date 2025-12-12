export const dynamic = "force-dynamic";
export async function GET() {
  return new Response("Moved to pages/api", { status: 501 });
}
export async function PATCH() {
  return new Response("Moved to pages/api", { status: 501 });
}
