import path from "node:path";
import Database from "better-sqlite3";
import { ClinicalScaleRecord, ClinicalScaleType } from "@/types/clinicalScale";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");

function mapRow(row: Record<string, unknown>): ClinicalScaleRecord {
  return {
    id: Number(row.id),
    scale_date: String(row.scale_date),
    scale_type: row.scale_type as ClinicalScaleType,
    total_score:
      row.total_score === null || row.total_score === undefined
        ? null
        : Number(row.total_score),
    payload_json:
      row.payload_json === null || row.payload_json === undefined
        ? null
        : String(row.payload_json),
    source: (row.source as ClinicalScaleRecord["source"]) || "manual",
    note:
      row.note === null || row.note === undefined ? null : String(row.note),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getAllScales(): Promise<ClinicalScaleRecord[]> {
  const db = new Database(DB_PATH);
  try {
    const hasTable = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='clinical_scales'",
      )
      .get();
    if (!hasTable) {
      return [];
    }
    const rows = db
      .prepare(
        "SELECT * FROM clinical_scales ORDER BY scale_date DESC, created_at DESC",
      )
      .all() as Record<string, unknown>[];
    return rows.map(mapRow);
  } finally {
    db.close();
  }
}

export async function getScaleById(id: number): Promise<ClinicalScaleRecord | null> {
  const db = new Database(DB_PATH);
  try {
    const row = db
      .prepare("SELECT * FROM clinical_scales WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;
    return row ? mapRow(row) : null;
  } finally {
    db.close();
  }
}

export async function getScalesByType(
  type: ClinicalScaleType,
): Promise<ClinicalScaleRecord[]> {
  const db = new Database(DB_PATH);
  try {
    const rows = db
      .prepare(
        "SELECT * FROM clinical_scales WHERE scale_type = ? ORDER BY scale_date DESC, created_at DESC",
      )
      .all(type) as Record<string, unknown>[];
    return rows.map(mapRow);
  } finally {
    db.close();
  }
}

export async function getLatestScales(
  limit: number,
): Promise<ClinicalScaleRecord[]> {
  const db = new Database(DB_PATH);
  try {
    const rows = db
      .prepare(
        "SELECT * FROM clinical_scales ORDER BY scale_date DESC, created_at DESC LIMIT ?",
      )
      .all(limit) as Record<string, unknown>[];
    return rows.map(mapRow);
  } finally {
    db.close();
  }
}

type InsertPayload = {
  scale_date: string;
  scale_type: ClinicalScaleType;
  total_score: number | null;
  payload_json?: string | null;
  source?: "manual" | "import" | "other";
  note?: string | null;
};

export async function insertScale(
  data: InsertPayload,
): Promise<ClinicalScaleRecord> {
  const db = new Database(DB_PATH);
  try {
    const now = new Date().toISOString();
    const payloadJson =
      data.payload_json && data.payload_json.trim().length > 0
        ? data.payload_json
        : null;

    const stmt = db.prepare(
      `
      INSERT INTO clinical_scales (
        scale_date,
        scale_type,
        total_score,
        payload_json,
        source,
        note,
        created_at,
        updated_at
      ) VALUES (
        @scale_date,
        @scale_type,
        @total_score,
        @payload_json,
        @source,
        @note,
        @created_at,
        @updated_at
      )
    `,
    );

    const result = stmt.run({
      scale_date: data.scale_date,
      scale_type: data.scale_type,
      total_score:
        data.total_score === null || data.total_score === undefined
          ? null
          : data.total_score,
      payload_json: payloadJson,
      source: data.source ?? "manual",
      note: data.note ?? null,
      created_at: now,
      updated_at: now,
    });

    const inserted = db
      .prepare("SELECT * FROM clinical_scales WHERE id = ?")
      .get(result.lastInsertRowid) as Record<string, unknown>;
    return mapRow(inserted);
  } finally {
    db.close();
  }
}

export async function updateScale(
  id: number,
  patch: Partial<ClinicalScaleRecord>,
): Promise<ClinicalScaleRecord | null> {
  const db = new Database(DB_PATH);
  try {
    const existingRow = db
      .prepare("SELECT * FROM clinical_scales WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;
    if (!existingRow) return null;

    const existing = mapRow(existingRow);
    const merged: ClinicalScaleRecord = {
      ...existing,
      ...patch,
      updated_at: new Date().toISOString(),
    };

    const stmt = db.prepare(
      `
        UPDATE clinical_scales SET
          scale_date = @scale_date,
          scale_type = @scale_type,
          total_score = @total_score,
          payload_json = @payload_json,
          source = @source,
          note = @note,
          updated_at = @updated_at
        WHERE id = @id
      `,
    );

    stmt.run({
      id: merged.id,
      scale_date: merged.scale_date,
      scale_type: merged.scale_type,
      total_score: merged.total_score,
      payload_json:
        merged.payload_json && merged.payload_json.trim().length > 0
          ? merged.payload_json
          : null,
      source: merged.source,
      note: merged.note ?? null,
      updated_at: merged.updated_at,
    });

    const updated = db
      .prepare("SELECT * FROM clinical_scales WHERE id = ?")
      .get(id) as Record<string, unknown>;
    return mapRow(updated);
  } finally {
    db.close();
  }
}
