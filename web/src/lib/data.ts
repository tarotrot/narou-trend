import fs from "node:fs/promises";
import path from "node:path";
import type { DailyKeywords, KeywordCount } from "@/types/keywords";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SUFFIX = "_dailypoint.json";
const RANKING_KEY = "100";
const TOP_N = 20;
const DAILY_PAGES = 30; // 日別ページとして公開する日数（新しい順）
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// データがある全日付（新しい順）。月別・年別の集計に使う
export async function listAllDates(): Promise<string[]> {
  const files = await fs.readdir(DATA_DIR);
  return files
    .filter((f) => f.endsWith(SUFFIX))
    .map((f) => f.slice(0, -SUFFIX.length))
    .sort()
    .reverse();
}

// 日別ページとして公開する日付
export async function listDates(): Promise<string[]> {
  return (await listAllDates()).slice(0, DAILY_PAGES);
}

// 画面に出す分（上位20件）だけを返す
export async function getTopKeywords(date: string): Promise<KeywordCount[]> {
  if (!DATE_RE.test(date)) throw new Error(`不正な日付です: ${date}`);
  const raw = await fs.readFile(path.join(DATA_DIR, `${date}${SUFFIX}`), "utf-8");
  const json = JSON.parse(raw) as DailyKeywords;
  return json.keyword_counts[RANKING_KEY].slice(0, TOP_N);
}