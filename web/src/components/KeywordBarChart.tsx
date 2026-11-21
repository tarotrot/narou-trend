"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { KeywordCount } from "@/types/keywords";

type Props = { data: KeywordCount[] };

export default function KeywordBarChart({ data }: Props) {
  return (
    <div style={{ width: "100%", height: data.length * 28 + 40 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="keyword" width={120} interval={0} />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}