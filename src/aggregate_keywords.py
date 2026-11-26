# data/raw/ にある生データ(JSON)を読み込み、
# 作品に付いたキーワード(keyword)ごとの出現数を数えて、
# data/aggregated/ に集計結果のJSONとして保存する。
# ------------------------------------------------------------

import json  # JSONファイルの読み書きに使う
import unicodedata  # 全角・半角などの文字のゆれをそろえるのに使う
from collections import Counter  # 「何が何個あるか」を数える道具
from pathlib import Path  # ファイルやフォルダの場所を扱う

# --- 場所の設定 -------------------------------------------------
# __file__ はこのファイル自身(src/aggregate_keywords.py)。
# 1つ上(.parent)が src/、2つ上(.parent.parent)がプロジェクトのルート。
# どのフォルダから実行しても、同じ場所を指せるようにしている。
ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"  # 読み込む生データの置き場所
OUT_DIR = ROOT / "data" / "aggregated" / "dailypoint"  # 集計結果の書き出し先

# --- 集計の設定 -------------------------------------------------
# 上位何件で集計するか。(100, 500) なら、
# 「上位100件での集計」と「上位500件での集計」の2種類を作る。
# 生データには順位つきで500件入っているので、ここで絞り込む。
TOP_NS = (100, 500)

# 画面に出すキーワードの数(出現数の多い順)。JSONファイルには全部保存される。
PRINT_LIMIT = 10

# 表記ゆれの統一ルール。{"元の表記": "統一後の表記"} の形で書く。
# 今は空(何も統一しない)。集計結果を見てから、必要なものを足す。
# 例: ALIASES = {"ざまあ": "ざまぁ"}
ALIASES = {"ざまあ": "ざまぁ"}

# 集計から外したいキーワード(コンテスト名など)を入れる。今は空。
# 例: EXCLUDE = {"ネトコン15", "AI直接使用"}
EXCLUDE = set()


def extract_keywords(keyword_text):
    """作品の keyword 欄の文字列を、キーワードの集合(set)にして返す。

    生データの keyword 欄は、キーワードがスペースで区切られた1つの文字列。
    例: "女主人公 ざまぁ ハッピーエンド"
        -> {"女主人公", "ざまぁ", "ハッピーエンド"}
    set(集合)にしているのは、1作品の中に同じキーワードが2回あっても
    1回として数えるため。
    """
    keywords = set()

    # unicodedata.normalize("NFKC", ...) は、全角の英数字や全角スペースを半角にそろえる。
    # .split() は、スペース(連続していてもOK)で区切ってリストにする。
    for raw in unicodedata.normalize("NFKC", keyword_text).split():
        # キーワードの前後に混ざっている "#" や "`" を取り除く。
        keyword = raw.strip("#`")
        # ALIASES に登録があれば統一後の表記に置き換える。
        # なければ、そのまま(.get の2つ目の引数がデフォルト値)。
        keyword = ALIASES.get(keyword, keyword)
        # 空文字や除外対象のキーワードは、集合に入れない。
        if keyword and keyword not in EXCLUDE:
            keywords.add(keyword)

    return keywords


def count_keywords(novels, top_n):
    """上位 top_n 件の作品について、キーワードの出現数を数えて返す。

    戻り値は [{"keyword": "ざまぁ", "count": 120}, ...] の形で、
    出現数の多い順に並んでいる。
    """
    counter = Counter()  # キーワードごとの出現数を入れていく入れ物

    for novel in novels:
        # 順位が top_n 以下の作品だけを数える(例: 上位100件)。
        if novel["rank"] <= top_n:
            # 1作品のキーワードを渡すと、それぞれの数が +1 される。
            counter.update(extract_keywords(novel["keyword"]))

    # 出現数の多い順。同数のときはキーワード名の順にそろえる
    # （set の並びは実行のたびに変わるので、そろえないと出力がぶれる）
    return [
        {"keyword": keyword, "count": count}
        for keyword, count in sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    ]


def main():
    # 書き出し先のフォルダがなければ作る(あってもエラーにならない)。
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # data/raw/ の中の .json ファイルを、名前順に1つずつ処理する。
    for raw_path in sorted(RAW_DIR.glob("*.json")):
        # 生データを読み込む。
        raw = json.loads(raw_path.read_text(encoding="utf-8"))
        novels = raw["novels"]  # 順位つきの作品リスト

        # 保存する集計結果をまとめる。
        result = {
            "fetched_at": raw["fetched_at"],  # 取得した日時
            "order": raw["order"],  # 並び順の指定(dailypoint など)
            "allcount": raw["allcount"],  # 条件に合う全作品数
            # 上位100件・上位500件、それぞれの集計結果。
            # JSONのキーは文字列でなければならないので、str() で数字を文字にしている。
            "keyword_counts": {
                str(top_n): count_keywords(novels, top_n) for top_n in TOP_NS
            },
        }

        # 生データと同じファイル名で、data/aggregated/ に保存する。
        out_path = OUT_DIR / raw_path.name
        out_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        # 確認用に、TOP_NS の最後の値(今は500)の集計結果を画面に出す。
        top_n = TOP_NS[-1]
        # 実際に集計の対象になった作品数(割合の分母)。
        # 取得できた件数が top_n より少なかった場合も、正しい割合になる。
        total = sum(1 for novel in novels if novel["rank"] <= top_n)

        print(f"\n【{raw_path.name}】上位{top_n}件のうち、そのキーワードが付いていた作品数")
        for item in result["keyword_counts"][str(top_n)][:PRINT_LIMIT]:
            percent = item["count"] / total * 100
            # :>4 は数字を4文字分の幅で右にそろえる指定。
            # :5.1f は小数第1位まで、5文字分の幅で表示する指定。
            print(f"  {item['count']:>4}件 ({percent:5.1f}%)  {item['keyword']}")
        print(f"  保存先: {out_path}")


# このファイルを直接実行したとき(python src/aggregate_keywords.py)だけ、
# main() を動かす。他のファイルから import されたときは動かない。
if __name__ == "__main__":
    main()