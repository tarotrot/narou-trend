// 日付ごとの共起ネットワークページ。
// generateStaticParams により、データのある日付だけをビルド時に生成する。

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NetworkPageContent from "@/components/NetworkPageContent";
import { listNetworkDates } from "@/lib/network";

type Props = {
  params: Promise<{ date: string }>;
};

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "キーワードの共起 | なろうキーワードトレンド",
};

export async function generateStaticParams() {
  const dates = await listNetworkDates();
  return dates.map((date) => ({ date }));
}

export default async function NetworkDatePage({ params }: Props) {
  const { date } = await params;
  const dates = await listNetworkDates();

  if (!dates.includes(date)) notFound();

  return <NetworkPageContent dates={dates} selectedDate={date} />;
}
