"use client";

// 日付をクリックしたとき、日別ページへ移動するために使う
import Link from "next/link";

// 表示中の年月を切り替えるために使う
import { useState } from "react";

// 親コンポーネントから受け取る値の型
type DateCalendarProps = {
  dates: string[]; // 選択できる日付の一覧（例: ["2026-11-25", "2026-11-24"]）
  selectedDate: string; // 現在表示している日付
};

// カレンダーの曜日見出し
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function DateCalendar({
  dates,
  selectedDate,
}: DateCalendarProps) {
  // 選択中の日付から、最初に表示する年月を決める
  // 時刻を付けて、日付がタイムゾーンの影響でずれにくくしている
  const selected = new Date(`${selectedDate}T00:00:00`);

  // 表示中の年と月を保持する
  // month は 0 が1月、11が12月
  const [year, setYear] = useState(selected.getFullYear());
  const [month, setMonth] = useState(selected.getMonth());

  // 月初が何曜日かを調べる（0が日曜日、6が土曜日）
  // カレンダーの最初に空白セルをいくつ置くかに使う
  const firstDay = new Date(year, month, 1).getDay();

  // 表示中の月の日数を調べる
  // 翌月の0日目を指定すると、当月の最終日になる
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 各日付が選択可能かを調べやすくするため、Setに変換する
  const availableDates = new Set(dates);

  // 前月または次月へ表示を切り替える
  function changeMonth(offset: number) {
    // offset が -1 なら前月、1 なら次月
    // 年をまたぐ場合も Date が自動で調整する
    const next = new Date(year, month + offset, 1);

    // 切り替え後の年月を画面に反映する
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  // 月初までの空白セルと、1日から月末までの日番号を作る
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <section aria-label="日付を選択" className="mb-6 max-w-md">
      {/* 前月ボタン、表示中の年月、次月ボタン */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="前の月"
          className="rounded border px-3 py-1 hover:bg-gray-100"
        >
          ←
        </button>

        {/* 表示中の年月を見出しにする */}
        <h2 className="font-semibold">
          {year}年{month + 1}月
        </h2>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="次の月"
          className="rounded border px-3 py-1 hover:bg-gray-100"
        >
          →
        </button>
      </div>

      {/* 7列のグリッドで曜日と日付を並べる */}
      <div className="grid grid-cols-7 text-center text-sm">
        {/* 日〜土の曜日見出しを表示する */}
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-2 font-medium">
            {weekday}
          </div>
        ))}

        {/* 空白セルと、各日付のセルを表示する */}
        {cells.map((day, index) => {
          // 月初より前の位置には、日付を表示しない
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          // 年月日を YYYY-MM-DD 形式にする
          // 月と日を2桁にそろえ、dates の値と比較できるようにする
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          // その日付のデータが存在するか調べる
          const isAvailable = availableDates.has(date);

          // 現在選択中の日付か調べる
          const isSelected = date === selectedDate;

          return (
            <div key={date} className="p-1">
              {isAvailable ? (
                // データがある日だけ、日別ページへのリンクにする
                <Link
                  href={`/${date}`}
                  aria-current={isSelected ? "date" : undefined}
                  className={`block rounded py-1 underline ${
                    isSelected
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {day}
                </Link>
              ) : (
                // データがない日は、選択できない表示にする
                <span className="block py-1 text-gray-300">{day}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}