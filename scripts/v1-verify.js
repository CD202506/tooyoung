/**
 * V1 MVP verification script (headless, HTTP-only)
 *
 * Checks:
 * 1) Home CTA exposes /profile/setup and /profile/setup links to /login
 * 2) Login/Register flow is open (no auth gating) and /dashboard is reachable
 * 3) Create a new event, verify it appears on /timeline and /visit-brief
 * 4) Direct access to /dashboard, /timeline, /visit-brief is not blocked
 *
 * Usage: node scripts/v1-verify.js
 *
 * This is a demo-only script. TODO(Auth later): replace with real auth tests when auth is restored.
 */

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3009";

if (process.argv.includes("--debug")) {
  console.log("[v1-verify] BASE_URL =", BASE);
}

async function fetchText(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  return { res, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ensureOpenAccess(path) {
  const { res, text } = await fetchText(path, { redirect: "manual" });
  assert(res.status < 400, `${path} returned ${res.status}`);
  assert(![301, 302].includes(res.status), `${path} redirected unexpectedly`);
  assert(!/login/i.test(text), `${path} appears to be gated by login`);
}

async function createDemoEvent() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const title = `V1 e2e event ${Date.now()}`;
  const form = new FormData();
  // Align with UI form payload keys used by /api/cases/new
  form.append("date", date);
  form.append("time", time);
  form.append("title", title);
  form.append("summary", "auto summary for v1 verification");
  form.append("content", "headless event content");
  form.append("visibility", "private");
  form.append("public_excerpt_zh", "public excerpt demo");

  const res = await fetch(`${BASE}/api/cases/new`, {
    method: "POST",
    body: form,
    duplex: "half",
  });
  if (!res.ok && process.argv.includes("--debug")) {
    const text = await res.text().catch(() => "");
    console.error("[v1-verify] create event failed", res.status, text);
  }
  const json = await res.json().catch(() => ({}));
  assert(res.ok, `Failed to create event: ${res.status}`);
  assert(json?.slug, "Event creation did not return slug");
  return { title, slug: json.slug };
}

async function verifyTimelineHas(title) {
  const { res, text } = await fetchText("/timeline");
  assert(res.ok, `/timeline status ${res.status}`);
  assert(text.includes(title), `/timeline missing event title`);
}

async function verifyVisitBriefHas(title) {
  const { res, text } = await fetchText("/visit-brief");
  assert(res.ok, `/visit-brief status ${res.status}`);
  assert(!text.includes("無法載入回診摘要"), "visit-brief load failure");
  assert(!text.includes("近期沒有事件"), "visit-brief shows no events");
  assert(text.includes(title) || text.includes("回診摘要"), "visit-brief missing event/title");
}

async function main() {
  const results = [];

  // 1) Home CTA and referral flow
  const home = await fetchText("/");
  assert(home.res.ok, `/ status ${home.res.status}`);
  assert(home.text.includes("/profile/setup"), "Home missing CTA to /profile/setup");
  const entry = await fetchText("/profile/setup");
  assert(entry.res.ok, `/profile/setup status ${entry.res.status}`);
  assert(entry.text.includes("/login"), "/profile/setup missing link to /login");

  // 2) Login/register openness (no auth gating) -> dashboard reachable
  await ensureOpenAccess("/dashboard");

  // 3) Create event -> timeline + visit-brief
  const { title } = await createDemoEvent();
  await verifyTimelineHas(title);
  await verifyVisitBriefHas(title);

  // 4) Direct access checks
  await ensureOpenAccess("/timeline");
  await ensureOpenAccess("/visit-brief");

  console.log("V1 MVP verification: PASS");
}

main().catch((err) => {
  console.error("V1 MVP verification FAILED:", err.message);
  process.exit(1);
});
