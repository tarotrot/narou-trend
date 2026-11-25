import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて | なろうキーワードトレンド",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 text-sm leading-7">
      <h1 className="text-xl font-bold">このサイトについて</h1>

      <section>
        <h2 className="font-bold">目的</h2>
        <p>
          小説家になろうに掲載された作品のランキングから、どのようなキーワードが多く付けられているかを集計し、グラフで紹介する非商用のサイトです。
        </p>
      </section>

      <section>
        <h2 className="font-bold">データの出典と取得方法</h2>
        <p>
          データの出典は、
          <a className="underline" href="https://dev.syosetu.com/man/api/">
            なろうデベロッパー（なろう小説API）
          </a>
          です。APIからランキング上位の作品の情報を取得しています。APIを通じて提供されていないデータの取得や、小説家になろうのサイトへの直接のアクセスは行っていません。
        </p>
        <p>
          運営は、
          <a className="underline" href="https://dev.syosetu.com/site/guideline/">
            なろうデベロッパーの利用ガイドライン
          </a>
          と、その補足のお知らせ（2026年10月14日）を確認し、これに沿って運営するよう努めています。取得したデータを、AIの学習に利用することはありません。
        </p>
      </section>

      <section>
        <h2 className="font-bold">公開している内容</h2>
        <p>
          公開しているのは、キーワードの出現数などを集計した結果の一部のみです。取得した作品ごとの情報（タイトル、Nコード、ポイントなど）は、このサイトでは公開していません。
        </p>
      </section>

      <section>
        <h2 className="font-bold">非公式のサイトです</h2>
        <p>
          このサイトは、小説家になろう、および株式会社ヒナプロジェクトとは関係のない、個人が運営する非公式のサイトです。
        </p>
      </section>

      <section>
        <h2 className="font-bold">ご利用にあたってのお願い</h2>
        <p>
          このサイトに表示されている集計結果を、データベースやデータセットとして、そのまま、または加工して、再配布することはご遠慮ください。また、自動化された手段で、このサイトの内容を、まとめて取得することもご遠慮ください。
        </p>
      </section>

      <section>
        <h2 className="font-bold">お問い合わせ</h2>
        <p>
          ご意見や、掲載内容の削除のご依頼は、
          <a className="underline" href="https://forms.gle/BVxcu51wWWbXkpzb8">
            お問い合わせフォーム
          </a>
          からお願いします。内容を確認のうえ、必要に応じて対応します。すべてにお応えできるとは限りません。返信が必要な場合は、フォームに連絡先をご記入ください。内容によっては、返信できないことがあります。
        </p>
      </section>

      <section>
        <h2 className="font-bold">免責</h2>
        <p>
          掲載している集計結果の正確性や、完全性を、保証するものではありません。このサイトの利用によって生じた損害について、運営者は責任を負いません。
        </p>
      </section>
    </main>
  );
}