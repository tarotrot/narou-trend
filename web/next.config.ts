import type { NextConfig } from "next";

// GitHub Pages では https://tarotrot.github.io/narou-trend/ の下で公開されるため、
// 本番ビルドのときだけ、パスの頭に /narou-trend を付ける（開発中は付けない）
const basePath = process.env.NODE_ENV === "production" ? "/narou-trend" : "";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;