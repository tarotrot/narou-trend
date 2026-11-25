import KeywordBarChart from "@/components/KeywordBarChart";
import { getTopKeywords, listDates } from "@/lib/data";
import DateCalendar from "@/components/DateCalendar";

export default async function DailyView({ date }: { date: string }) {
  const [items, dates] = await Promise.all([getTopKeywords(date), listDates()]);

  return (
    <main className="p-6">
      <h1 className="mb-2 text-xl font-bold">なろうキーワードトレンド</h1>
      <p className="mb-4 text-sm">{date} のキーワード出現数（上位20）</p>
      <p className="mb-2 text-sm font-medium">グラフを表示したい日付を選択してください</p>
      <DateCalendar dates={dates} selectedDate={date} />
      <KeywordBarChart data={items} />
    </main>
  );
}