import CoOccurrenceNetwork from "@/components/CoOccurrenceNetwork";
import DateCalendar from "@/components/DateCalendar";
import { getNetwork } from "@/lib/network";

type Props = {
  dates: string[];
  selectedDate: string;
};

export default async function NetworkPageContent({ dates, selectedDate }: Props) {
  const network = await getNetwork(selectedDate);

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-bold">キーワードの共起ネットワーク</h1>
      <p className="text-sm font-medium">表示する日付を選択してください</p>
      <DateCalendar
        dates={dates}
        selectedDate={selectedDate}
        hrefPrefix="/network"
      />
      <p className="text-sm leading-7">
        {network.date} のランキング上位{network.total}
        作品で、同じ作品に一緒に付いていたキーワードの組み合わせです。
      </p>

      <CoOccurrenceNetwork nodes={network.nodes} edges={network.edges} />

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
