import { existsSync, mkdirSync, readdirSync, rmSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// リポジトリのルート
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = path.join(root, "data", "aggregated", "dailypoint");
const DEST = path.join(root, "web", "src", "data");
const SUFFIX = "_dailypoint.json";

if (!existsSync(SRC)) {
  console.error(`コピー元が見つかりません: ${SRC}`);
  process.exit(1);
}

const files = readdirSync(SRC)
  .filter((f) => f.endsWith(SUFFIX))
  .sort();

if (files.length === 0) {
  console.error("コピーするJSONがありません");
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

// 古いコピーを消してから入れ直す（コピー先をコピー元と同じ状態にそろえる）
for (const f of readdirSync(DEST)) {
  if (f.endsWith(SUFFIX)) rmSync(path.join(DEST, f));
}
for (const f of files) {
  cpSync(path.join(SRC, f), path.join(DEST, f));
}

console.log(`${files.length}件のJSONを web/src/data/ にコピーしました`);
