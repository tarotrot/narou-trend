import Link from "next/link";
import KeywordBarChart from "@/components/KeywordBarChart";
import { getTopKeywords, listDates } from "@/lib/data";

export default async function DailyView({ date }: { date: string }) {
  const [items, dates] = await Promise.all([getTopKeywords(date), listDates()]);

  return (
    <main className="p-6">
      <h1 className="mb-2 text-xl font-bold">なろうキーワードトレンド</h1>
      <p className="mb-4 text-sm">{date} のキーワード出現数（上位20）</p>
      <nav className="mb-4 flex flex-wrap gap-3 text-sm">
        {dates.map((d) =>
          d === date ? (
            <strong key={d}>{d}</strong>
          ) : (
            <Link key={d} href={`/${d}`} className="underline">
              {d}
            </Link>
          )
        )}
      </nav>
      <KeywordBarChart data={items} />
    </main>
  );
}