export type KeywordCount = { keyword: string; count: number };

export type DailyKeywords = {
  fetched_at: string;
  order: string;
  allcount: number;
  keyword_counts: Record<string, KeywordCount[]>;
};