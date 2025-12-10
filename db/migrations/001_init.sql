-- 主索引資料表（每個案例一筆）
CREATE TABLE IF NOT EXISTS cases_index (
    id TEXT PRIMARY KEY,                      -- 系統 ID（ISO datetime + sequence）
    slug TEXT UNIQUE,                         -- 英文 slug
    event_datetime TEXT NOT NULL,             -- 事件發生時間
    short_sentence_zh TEXT,                   -- 短句（中文）
    summary_zh TEXT,                          -- 摘要（中文）
    title_zh TEXT,                            -- 標題（中文）
    content_zh TEXT,                          -- 完整故事全文（中文）

    created_at TEXT,
    updated_at TEXT
);

-- 標籤索引表（多對多關係：案例 ↔ 標籤）
CREATE TABLE IF NOT EXISTS tags_index (
    case_id TEXT,
    tag TEXT,
    FOREIGN KEY (case_id) REFERENCES cases_index(id)
);

-- FTS5 全文檢索表（用於搜尋）
CREATE VIRTUAL TABLE IF NOT EXISTS cases_fts USING fts5(
    id UNINDEXED,
    title_zh,
    short_sentence_zh,
    summary_zh,
    content_zh,
    tokenize = "unicode61"
);
