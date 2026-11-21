import DailyView from "@/components/DailyView";
import { listDates } from "@/lib/data";

export default async function Home() {
  const [latest] = await listDates();
  return <DailyView date={latest} />;
}