// ビルド・開発サーバーの起動前に、集計結果のJSONを web/src/data/ にコピーする。
// package.json の predev / prebuild から、npm run sync-data 経由で自動実行される。

// コピー元: data/aggregated/ の下の、種類別のフォルダ
//   - dailypoint/    キーワードの集計。日別ページに使う（必須）
//   - co_occurrence/ キーワードの共起。共起ネットワークに使う（なくてもよい）
// コピー先: web/src/data/
//   public/ の外にあるので、JSONのまま、公開されることはない。
//   ページを作るときに、読み込まれるだけ。

import { existsSync, mkdirSync, readdirSync, rmSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// リポジトリのルート（このファイルは web/scripts/ にあるので、2つ上がルート）
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DEST = path.join(root, "web", "src", "data");

// コピーするデータの種類
//   dir:      コピー元のフォルダ
//   suffix:   対象にするファイル名の末尾（日付のあとの部分）
//   required: true なら、1つもないときにエラーで止める
const SOURCES = [
  {
    dir: path.join(root, "data", "aggregated", "dailypoint"),
    suffix: "_dailypoint.json",
    required: true,
  },
  {
    dir: path.join(root, "data", "aggregated", "co_occurrence"),
    suffix: "_cooccurrence.json",
    required: false,
  },
];

// 先に、必須のデータがあるかを確かめる。
// なければ、古いデータのまま、サイトを作ってしまわないよう、ここで止める。
for (const { dir, suffix, required } of SOURCES) {
  if (!required) continue;
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(suffix)) : [];
  if (files.length === 0) {
    console.error(`コピーするJSONがありません: ${dir}`);
    process.exit(1);
  }
}

// コピー先のフォルダがなければ作る
mkdirSync(DEST, { recursive: true });

// 古いコピーを消してから、入れ直す。
// コピー元で消えた日のファイルが、コピー先に残らないよう、元と同じ状態にそろえる。
for (const f of readdirSync(DEST)) {
  if (SOURCES.some((s) => f.endsWith(s.suffix))) rmSync(path.join(DEST, f));
}

// 種類ごとに、日付順でコピーする
for (const { dir, suffix } of SOURCES) {
  // 任意のデータ（共起）で、フォルダ自体がない場合は、何もしない
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(suffix))
    .sort();
  for (const f of files) cpSync(path.join(dir, f), path.join(DEST, f));
  console.log(`${files.length}件の ${suffix} を web/src/data/ にコピーしました`);
}