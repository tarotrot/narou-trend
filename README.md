# なろうキーワードトレンド

小説家になろうのランキングに付けられているキーワードの傾向を、グラフで可視化する個人制作のWebアプリです。

- 公開サイト: https://tarotrot.github.io/narou-trend/
- このサイトについて: https://tarotrot.github.io/narou-trend/about

## 概要

「なろう小説API」から、日間ポイント順の上位作品を毎日取得し、作品に付いているキーワードの出現数を集計して、グラフとして表示します。

## しくみ

```
GitHub Actions（毎日）
  1. fetch_ranking.py      なろう小説APIからランキング上位の作品情報を取得（1日1回）
  2. aggregate_keywords.py  キーワードごとの出現数を集計
  3. 非公開のデータ用リポジトリに、取得データと集計結果を保存
  4. Next.js でサイトをビルド（集計結果のうち、表示する分だけをページに埋め込む）
  5. gh-pages ブランチに公開 → GitHub Pages
```

- 取得データ（作品名やNコードなど）と集計結果のJSONは、非公開のリポジトリに保存していて、このリポジトリには含まれていません
- 公開サイトには、集計結果の一部（グラフに表示する分）だけが、ビルド時にHTMLへ埋め込まれます。JSONファイルとしては配布していません
- サーバーは使わず、静的なファイルだけで公開しています

## 使っている技術

- バッチ処理: Python 3.13、requests
- フロントエンド: Next.js（App Router、TypeScript、静的エクスポート）、Tailwind CSS、Recharts
- 自動化・公開: GitHub Actions、GitHub Pages

## ディレクトリ構成

```
src/                  バッチ処理（取得と集計）
web/                  Webアプリ（Next.js）
  scripts/sync-data.mjs  ビルド前に集計結果をコピーする
data/                 取得データ・集計結果（このリポジトリには含まれません）
requirements.txt      Pythonの依存パッケージ
```

## ローカルでの実行

```bash
# バッチ処理（data/raw と data/aggregated にデータができます）
pip install -r requirements.txt
python src/fetch_ranking.py
python src/aggregate_keywords.py

# Webアプリ
cd web
npm install
npm run dev
```

## なろうデベロッパーの利用ガイドラインについて

[なろうデベロッパーの利用ガイドライン](https://dev.syosetu.com/site/guideline/)と、その補足のお知らせ（2026年10月14日）を確認し、これに沿うように作っています。

- 非商用で、広告やアフィリエイトは掲載しません
- データの取得は、APIのみを使い、1日1回に抑えています。User-Agentで、アプリの名前を名乗っています
- 取得したデータをデータベースやデータセットとして公開・再配布しません。公開するのは集計結果の一部のみです
- 取得したデータを、AIの学習に使いません

このサイトは、小説家になろうおよび株式会社ヒナプロジェクトとは関係のない、個人が運営する非公式のサイトです。
