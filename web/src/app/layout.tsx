import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "なろうキーワードトレンド",
  description: "小説家になろうのランキングに出現するキーワードの推移を可視化します",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">

      <body className="min-h-full flex flex-col">
        <header className="p-6 pb-0 text-sm">
          <Link href="/" className="underline">
            トップページ
          </Link>
          {" ／ "}
          <Link href="/about" className="underline">
            このサイトについて
          </Link>
        </header>
        {children}
        <footer className="mt-auto p-6 text-xs">
          {"データの出典: "}
          <a
            className="underline"
            href="https://dev.syosetu.com/man/api/"
          >
            なろうデベロッパー（なろう小説API）
          </a>
        </footer>
      </body>
    </html>
  );
}


