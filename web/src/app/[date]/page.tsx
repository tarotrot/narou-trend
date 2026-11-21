import DailyView from "@/components/DailyView";
import { listDates } from "@/lib/data";

export async function generateStaticParams() {
  const dates = await listDates();
  return dates.map((date) => ({ date }));
}

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <DailyView date={date} />;
}