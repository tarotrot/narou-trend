# data/raw/ の生データから、キーワードの共起（同じ作品にいっしょに付いている組み合わせ）を集計し、
# data/aggregated/ に集計結果のJSONとして保存する。

import json
from collections import Counter
from itertools import combinations
from pathlib import Path

from aggregate_keywords import extract_keywords  # キーワードの取り出し方を共通にする

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
OUT_DIR = ROOT / "data" / "aggregated" / "co_occurrence"

TOP_N = 500  # 上位何作品を対象にするか
MIN_KEYWORD_COUNT = 10  # ノードにするキーワードの、最低の作品数
MIN_PAIR_COUNT = 5  # エッジにするペアの、最低の作品数
MAX_EDGES = 80  # 保存するエッジの最大数(リフト値の高い順)
PRINT_LIMIT = 15  # 確認用に画面に出すエッジの数


def build_network(novels):
    """上位 TOP_N 作品から、キーワードの共起ネットワークを作って返す。"""
    # 作品ごとのキーワードの集合(1作品の中の重複は、1回として数える)
    works = [extract_keywords(n["keyword"]) for n in novels if n["rank"] <= TOP_N]
    total = len(works)

    keyword_counts = Counter()  # キーワードごとの、付いている作品数
    pair_counts = Counter()  # ペアごとの、いっしょに付いている作品数
    for keywords in works:
        keyword_counts.update(keywords)
        # sorted にして、(A, B) と (B, A) が、別のペアにならないようにする
        pair_counts.update(combinations(sorted(keywords), 2))

    edges = []
    for (a, b), count in pair_counts.items():
        if count < MIN_PAIR_COUNT:
            continue
        if keyword_counts[a] < MIN_KEYWORD_COUNT or keyword_counts[b] < MIN_KEYWORD_COUNT:
            continue
        # リフト値: 偶然よりも、どれくらい、いっしょに付きやすいか。
        # 1なら偶然と同じ。大きいほど、特徴的な組み合わせ。
        lift = count * total / (keyword_counts[a] * keyword_counts[b])
        edges.append({"source": a, "target": b, "count": count, "lift": round(lift, 2)})

    # 実行のたびに結果がぶれないよう、並びを完全に決める
    edges.sort(key=lambda e: (-e["lift"], -e["count"], e["source"], e["target"]))
    edges = edges[:MAX_EDGES]

    used = {e["source"] for e in edges} | {e["target"] for e in edges}
    nodes = [
        {"keyword": k, "count": keyword_counts[k]}
        for k in sorted(used, key=lambda k: (-keyword_counts[k], k))
    ]
    return total, nodes, edges


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for raw_path in sorted(RAW_DIR.glob("*.json")):
        raw = json.loads(raw_path.read_text(encoding="utf-8"))
        total, nodes, edges = build_network(raw["novels"])

        result = {
            "fetched_at": raw["fetched_at"],
            "order": raw["order"],
            "top_n": TOP_N,
            "total_works": total,
            "nodes": nodes,
            "edges": edges,
        }

        date = raw_path.name.split("_")[0]
        out_path = OUT_DIR / f"{date}_cooccurrence.json"
        out_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        print(f"\n【{raw_path.name}】ノード{len(nodes)}、エッジ{len(edges)}（対象{total}作品）")
        for e in edges[:PRINT_LIMIT]:
            print(f"  {e['source']} × {e['target']}  {e['count']}作品  リフト値 {e['lift']}")
        print(f"  保存先: {out_path}")


if __name__ == "__main__":
    main()