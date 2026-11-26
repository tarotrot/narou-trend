// 共起ネットワークのデータを読み込んで、点の位置を計算する。
// ビルドのとき（サーバー側）にだけ実行される。ブラウザには、できあがった位置だけが、届く。

import fs from "node:fs/promises";
import path from "node:path";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import type { CoOccurrenceData, NetworkEdge, NetworkNode } from "@/types/network";

// JSONの置き場所と、ファイル名の形
const DATA_DIR = path.join(process.cwd(), "src", "data");
const SUFFIX = "_cooccurrence.json";

// 日付として正しい形かの確認用（2026-11-26 のような形のみ許可）
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// 描画する領域の大きさ（SVGの座標系）。画面の幅に合わせて、拡大縮小される。
export const WIDTH = 800;
export const HEIGHT = 600;

// 点の中心を置ける範囲の余白。
// ラベル（キーワード名）は、点の下に、中央揃えで出るので、
// 長いキーワードが、左右の端で切れないよう、左右の余白を広めにとっている。
const PADDING_X = 90;
const PADDING_Y = 40;

// 位置が決まった点・線の型（描画する部品が使う）
export type PositionedNode = NetworkNode & { x: number; y: number; r: number };
export type PositionedEdge = NetworkEdge & { x1: number; y1: number; x2: number; y2: number };

// 点の半径を決める。作品数の平方根に比例させる。
// 半径ではなく、面積が作品数に比例するようにして、大きいものが、目立ちすぎないようにしている。
function nodeRadius(count: number): number {
  return 6 + Math.sqrt(count) * 1.2;
}

// 値を min から max の範囲に収める
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// 共起のデータがある日付の一覧を、新しい順で返す。
// データがない（フォルダがない）ときは、エラーにせず、空の配列を返す。
// こうしておくと、共起のデータがない環境でも、ビルドが失敗しない。
export async function listNetworkDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith(SUFFIX))
      .map((f) => f.slice(0, -SUFFIX.length)) // ファイル名から、日付の部分だけを取り出す
      .sort()
      .reverse(); // 新しい日付が先頭になるように
  } catch {
    return [];
  }
}

// 1日分の共起ネットワークを読み込んで、点の位置を計算して返す
export async function getNetwork(date: string) {
  // 日付以外の文字列が、ファイルのパスに入り込まないようにする
  if (!DATE_RE.test(date)) throw new Error(`不正な日付です: ${date}`);

  // JSONを読み込む
  const raw = await fs.readFile(path.join(DATA_DIR, `${date}${SUFFIX}`), "utf-8");
  const data = JSON.parse(raw) as CoOccurrenceData;

  // d3-force に渡すための、点と線のデータ。
  // d3-force は、渡したデータに、位置の情報（x, y）を、書き込む。
  // 元のデータを書き換えないよう、コピーしてから渡している。
  type SimNode = NetworkNode & SimulationNodeDatum;
  const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
  const simLinks: SimulationLinkDatum<SimNode>[] = data.edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  // 力学モデルによる配置。点どうしに、次の力を働かせて、落ち着く位置を計算する。
  const simulation = forceSimulation<SimNode>(simNodes)
    // 線: つながっている点どうしを、引き寄せる（目標の距離は80、引く強さは0.4）
    .force(
      "link",
      forceLink<SimNode, SimulationLinkDatum<SimNode>>(simLinks)
        .id((d) => d.keyword) // 線の source / target は、キーワード名で、点を探す
        .distance(80)
        .strength(0.4),
    )
    // 反発: すべての点どうしを、互いに、遠ざける（重なりにくくする）
    .force("charge", forceManyBody().strength(-250))
    // 中心: 全体が、領域の中央に集まるようにする
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    // 衝突: 点の円（とラベルの分の余裕）が、重ならないようにする
    .force("collide", forceCollide<SimNode>().radius((d) => nodeRadius(d.count) + 16))
    // 通常は、画面の中で、アニメーションしながら動く。
    // ここでは、ビルド時に、結果の位置だけが欲しいので、自動で動かさずに止めておく。
    .stop();

  // 300回、手動で計算を進めて、位置を落ち着かせる（d3-force の標準の回数）。
  // d3-force の乱数は、固定の種から作られるので、同じデータなら、ほぼ同じ配置になる。
  for (let i = 0; i < 300; i++) simulation.tick();

  // 計算された位置を、余白の範囲に収めて、半径とあわせて、点のデータにする
  const nodes: PositionedNode[] = simNodes.map((n) => ({
    keyword: n.keyword,
    count: n.count,
    x: clamp(n.x ?? WIDTH / 2, PADDING_X, WIDTH - PADDING_X),
    y: clamp(n.y ?? HEIGHT / 2, PADDING_Y, HEIGHT - PADDING_Y),
    r: nodeRadius(n.count),
  }));

  // キーワード名から、点を、すぐに探せるようにしておく
  const byKeyword = new Map(nodes.map((n) => [n.keyword, n]));

  // 線に、両端の点の座標を、付ける。
  // 両端の点が見つからない線は、描けないので、除く（flatMap で、空の配列を返す）
  const edges: PositionedEdge[] = data.edges.flatMap((e) => {
    const a = byKeyword.get(e.source);
    const b = byKeyword.get(e.target);
    return a && b ? [{ ...e, x1: a.x, y1: a.y, x2: b.x, y2: b.y }] : [];
  });

  return { date, total: data.total_works, nodes, edges };
}