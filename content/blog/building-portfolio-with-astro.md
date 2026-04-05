---
title: "Astroでポートフォリオサイトを作った話"
date: "April 5, 2026"
excerpt: "React依存を最小限に抑えつつ、パフォーマンスとDXを両立させるAstroのアプローチについて。"
coverImage: "/new-favicon.png"
readTime: "5 min read"
tags: ["Astro", "TypeScript", "Web Development"]
---

## なぜAstroを選んだか

ポートフォリオサイトを作るにあたって、いくつかのフレームワークを検討した。Next.js、Remix、そしてAstro。

最終的にAstroを選んだ理由はシンプルで、**ポートフォリオに必要なJavaScriptは思っているより少ない**ということに気づいたからだ。

ほとんどのセクションは静的なHTMLで十分。フォームやモバイルメニューなど、インタラクティブな部分だけReactを使えばいい。Astroの `client:visible` ディレクティブを使えば、必要なコンポーネントだけをhydrateできる。

## アーキテクチャ

```
src/
├── components/
│   ├── Hero.astro          # 静的 → Astroコンポーネント
│   ├── Footer.astro         # 静的 → Astroコンポーネント
│   ├── navbar.tsx           # インタラクティブ → React
│   ├── contact.tsx          # フォーム → React
│   └── ...
├── lib/
│   ├── content.ts           # Markdownパーサー
│   └── markdown.ts          # unified pipeline
└── pages/
    ├── index.astro
    └── blog/[slug].astro
```

判断基準はこうだ：

- **ステートが不要** → `.astro` コンポーネント（ゼロJS）
- **ステートが必要** → `.tsx` コンポーネント（`client:visible` で遅延ロード）

## パフォーマンス最適化

初期バージョンではframer-motionを使っていたが、バンドルサイズが大きすぎた。CSSアニメーションに置き換えたところ、Lighthouseスコアが大幅に改善。

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

IntersectionObserverで要素が画面に入ったタイミングでアニメーションクラスを付与する。framer-motionの `whileInView` と同等の機能が、ライブラリなしで実現できる。

## コンテンツ管理

ブログ記事とプロジェクトはすべてMarkdownで管理している。CMSは使わず、`gray-matter` でfrontmatterをパース、`unified` エコシステムでHTMLに変換。

この選択にはトレードオフがある：

- **メリット**: Git管理、デプロイが速い、ベンダーロックインなし
- **デメリット**: 非エンジニアの共同編集者には不向き

個人ポートフォリオなら前者のメリットが圧倒的に上回る。

## 学んだこと

1. **Astroのアイランドアーキテクチャは強力** — 必要な部分だけJSを送るので、TTIが速い
2. **CSSアニメーションは十分** — ほとんどのUIアニメーションにJSライブラリは不要
3. **Markdownは最高のCMS** — エンジニアにとっては

次はRSSフィードと動的OGP画像の生成を追加する予定。（この記事を読んでいる頃にはもう実装されているかもしれない。）
