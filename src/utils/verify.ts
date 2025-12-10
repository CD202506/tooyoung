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
  async function test(name: string, url: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`FAIL GET (failed) ${name} status ${res.status}`);
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
