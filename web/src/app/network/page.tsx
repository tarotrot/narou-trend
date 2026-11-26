// 共起ネットワークのトップページ。共起データの最新日を表示する。

import type { Metadata } from "next";
import NetworkPageContent from "@/components/NetworkPageContent";
import { listNetworkDates } from "@/lib/network";

export const metadata: Metadata = {
  title: "キーワードの共起 | なろうキーワードトレンド",
};

export default async function NetworkPage() {
  const dates = await listNetworkDates();
  const latest = dates[0];

  if (!latest) {
    return <main className="p-4 sm:p-6">共起のデータは、まだありません。</main>;
  }

  return <NetworkPageContent dates={dates} selectedDate={latest} />;
}
