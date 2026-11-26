// 共起ネットワークのJSON（data/aggregated/co_occurrence/）の形を表す型。

// 点（キーワード）
export type NetworkNode = {
  keyword: string; // キーワード
  count: number; // そのキーワードが付いている作品数
};

// 線（キーワードの組み合わせ）
export type NetworkEdge = {
  source: string; // 組み合わせの片方のキーワード
  target: string; // 組み合わせのもう片方のキーワード
  count: number; // いっしょに付いている作品数
  lift: number; // リフト値。偶然よりも、どれくらい、いっしょに付きやすいか（1なら偶然と同じ）
};

// JSONファイル全体
export type CoOccurrenceData = {
  fetched_at: string; // 取得した日時
  order: string; // 並び順の指定（dailypoint など）
  top_n: number; // 上位何作品を対象にしたか
  total_works: number; // 実際に集計した作品数
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};