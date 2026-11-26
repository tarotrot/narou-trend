// 共起ネットワークをSVGで描く部品。
// 位置はすでに計算済みなので、受け取ったデータをそのまま描くだけ。
// この図には、専用のJavaScriptは要らず、ビルド時に、静的なSVGになる。

import { HEIGHT, WIDTH, type PositionedEdge, type PositionedNode } from "@/lib/network";

type Props = {
  nodes: PositionedNode[]; // 位置と半径が決まった点
  edges: PositionedEdge[]; // 両端の座標が決まった線
};

export default function CoOccurrenceNetwork({ nodes, edges }: Props) {
  // 線の太さを決めるための、リフト値の最大値（線が1本もなくても、1以上になるようにしている）
  const maxLift = Math.max(...edges.map((e) => e.lift), 1);

  return (
    // viewBox で、描く領域の大きさを決める。w-full で、画面の幅に合わせて、拡大縮小される。
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="キーワードの共起ネットワーク"
    >
      {/* 線（点より先に描いて、点の下に、重なるようにする） */}
      <g stroke="#94a3b8" strokeOpacity={0.7}>
        {edges.map((e) => (
          <line
            key={`${e.source}-${e.target}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            // 線の太さは、リフト値に比例（最大の線が、約4.5px、最小でも0.5px）
            strokeWidth={0.5 + (e.lift / maxLift) * 4}
          >
            {/* マウスを乗せたときに出る説明 */}
            <title>{`${e.source} × ${e.target}\n${e.count}作品（リフト値 ${e.lift}）`}</title>
          </line>
        ))}
      </g>

      {/* 点とラベル */}
      <g>
        {nodes.map((n) => (
          // 点ごとに、原点を、その位置に移して描く
          <g key={n.keyword} transform={`translate(${n.x}, ${n.y})`}>
            <circle r={n.r} fill="#3b82f6" fillOpacity={0.85}>
              <title>{`${n.keyword}\n${n.count}作品`}</title>
            </circle>
            {/* ラベルは、点の下に、中央揃えで置く。
                白い縁取りを付けて、線と重なっても、読めるようにしている。 */}
            <text
              y={n.r + 12}
              textAnchor="middle"
              fontSize={11}
              fill="#171717"
              stroke="#ffffff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {n.keyword}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}