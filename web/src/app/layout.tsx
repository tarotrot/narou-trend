import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "なろうキーワードトレンド",
  description: "小説家になろうのランキングに出現するキーワードの推移を可視化します",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
