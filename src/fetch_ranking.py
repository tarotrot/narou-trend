import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

API_URL = "https://api.syosetu.com/novelapi/api/"
ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
JST = timezone(timedelta(hours=9))
USER_AGENT = "narou-keyword-trend/1.0 (+https://github.com/tarotrot/narou-trend)"

ORDER = "dailypoint"  # 日間ポイントの高い順
LIMIT = 500  # 1回のリクエストで取れる最大件数


def fetch_ranking(order=ORDER, limit=LIMIT):
    res = requests.get(
        API_URL,
        params={
            "out": "json",
            "of": "t-n-k-dp",  # タイトル・Nコード・キーワード・日間ポイント
            "order": order,
            "lim": limit,
        },
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    res.raise_for_status()
    data = res.json()

    # 先頭要素は件数情報、作品データは2番目以降
    allcount = data[0]["allcount"]

    # レスポンスは order 指定の並び順なので、順番がそのまま順位になる
    novels = []
    for i, novel in enumerate(data[1:], start=1):
        novels.append({"rank": i, **novel})
    return allcount, novels


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    fetched_at = datetime.now(JST)
    allcount, novels = fetch_ranking()

    payload = {
        "fetched_at": fetched_at.isoformat(),
        "order": ORDER,
        "limit": LIMIT,
        "allcount": allcount,
        "novels": novels,
    }

    path = RAW_DIR / f"{fetched_at:%Y-%m-%d}_{ORDER}.json"
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"{len(novels)}件を保存しました: {path}")


if __name__ == "__main__":
    main()