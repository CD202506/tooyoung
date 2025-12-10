// 用來自動建立英文 slug
import slugify from "slugify";

export function slugGenerator(input: string): string {
  return slugify(input, { lower: true, strict: true });
}
