-- Clinical scales table for MMSE/CDR and future scales
CREATE TABLE IF NOT EXISTS clinical_scales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scale_date TEXT NOT NULL,
  scale_type TEXT NOT NULL,
  total_score REAL,
  payload_json TEXT,
  source TEXT DEFAULT 'manual',
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinical_scales_date ON clinical_scales (scale_date);
CREATE INDEX IF NOT EXISTS idx_clinical_scales_type ON clinical_scales (scale_type);
