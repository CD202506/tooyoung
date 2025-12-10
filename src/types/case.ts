export type ModuleType = "dementia" | "chronicle" | "behavior" | "health";
export type Visibility =
  | "private"
  | "family"
  | "clinician"
  | "anonymized"
  | "clinic"
  | "public";
export type CaseVisibility = Visibility;
export type AnonymizationLevel = "low" | "medium" | "high";

export type LocaleField =
  | string
  | {
      zh?: string | null;
      en?: string | null;
    };

/**
 * Shared Case shape used by API and UI.
 * All fields are optional; callers should apply runtime defaults where needed.
 */
export type CaseRecord = {
  id?: string;
  slug?: string;
  case_id?: number;
  share_mode?: "private" | "public" | "token";
  share_token?: string | null;
  event_datetime?: string;
  recorded_at?: string;

  event_date?: string;
  event_time?: string;

  title?: LocaleField;
  title_zh?: string;

  short_sentence?: LocaleField;
  short_sentence_zh?: string;

  summary?: LocaleField;
  summary_zh?: string;

  full_story?: LocaleField;
  full_story_zh?: string;

  content?: LocaleField | string | null;
  content_zh?: string;

  tags?: string[];
  photos?: string[] | { file?: string; filename?: string; caption?: string }[];
  attachments?: string[];
  public_excerpt_zh?: string;
  symptom_categories?: string[];

  created_at?: string;
  updated_at?: string;
  data_version?: number;

  module?: ModuleType;
  visibility?: Visibility;
  allow_photos_public?: boolean;
  anonymization_level?: AnonymizationLevel;
};

export interface Case {
  id: number;
  slug: string;
  case_id: number;
  title: string;
  event_datetime: string;
  content: string;
  images: string[];
  tags: string[];
  symptom_categories: string[];
  share_mode: "private" | "public" | "token";
  share_token?: string | null;
}
