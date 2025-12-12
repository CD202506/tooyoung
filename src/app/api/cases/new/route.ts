export const dynamic = "force-dynamic";
export async function POST() {
  return new Response("Moved to pages/api", { status: 501 });
}
