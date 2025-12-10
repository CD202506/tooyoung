import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

async function main() {
  const db = new Database(path.join(process.cwd(), "db", "tooyoung.db"));

  console.log("\n[Folders]");
  const folders = ["data/cases", "db", "src/app/api", "src/components"];

  for (const folder of folders) {
    const exists = fs.existsSync(path.join(process.cwd(), folder));
    console.log(exists ? `OK ${folder} exists` : `FAIL ${folder} missing`);
  }

  console.log("\n[SQLite]");
  const tables = ["cases_index", "tags_index", "cases_fts"];
  for (const table of tables) {
    try {
      db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get();
      console.log(`OK ${table} found`);
    } catch {
      console.log(`FAIL ${table} missing`);
    }
  }

  try {
    db.prepare("SELECT 1 FROM case_profiles LIMIT 1").get();
    console.log("OK case_profiles found");
  } catch {
    console.log("FAIL case_profiles missing");
  }

  try {
    const columns = db
      .prepare("PRAGMA table_info('case_profiles')")
      .all() as Array<{ name: string }>;
    const names = new Set(columns.map((c) => c.name));
    const required = [
      "id",
      "display_name",
      "nickname",
      "preferred_language",
      "share_mode",
      "share_token",
      "created_at",
      "updated_at",
    ];
    const missing = required.filter((c) => !names.has(c));
    console.log(missing.length === 0 ? "OK case_profiles columns present" : `FAIL case_profiles missing columns: ${missing.join(", ")}`);
  } catch {
    console.log("FAIL case_profiles missing columns check failed");
  }

  try {
    const row = db
      .prepare("SELECT COUNT(*) as count FROM case_profiles WHERE id = 1")
      .get() as { count: number };
    console.log(row.count > 0 ? "OK case_profiles has id=1" : "FAIL case_profiles missing id=1");
  } catch {
    console.log("FAIL case_profiles missing id=1");
  }

  try {
    const hasCaseId = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'")
      .get();
    console.log(hasCaseId ? "OK cases_index.case_id present" : "FAIL cases_index.case_id missing");
  } catch {
    console.log("FAIL cases_index.case_id missing");
  }

  try {
    const columns = db
      .prepare("PRAGMA table_info('cases_index')")
      .all() as Array<{ name: string }>;
    const names = new Set(columns.map((c) => c.name));
    const required = ["case_id", "tags", "images", "symptom_categories", "share_mode", "share_token"];
    const missing = required.filter((c) => !names.has(c));
    console.log(missing.length === 0 ? "OK cases_index columns present" : `FAIL cases_index missing columns: ${missing.join(", ")}`);
  } catch {
    console.log("FAIL cases_index columns check failed");
  }

  try {
    const rows = db
      .prepare(
        "SELECT id, case_id, share_mode, symptom_categories FROM cases_index",
      )
      .all() as Array<{ id: string; case_id: number | null; share_mode?: string | null; symptom_categories?: string | null }>;

    const validModes = new Set(["private", "public", "token", "protected"]);
    let caseIdMissing = false;
    let modeInvalid = false;
    let symptomInvalid = false;

    for (const row of rows) {
      if (row.case_id === null || row.case_id === undefined) caseIdMissing = true;
      if (row.share_mode && !validModes.has(row.share_mode)) modeInvalid = true;
      if (row.symptom_categories) {
        try {
          const parsed = JSON.parse(row.symptom_categories);
          if (!Array.isArray(parsed)) symptomInvalid = true;
        } catch {
          symptomInvalid = true;
        }
      }
    }

    console.log(caseIdMissing ? "FAIL Some cases missing case_id" : "OK cases have case_id");
    console.log(modeInvalid ? "FAIL Invalid share_mode values" : "OK share_mode values valid");
    console.log(symptomInvalid ? "FAIL symptom_categories not JSON array" : "OK symptom_categories valid JSON array");
  } catch {
    console.log("FAIL cases row validation failed");
  }

  try {
    const hasShareToken = db
      .prepare("SELECT 1 FROM pragma_table_info('case_profiles') WHERE name = 'share_token'")
      .get();
    console.log(hasShareToken ? "OK case_profiles.share_token present" : "FAIL case_profiles.share_token missing");
  } catch {
    console.log("FAIL case_profiles.share_token missing");
  }

  try {
    const list = db
      .prepare("SELECT name FROM pragma_index_list('case_profiles')")
      .all() as Array<{ name: string }>;
    const exists = list.some((i) => i.name === "idx_case_profiles_token");
    console.log(exists ? "OK idx_case_profiles_token present" : "FAIL idx_case_profiles_token missing");
  } catch {
    console.log("FAIL idx_case_profiles_token missing");
  }

  try {
    const rows = db
      .prepare("SELECT COUNT(*) as count FROM case_profiles WHERE privacy_level IN ('private','limited','public')")
      .get() as { count: number };
    const total = db.prepare("SELECT COUNT(*) as count FROM case_profiles").get() as { count: number };
    const ok = total.count === rows.count;
    console.log(ok ? "OK privacy_level values valid" : "FAIL privacy_level has invalid values");
  } catch {
    console.log("FAIL privacy_level validation failed");
  }

  console.log("\n[JSON Cases]");
  const casesDir = path.join(process.cwd(), "data/cases");
  const files = fs.readdirSync(casesDir).filter((f) => f.endsWith(".json"));
  console.log(`OK ${files.length} files parsed`);

  const allIDs: string[] = [];
  const allSlugs: string[] = [];

  for (const file of files) {
    const fullPath = path.join(casesDir, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const json = JSON.parse(raw);

    if (json.id) allIDs.push(json.id);
    if (json.slug) allSlugs.push(json.slug);
  }

  const idUnique = new Set(allIDs).size === allIDs.length;
  const slugUnique = new Set(allSlugs).size === allSlugs.length;

  console.log(idUnique ? "OK All IDs unique" : "FAIL Duplicate IDs found");
  console.log(slugUnique ? "OK All slugs unique" : "FAIL Duplicate slugs found");

  console.log("\n[API Test]");

  // Generic API test helper
  async function test(name: string, url: string, expectedStatus: number | null = 200) {
    try {
      const res = await fetch(url);
      if (expectedStatus !== null) {
        if (res.status === expectedStatus) {
          console.log(`OK GET ${name} (status ${res.status})`);
        } else {
          console.log(`FAIL GET ${name} expected ${expectedStatus} got ${res.status}`);
        }
      } else {
        console.log(`OK GET ${name}`);
      }
    } catch (e) {
      console.log(`FAIL GET (error) ${name}`);
    }
  }

  await test("/api/cases", "http://localhost:3000/api/cases");
  await test("/api/latest", "http://localhost:3000/api/latest");
  await test("/api/search", "http://localhost:3000/api/search?q=test");
  await test("/api/tags/[tag]", "http://localhost:3000/api/tags/orientation");

  try {
    const sampleShare = db
      .prepare("SELECT slug, share_mode, share_token FROM cases_index LIMIT 1")
      .get() as { slug: string; share_mode?: string | null; share_token?: string | null } | undefined;
    if (sampleShare?.slug) {
      const mode = sampleShare.share_mode ?? "private";
      const slug = sampleShare.slug;
      if (mode === "private") {
        await test("/api/share/[slug] (private expects 403)", `http://localhost:3000/api/share/${slug}`, 403);
      } else if (mode === "token" || mode === "protected") {
        await test("/api/share/[slug] token missing", `http://localhost:3000/api/share/${slug}`, 403);
        const token = sampleShare.share_token ?? "invalid";
        await test("/api/share/[slug]?token=XYZ", `http://localhost:3000/api/share/${slug}?token=${token}`, 200);
      } else {
        await test("/api/share/[slug] public", `http://localhost:3000/api/share/${slug}`, 200);
      }
    } else {
      console.log("FAIL No slug found for share API test");
    }
  } catch {
    console.log("FAIL share API test setup failed");
  }

  console.log("\n[Dynamic Slug Test]");

  let sampleSlug: string | null = null;

  try {
    const rows = db.prepare("SELECT slug FROM cases_index LIMIT 1").all();
    if (rows.length > 0) {
      sampleSlug = rows[0].slug as string;
    }
  } catch (e) {
    console.log("FAIL Could not query cases_index");
  }

  if (!sampleSlug) {
    console.log("FAIL No slug found in DB -- Skipping slug API test");
  } else {
    await test(`/api/cases/${sampleSlug}`, `http://localhost:3000/api/cases/${sampleSlug}`);
  }

  console.log("\nVerification complete.");
}

main();
