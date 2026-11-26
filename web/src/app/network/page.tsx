// 共起ネットワークのページ（/network）。
// ビルドのときに、最新の1日分のデータを読み込んで、静的なページとして作られる。

import type { Metadata } from "next";
import CoOccurrenceNetwork from "@/components/CoOccurrenceNetwork";
import { getNetwork, listNetworkDates } from "@/lib/network";

// ブラウザのタブに出る題名
export const metadata: Metadata = {
  title: "キーワードの共起 | なろうキーワードトレンド",
};

export default async function NetworkPage() {
  // 共起のデータがある日付のうち、最新のもの（先頭）を取り出す
  const [latest] = await listNetworkDates();

  // データがまだないときは、エラーにせず、案内だけを出す
  if (!latest) {
    return <main className="p-4 sm:p-6">共起のデータは、まだありません。</main>;
  }

  // 最新の1日分を読み込んで、点の位置を計算する
  const network = await getNetwork(latest);

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-bold">キーワードの共起ネットワーク</h1>
      <p className="text-sm leading-7">
        {network.date} のランキング上位{network.total}
        作品で、同じ作品にいっしょに付いていたキーワードの組み合わせです。
      </p>

      {/* ネットワーク図 */}
      <CoOccurrenceNetwork nodes={network.nodes} edges={network.edges} />

      {/* 図の見方 */}
      <ul className="list-disc space-y-1 pl-5 text-xs leading-6">
        <li>点の大きさは、そのキーワードが付いている作品数です。</li>
        <li>
          線の太さは、リフト値（偶然よりも、どれくらい、いっしょに付きやすいか）です。1なら偶然と同じで、大きいほど特徴的な組み合わせです。
        </li>
        <li>作品数が少ない組み合わせは、除いています。</li>
      </ul>
    </main>
  );
}