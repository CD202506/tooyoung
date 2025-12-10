export interface CaseProfile {
  id: number;
  display_name: string;
  real_name?: string | null;
  birth_year?: number | null;
  gender?: "male" | "female" | "other" | null;
  privacy_level: "private" | "limited" | "public";
  share_mode?: "private" | "protected" | "public";
  share_token?: string | null;
  created_at: string;
  updated_at: string;
}
