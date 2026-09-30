# fairy-pitta.net 作り直し 実装手順書

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** fairy-pitta.net を「履歴書そのもの」の見た目をした、React・Tailwind を使わない Astro の完全静的サイトに作り直す。

**Architecture:** Astro 5 の静的出力。データは `content/**/*.md`（記事・作品）と `src/data/cv.ts`（経歴）の2種類で、`src/lib/*.ts` の純粋な関数が読み込み・整形し、`.astro` ページは表示だけを担当する。見た目は `src/styles/site.css` 1ファイル。ブラウザで動く JavaScript は問い合わせフォームだけ。

**Tech Stack:** Astro 5, TypeScript, gray-matter, unified/remark/rehype, satori + sharp, vitest, pnpm 10

**Spec:** `docs/superpowers/specs/2026-09-30-site-redesign-design.md`

## Global Constraints

- パッケージ管理は pnpm。`package.json` に `"packageManager": "pnpm@10.23.0"`。`package-lock.json` は置かない
- Astro は現行の `^5.0.0` のまま（EmDash 作業で入った Astro 6 は捨てる）。`.nvmrc` は `22`
- `output` は静的（アダプターなし）。`site: "https://fairy-pitta.net"`
- React / Tailwind / shadcn / lucide-react / EmDash 関連の依存は残さない
- 書体は `-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif`。サイトでは外部フォントを読み込まない（サムネ画像生成のビルド時だけ Google Fonts を取得してよい）
- 色は CSS 変数（`--fg --muted --faint --line --bg --code-bg`）のみ。強調色なし。暗い画面は `prefers-color-scheme: dark` で自動切り替え
- URL は現行と同じ: `/`, `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]`, `/rss.xml`, `/og/blog-[slug].png`, `/og/project-[slug].png`, `/privacy`, `/terms`
- 表示言語は英語。名前表記は「Shuna Maekawa (fairy-pitta)」
- 公開しない: 住所（Tampines, 520297）、在留資格（Employment Pass, EP, PR pending）、取引先案件の数字、GPA の数値
- 日付表示は `YYYY-MM`（一覧・トップ）と `YYYY-MM-DD`（本文ページ）
- 問い合わせ送信先: `https://resend-worker.shuna120700.workers.dev/api/contact`、本文は `{"name","email","message"}` の JSON
- コミットの末尾に `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>` を付ける

## Review Focus

- YAML で引用符なしの `date: 2025-05-18` は gray-matter が `Date` 型にする → 文字列と同じく正しく読めること（Task 3 でテスト）
- `tags` が無い／`coverImage`・`githubUrl`・`liveUrl` が空文字の Markdown → ページが落ちず、空のリンクや壊れた画像を出さないこと（Task 3 でテスト）
- Qiita API が 403（回数制限）・通信エラー・配列でない JSON を返す → 記事一覧は自分の記事だけで作られ、ビルドは成功すること（Task 5 でテスト）
- 問い合わせ送信先が 500 を返す／通信できない → 「送信できなかった」とメールアドレスを表示し、ボタンが再び押せること（Task 7 でテスト）
- 経歴データに住所や在留資格の文字列が紛れ込む → テストで失敗させること（Task 7 でテスト）

## ファイル構成（完成時）

```
astro.config.mjs            静的出力の設定だけ
package.json / pnpm-lock.yaml / pnpm-workspace.yaml / .nvmrc
tsconfig.json               jsx 設定を削除
content/blog/*.md           既存のまま
content/projects/*.md       4件に featured / order を追加
src/data/cv.ts              経歴データ（型つき）
src/data/cv.test.ts
src/lib/content.ts          Markdown の読み込み・日付変換・featured 抽出・作品リンク
src/lib/content.test.ts
src/lib/markdown.ts         Markdown → HTML（既存のまま）
src/lib/qiita.ts            ビルド時に Qiita 記事を取得
src/lib/qiita.test.ts
src/lib/writing.ts          自分の記事と Qiita 記事を1つの一覧にまとめる
src/lib/writing.test.ts
src/lib/contact.ts          問い合わせ送信
src/lib/contact.test.ts
src/lib/og-image.ts         サムネ画像（新デザイン）
src/layouts/Layout.astro    <head>・共通フッター
src/components/Section.astro  小見出しつきの区画
src/components/Row.astro      「左に内容・右に日付など」の1行
src/components/Contact.astro  問い合わせフォーム
src/styles/site.css
src/pages/index.astro
src/pages/blog/index.astro, src/pages/blog/[slug].astro
src/pages/projects/index.astro, src/pages/projects/[slug].astro
src/pages/rss.xml.ts, src/pages/og/[slug].png.ts
src/pages/privacy.astro, src/pages/terms.astro
```

---

### Task 1: EmDash 作業の退避と作業ツリーの復元

**Files:**
- Create: ブランチ `wip/emdash-migration`（退避用）
- Modify: `.gitignore`
- Delete（作業ツリーから）: `seed/`, `scripts/`, `emdash-env.d.ts`, `src/live.config.ts`, `wrangler.jsonc`, `src/components/portable-text-renderer.tsx`, `data.db*`, `uploads/`, `dist/`

**Interfaces:**
- Consumes: なし
- Produces: `feat/site-redesign` の作業ツリーが EmDash 作業前（コミット `1035087` 時点のソース）＋設計書・手順書だけの状態になる。以降のタスクはこの状態から始まる

- [ ] **Step 1: 今の状態を確認する**

Run: `git branch --show-current && git status --short`
Expected: `feat/site-redesign`。`M astro.config.mjs` などの変更と `?? seed/` などの未追跡ファイルが並ぶ。`docs/superpowers/` は表示されない（コミット済み）

- [ ] **Step 2: 退避用ブランチに EmDash 作業をコミットする（データベースと画像アップロードは除く）**

```bash
git switch -c wip/emdash-migration
git add -A -- . ':!data.db*' ':!uploads' ':!dist' ':!.superpowers'
git commit -m "wip: stash EmDash migration work (abandoned)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
git switch feat/site-redesign
```

Expected: 退避用ブランチにコミットができ、`feat/site-redesign` に戻ると追跡していたファイルは `1035087` 時点に戻る

- [ ] **Step 3: 残った追跡外のファイルを消す**

```bash
rm -rf data.db data.db-shm data.db-wal uploads dist
git status --short
```

Expected: `?? .superpowers/` だけが表示される（`seed/` などは退避用ブランチに入ったので、切り替え時に作業ツリーから消えている）

- [ ] **Step 4: `.gitignore` の末尾に追記する**

`.gitignore` の最後に次を追加する:

```
# brainstorming mockups
.superpowers/

# leftover local CMS data
data.db*
uploads/
```

- [ ] **Step 5: 確認してコミットする**

Run: `git status --short`
Expected: ` M .gitignore` だけ

```bash
git add .gitignore
git commit -m "chore: ignore brainstorming mockups and local CMS data

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 土台の入れ替え（pnpm 化・依存の削除・共通レイアウトと CSS）

**Files:**
- Modify: `package.json`, `pnpm-workspace.yaml`, `astro.config.mjs`, `tsconfig.json`
- Create: `.nvmrc`, `src/styles/site.css`, `src/layouts/Layout.astro`（全面書き換え）, `src/components/Section.astro`, `src/components/Row.astro`, `src/pages/index.astro`（仮）
- Delete: `package-lock.json`, `components.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/components/*`（上記の新規以外すべて）, `src/components/ui/`, `src/hooks/`, `src/contexts/`, `src/lib/utils.ts`, `src/lib/utils.test.ts`, `src/lib/resend.ts`, `src/styles/globals.css`, `src/pages/blog/*`, `src/pages/projects/*`, `src/pages/privacy.astro`, `src/pages/terms.astro`, `public/hero_desktop.webp`, `public/hero_mobile.webp`

**Interfaces:**
- Consumes: Task 1 の作業ツリー
- Produces:
  - `Layout.astro` の Props: `{ title?: string; description?: string; ogImage?: string }`（`ogImage` はサイト内の絶対パス。例 `/og/blog-foo.png`）
  - `Section.astro` の Props: `{ title: string }`、中身は `<slot />`
  - `Row.astro` の Props: `{ meta?: string }`、左側の内容は `<slot />`
  - `site.css` のクラス: `.page .muted .links .summary .section .section-title .row .row-main .row-meta .list .bullets .more .crumb .meta .prose .figure .footer-nav .site-footer .contact .status`

- [ ] **Step 1: 使わなくなる依存を外し、pnpm に切り替える**

```bash
rm -rf node_modules package-lock.json
pnpm remove @astrojs/mdx @astrojs/react @astrojs/tailwind @hookform/resolvers @radix-ui/react-slot class-variance-authority clsx date-fns lucide-react react react-dom react-hook-form resend tailwind-merge tailwindcss tailwindcss-animate zod @tailwindcss/typography @types/react @types/react-dom
pnpm add -D tsx
pnpm pkg set packageManager="pnpm@10.23.0"
echo 22 > .nvmrc
```

Expected: `package.json` の依存が `@astrojs/check @astrojs/rss astro gray-matter rehype-highlight rehype-stringify remark-gfm remark-parse remark-rehype satori sharp typescript unified`、開発用が `@types/node tsx vitest` だけになる

- [ ] **Step 2: `package.json` の scripts を整える**

`scripts` を次に置き換える:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro check && astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

`pnpm-workspace.yaml` は次の内容にする:

```yaml
onlyBuiltDependencies:
  - esbuild
  - sharp
```

- [ ] **Step 3: 古いファイルを消す**

```bash
git rm -q -r components.json tailwind.config.ts postcss.config.mjs src/components src/hooks src/lib/utils.ts src/lib/utils.test.ts src/lib/resend.ts src/styles/globals.css src/pages/blog src/pages/projects src/pages/privacy.astro src/pages/terms.astro public/hero_desktop.webp public/hero_mobile.webp
rm -rf src/contexts
```

- [ ] **Step 4: `astro.config.mjs` を書き換える**

```js
// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://fairy-pitta.net",
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true,
  },
});
```

- [ ] **Step 5: `tsconfig.json` から React 用の設定を外す**

`"jsx": "react-jsx",` と `"jsxImportSource": "react",` の2行を削除し、`include` を次にする:

```json
"include": ["src/**/*.ts", "src/**/*.astro"],
```

- [ ] **Step 6: `src/styles/site.css` を作る**

```css
:root {
  --fg: #1a1a1a;
  --muted: #666;
  --faint: #999;
  --line: #e6e6e6;
  --bg: #fff;
  --code-bg: #f5f5f5;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --fg: #e6e6e6;
    --muted: #a3a3a3;
    --faint: #777;
    --line: #2e2e2e;
    --bg: #111;
    --code-bg: #1c1c1c;
  }
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font: 15px/1.65 -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif;
}

.page { max-width: 680px; margin: 0 auto; padding: 56px 20px 64px; }

a { color: inherit; text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 3px; }
a:hover { text-decoration-color: currentColor; }

h1 { font-size: 1.4rem; font-weight: 600; line-height: 1.3; margin: 0; }
.muted { color: var(--muted); }
.links { margin: 8px 0 0; }
.summary { margin: 20px 0 0; }

.section { margin-top: 40px; }
.section-title {
  font-size: .75rem; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
  color: var(--faint); margin: 0 0 10px;
}

.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.row + .row { margin-top: 4px; }
.row-main { min-width: 0; }
.row-meta { color: var(--faint); font-size: .875rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
.list .row { margin: 0; padding: 7px 0; border-top: 1px solid var(--line); }
.list .row:last-child { border-bottom: 1px solid var(--line); }

.bullets { margin: 4px 0 14px; padding-left: 1.1em; }
.bullets li { margin: 2px 0; }
.more { font-size: .875rem; margin: 8px 0 0; color: var(--muted); }

.crumb { font-size: .875rem; color: var(--muted); margin: 0 0 24px; }
.meta { font-size: .875rem; color: var(--muted); margin: 6px 0 0; }

.prose { margin-top: 32px; }
.prose h2 { font-size: 1.1rem; margin: 2em 0 .6em; }
.prose h3 { font-size: 1rem; margin: 1.6em 0 .5em; }
.prose p, .prose ul, .prose ol, .prose pre, .prose table, .prose blockquote { margin: 0 0 1em; }
.prose img { max-width: 100%; height: auto; }
.prose blockquote { border-left: 2px solid var(--line); padding-left: 1em; color: var(--muted); }
.prose table { display: block; overflow-x: auto; border-collapse: collapse; font-size: .875rem; }
.prose th, .prose td { border-bottom: 1px solid var(--line); padding: 6px 8px; text-align: left; }

code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .875em; }
:not(pre) > code { background: var(--code-bg); padding: .1em .3em; }
pre { background: var(--code-bg); padding: 12px 14px; overflow-x: auto; font-size: .85rem; line-height: 1.5; }
.hljs-comment, .hljs-quote { color: var(--faint); font-style: italic; }
.hljs-keyword, .hljs-built_in, .hljs-title, .hljs-section { font-weight: 600; }
.hljs-string, .hljs-number, .hljs-literal { color: var(--muted); }

.figure { margin: 24px 0; }
.figure img { display: block; width: 100%; height: auto; border: 1px solid var(--line); }

.footer-nav { margin-top: 48px; padding-top: 12px; border-top: 1px solid var(--line); font-size: .875rem; color: var(--muted); }
.site-footer { margin-top: 64px; font-size: .8rem; color: var(--faint); }

.contact { display: grid; gap: 10px; max-width: 440px; }
.contact label { display: grid; gap: 4px; font-size: .875rem; color: var(--muted); }
.contact input, .contact textarea {
  font: inherit; color: var(--fg); background: var(--bg);
  border: 1px solid var(--line); padding: 8px 10px; width: 100%;
}
.contact button {
  justify-self: start; font: inherit; color: var(--fg); background: transparent;
  border: 1px solid var(--fg); padding: 6px 16px; cursor: pointer;
}
.contact button:disabled { opacity: .5; cursor: default; }
.status { font-size: .875rem; margin: 8px 0 0; }

@media (max-width: 520px) {
  .page { padding-top: 40px; }
  .row { flex-direction: column; gap: 0; }
}
```

- [ ] **Step 7: `src/layouts/Layout.astro` を書き換える**

```astro
---
import '../styles/site.css';

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const {
  title = 'Shuna Maekawa — Software Engineer',
  description = 'Shuna Maekawa (fairy-pitta), full-stack software engineer based in Singapore.',
  ogImage = '/new-favicon.png',
} = Astro.props;

const base = Astro.site ?? Astro.url;
const fullUrl = new URL(Astro.url.pathname, base).href;
const imageUrl = new URL(ogImage, base).href;
const isGeneratedImage = ogImage.startsWith('/og/');
const year = new Date().getFullYear();
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={fullUrl} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={fullUrl} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content={isGeneratedImage ? '1200' : '512'} />
    <meta property="og:image:height" content={isGeneratedImage ? '630' : '512'} />
    <meta name="twitter:card" content={isGeneratedImage ? 'summary_large_image' : 'summary'} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    <link rel="alternate" type="application/rss+xml" title="Shuna Maekawa — Writing" href="/rss.xml" />
    <link rel="icon" type="image/png" sizes="32x32" href="/new-favicon_t.png" />
    <link rel="icon" type="image/svg+xml" href="/new-favicon_svg.svg" />
    <link rel="apple-touch-icon" href="/apple-icon.png" />
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <div class="page">
      <slot />
      <footer class="site-footer">
        © {year} Shuna Maekawa · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/rss.xml">RSS</a>
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 8: `src/components/Section.astro` と `src/components/Row.astro` を作る**

`src/components/Section.astro`:

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<section class="section">
  <h2 class="section-title">{title}</h2>
  <slot />
</section>
```

`src/components/Row.astro`:

```astro
---
interface Props {
  meta?: string;
}
const { meta } = Astro.props;
---

<div class="row">
  <div class="row-main"><slot /></div>
  {meta && <span class="row-meta">{meta}</span>}
</div>
```

- [ ] **Step 9: 仮のトップページを置く（Task 7 で置き換える）**

`src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout>
  <h1>Shuna Maekawa <span class="muted">(fairy-pitta)</span></h1>
  <p class="muted">Software Engineer · Singapore</p>
</Layout>
```

- [ ] **Step 10: テストとビルドが通ることを確認する**

Run: `pnpm test && pnpm build`
Expected: `content.test.ts` が全件成功。ビルドが成功し、`dist/index.html`, `dist/rss.xml`, `dist/og/blog-fiscal-month-hell.png` が作られる（RSS とサムネ画像は既存のコードのままで動く）

Run: `grep -rn "react\|tailwind" src astro.config.mjs package.json || echo clean`
Expected: `clean`

- [ ] **Step 11: コミットする**

```bash
git add -A
git commit -m "refactor: replace React/Tailwind stack with plain Astro and pnpm

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 記事・作品の読み込み（日付変換・featured・作品リンク）

**Files:**
- Modify: `src/lib/content.ts`（全面書き換え）, `src/lib/content.test.ts`（全面書き換え）
- Modify: `content/projects/Portree.md`, `content/projects/PRViewer.md`, `content/projects/PrintableSpectrogram.md`, `content/projects/CodeAnnotator.md`（frontmatter に2行追加）

**Interfaces:**
- Consumes: なし
- Produces（`src/lib/content.ts`）:
  - `interface BlogFrontmatter { title: string; date: string; excerpt: string; coverImage?: string; readTime?: string; tags: string[] }`
  - `interface ProjectFrontmatter { title: string; description: string; date: string; coverImage?: string; tags: string[]; liveUrl?: string; githubUrl?: string; gallery?: string[]; featured?: boolean; order?: number }`
  - `interface BlogPost { slug: string; frontmatter: BlogFrontmatter; content: string; date: Date }`
  - `interface Project { slug: string; frontmatter: ProjectFrontmatter; content: string; date: Date }`
  - `parseContentDate(value: unknown, source: string): Date`（UTC の0時。変換できなければ `Error`）
  - `formatYearMonth(date: Date): string` → `"2026-04"`
  - `formatDate(date: Date): string` → `"2026-04-05"`
  - `getAllBlogPosts(): BlogPost[]`（新しい順）
  - `getAllProjects(): Project[]`（新しい順）
  - `getFeaturedProjects(limit?: number): Project[]`（`featured: true` のみ、`order` 昇順→日付の新しい順、既定4件）
  - `projectLinks(frontmatter: ProjectFrontmatter): { label: 'Code' | 'Live'; href: string }[]`（空文字は除外）

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/content.test.ts` を次の内容にする:

```ts
import { describe, it, expect } from 'vitest'
import {
  parseContentDate,
  formatYearMonth,
  formatDate,
  getAllBlogPosts,
  getAllProjects,
  getFeaturedProjects,
  projectLinks,
  type ProjectFrontmatter,
} from './content'

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d))

describe('parseContentDate', () => {
  it.each([
    ['April 5, 2026', utc(2026, 4, 5)],
    ['May 18, 2025', utc(2025, 5, 18)],
    ['Oct 13, 2025', utc(2025, 10, 13)],
    ['13 Jan, 2026', utc(2026, 1, 13)],
    ['6 Feb, 2026', utc(2026, 2, 6)],
    ['2025-05-18', utc(2025, 5, 18)],
  ])('parses_%s', (input, expected) => {
    expect(parseContentDate(input, 'test.md').getTime()).toBe(expected.getTime())
  })

  it('accepts_date_objects_from_unquoted_yaml', () => {
    const fromYaml = new Date('2025-05-18T00:00:00.000Z')
    expect(parseContentDate(fromYaml, 'test.md').getTime()).toBe(utc(2025, 5, 18).getTime())
  })

  it.each(['', 'Smarch 5, 2026', 'Feb 30, 2026', 'yesterday', 42])('rejects_%s', (input) => {
    expect(() => parseContentDate(input, 'bad.md')).toThrow(/bad\.md/)
  })
})

describe('formatters', () => {
  it('formats_year_month_and_full_date_in_utc', () => {
    expect(formatYearMonth(utc(2026, 4, 5))).toBe('2026-04')
    expect(formatDate(utc(2026, 4, 5))).toBe('2026-04-05')
  })
})

describe('getAllBlogPosts', () => {
  it('returns_posts_sorted_newest_first_with_tags_arrays', () => {
    const posts = getAllBlogPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date.getTime()).toBeGreaterThanOrEqual(posts[i].date.getTime())
    }
    for (const post of posts) {
      expect(post.slug).toBeTruthy()
      expect(post.frontmatter.title).toBeTruthy()
      expect(Array.isArray(post.frontmatter.tags)).toBe(true)
    }
  })
})

describe('getAllProjects', () => {
  it('returns_projects_sorted_newest_first', () => {
    const projects = getAllProjects()
    expect(projects.length).toBeGreaterThan(0)
    for (let i = 1; i < projects.length; i++) {
      expect(projects[i - 1].date.getTime()).toBeGreaterThanOrEqual(projects[i].date.getTime())
    }
  })
})

describe('getFeaturedProjects', () => {
  it('returns_the_four_featured_projects_in_order', () => {
    expect(getFeaturedProjects().map((p) => p.slug)).toEqual([
      'Portree',
      'PRViewer',
      'PrintableSpectrogram',
      'CodeAnnotator',
    ])
  })

  it('respects_the_limit', () => {
    expect(getFeaturedProjects(2)).toHaveLength(2)
  })
})

describe('projectLinks', () => {
  const base: ProjectFrontmatter = { title: 't', description: 'd', date: '2025-01-01', tags: [] }

  it('omits_empty_and_missing_urls', () => {
    expect(projectLinks({ ...base, githubUrl: '', liveUrl: '  ' })).toEqual([])
    expect(projectLinks(base)).toEqual([])
  })

  it('returns_code_then_live', () => {
    expect(projectLinks({ ...base, githubUrl: 'https://github.com/x', liveUrl: 'https://x.dev' })).toEqual([
      { label: 'Code', href: 'https://github.com/x' },
      { label: 'Live', href: 'https://x.dev' },
    ])
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `pnpm vitest run src/lib/content.test.ts`
Expected: FAIL（`parseContentDate` などが存在しない）

- [ ] **Step 3: `src/lib/content.ts` を書き換える**

```ts
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const blogDirectory = path.join(process.cwd(), "content", "blog")
const projectsDirectory = path.join(process.cwd(), "content", "projects")

export interface BlogFrontmatter {
  title: string
  date: string
  excerpt: string
  coverImage?: string
  readTime?: string
  tags: string[]
}

export interface ProjectFrontmatter {
  title: string
  description: string
  date: string
  coverImage?: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
  gallery?: string[]
  featured?: boolean
  order?: number
}

export interface BlogPost {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
  date: Date
}

export interface Project {
  slug: string
  frontmatter: ProjectFrontmatter
  content: string
  date: Date
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function buildUtcDate(year: number, month: number | undefined, day: number): Date | null {
  if (month === undefined) return null
  const date = new Date(Date.UTC(year, month, day))
  return date.getUTCMonth() === month && date.getUTCDate() === day ? date : null
}

// Frontmatter dates come in several formats ("April 5, 2026", "13 Jan, 2026", "2025-05-18")
// and unquoted ISO dates arrive from YAML as Date objects.
export function parseContentDate(value: unknown, source: string): Date {
  let date: Date | null = null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  } else if (typeof value === "string") {
    const text = value.trim()
    const monthFirst = text.match(/^([A-Za-z]+)\.? (\d{1,2}),? (\d{4})$/)
    const dayFirst = text.match(/^(\d{1,2}) ([A-Za-z]+)\.?,? (\d{4})$/)
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (monthFirst) {
      date = buildUtcDate(Number(monthFirst[3]), MONTHS[monthFirst[1].slice(0, 3).toLowerCase()], Number(monthFirst[2]))
    } else if (dayFirst) {
      date = buildUtcDate(Number(dayFirst[3]), MONTHS[dayFirst[2].slice(0, 3).toLowerCase()], Number(dayFirst[1]))
    } else if (iso) {
      date = buildUtcDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    }
  }

  if (!date) {
    throw new Error(`Invalid date in ${source}: ${String(value)}`)
  }
  return date
}

const pad = (n: number) => String(n).padStart(2, "0")

export function formatYearMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

export function formatDate(date: Date): string {
  return `${formatYearMonth(date)}-${pad(date.getUTCDate())}`
}

function readMarkdownFiles<T extends { date: string; tags: string[] }>(directory: string) {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const { data, content } = matter(fs.readFileSync(path.join(directory, fileName), "utf8"))
      const date = parseContentDate(data.date, fileName)
      const frontmatter = { ...data, tags: Array.isArray(data.tags) ? data.tags : [] } as T
      return { slug, frontmatter, content, date }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function getAllBlogPosts(): BlogPost[] {
  return readMarkdownFiles<BlogFrontmatter>(blogDirectory)
}

export function getAllProjects(): Project[] {
  return readMarkdownFiles<ProjectFrontmatter>(projectsDirectory)
}

export function getFeaturedProjects(limit = 4): Project[] {
  return getAllProjects()
    .filter((project) => project.frontmatter.featured === true)
    .sort((a, b) => (a.frontmatter.order ?? Infinity) - (b.frontmatter.order ?? Infinity))
    .slice(0, limit)
}

export function projectLinks(frontmatter: ProjectFrontmatter): { label: "Code" | "Live"; href: string }[] {
  const links: { label: "Code" | "Live"; href: string }[] = []
  if (frontmatter.githubUrl?.trim()) links.push({ label: "Code", href: frontmatter.githubUrl.trim() })
  if (frontmatter.liveUrl?.trim()) links.push({ label: "Live", href: frontmatter.liveUrl.trim() })
  return links
}
```

（`Array.prototype.sort` は安定ソートなので、`order` が同じなら日付の新しい順が保たれる）

- [ ] **Step 4: 4件の作品に featured を付ける**

各ファイルの frontmatter の `tags:` 行の直後に、次の2行を追加する:

| ファイル | 追加する行 |
|---|---|
| `content/projects/Portree.md` | `featured: true` / `order: 1` |
| `content/projects/PRViewer.md` | `featured: true` / `order: 2` |
| `content/projects/PrintableSpectrogram.md` | `featured: true` / `order: 3` |
| `content/projects/CodeAnnotator.md` | `featured: true` / `order: 4` |

- [ ] **Step 5: テストが通ることを確認する**

Run: `pnpm vitest run src/lib/content.test.ts`
Expected: PASS（全件）

- [ ] **Step 6: 既存の呼び出し側が壊れていないことを確認する**

Run: `pnpm build`
Expected: 成功（`rss.xml.ts` と `og/[slug].png.ts` は `getAllBlogPosts` / `getAllProjects` と `frontmatter.title` / `frontmatter.tags` だけを使っているのでそのまま動く）

- [ ] **Step 7: コミットする**

```bash
git add src/lib/content.ts src/lib/content.test.ts content/projects
git commit -m "feat: parse mixed frontmatter dates and mark featured projects

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 作品ページ（一覧・詳細）

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`

**Interfaces:**
- Consumes: `getAllProjects`, `formatYearMonth`, `formatDate`, `projectLinks`, `type Project`（Task 3）、`markdownToHtml(markdown: string): Promise<string>`（既存 `src/lib/markdown.ts`）、`Layout` / `Row`（Task 2）
- Produces: `/projects` と `/projects/[slug]`（slug はファイル名。例 `/projects/Portree`）

- [ ] **Step 1: `src/pages/projects/index.astro` を作る**

```astro
---
import Layout from '../../layouts/Layout.astro';
import Row from '../../components/Row.astro';
import { getAllProjects, formatYearMonth } from '../../lib/content';

const projects = getAllProjects();
---

<Layout title="Projects — Shuna Maekawa" description="Side projects and tools by Shuna Maekawa.">
  <p class="crumb"><a href="/">Shuna Maekawa</a> / Projects</p>
  <h1>Projects</h1>
  <div class="list section">
    {projects.map((project) => (
      <Row meta={formatYearMonth(project.date)}>
        <a href={`/projects/${project.slug}`}>{project.frontmatter.title}</a>
        <span class="muted"> — {project.frontmatter.description}</span>
      </Row>
    ))}
  </div>
</Layout>
```

- [ ] **Step 2: `src/pages/projects/[slug].astro` を作る**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getAllProjects, formatDate, projectLinks, type Project } from '../../lib/content';
import { markdownToHtml } from '../../lib/markdown';

export function getStaticPaths() {
  return getAllProjects().map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

interface Props {
  project: Project;
}

const { project } = Astro.props;
const { frontmatter } = project;
const html = await markdownToHtml(project.content);
const links = projectLinks(frontmatter);
const meta = [formatDate(project.date), frontmatter.tags.join(', ')].filter(Boolean).join(' · ');
const gallery = (frontmatter.gallery ?? []).filter((src) => src.trim() !== '');
---

<Layout
  title={`${frontmatter.title} — Shuna Maekawa`}
  description={frontmatter.description}
  ogImage={`/og/project-${project.slug}.png`}
>
  <p class="crumb"><a href="/">Shuna Maekawa</a> / <a href="/projects">Projects</a></p>
  <h1>{frontmatter.title}</h1>
  <p class="meta">{meta}</p>
  <p class="summary">{frontmatter.description}</p>
  {links.length > 0 && (
    <p class="links">
      {links.map((link, i) => (
        <>{i > 0 && ' · '}<a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></>
      ))}
    </p>
  )}

  {frontmatter.coverImage?.trim() && (
    <figure class="figure">
      <img src={frontmatter.coverImage} alt={frontmatter.title} width="1280" height="720" decoding="async" />
    </figure>
  )}

  <article class="prose" set:html={html} />

  {gallery.map((src) => (
    <figure class="figure">
      <img src={src} alt={`${frontmatter.title} screenshot`} loading="lazy" decoding="async" />
    </figure>
  ))}

  <p class="footer-nav">← <a href="/projects">All projects</a></p>
</Layout>
```

- [ ] **Step 3: ビルドして出力を確認する**

Run: `pnpm build && ls dist/projects && grep -c 'href=""' dist/projects/SGBirdCall/index.html`
Expected: ビルド成功。`dist/projects/` に10件のフォルダと `index.html`。最後の `grep -c` は `0`（空のリンクがない）

- [ ] **Step 4: コミットする**

```bash
git add src/pages/projects
git commit -m "feat: add plain project list and detail pages

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 記事ページ（一覧・詳細）と Qiita 記事の取り込み

**Files:**
- Modify: `src/lib/qiita.ts`（全面書き換え）
- Create: `src/lib/qiita.test.ts`, `src/lib/writing.ts`, `src/lib/writing.test.ts`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `getAllBlogPosts`, `formatYearMonth`, `formatDate`, `type BlogPost`（Task 3）、`markdownToHtml`、`Layout` / `Row`（Task 2）
- Produces:
  - `src/lib/qiita.ts`: `interface QiitaItem { title: string; url: string; createdAt: Date }`、`QIITA_ITEMS_URL: string`、`fetchQiitaItems(fetchImpl?: typeof fetch): Promise<QiitaItem[]>`（失敗時は `[]`、例外を投げない）
  - `src/lib/writing.ts`: `interface WritingItem { title: string; href: string; date: Date; external: boolean }`、`toWritingItems(posts: BlogPost[], qiita: QiitaItem[]): WritingItem[]`（新しい順）

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/qiita.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { fetchQiitaItems, QIITA_ITEMS_URL } from './qiita'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('fetchQiitaItems', () => {
  it('maps_valid_items_and_drops_malformed_ones', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        { title: 'A', url: 'https://qiita.com/Pitta/items/a', created_at: '2025-03-01T10:00:00+09:00' },
        { title: 'missing url', created_at: '2025-03-01T10:00:00+09:00' },
        { title: 'bad date', url: 'https://qiita.com/x', created_at: 'nope' },
      ]),
    ) as unknown as typeof fetch

    const items = await fetchQiitaItems(fetchImpl)

    expect(fetchImpl).toHaveBeenCalledWith(QIITA_ITEMS_URL)
    expect(items).toEqual([
      { title: 'A', url: 'https://qiita.com/Pitta/items/a', createdAt: new Date('2025-03-01T10:00:00+09:00') },
    ])
  })

  it('returns_empty_on_rate_limit', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => jsonResponse({ message: 'Rate limit exceeded' }, 403)) as unknown as typeof fetch
    expect(await fetchQiitaItems(fetchImpl)).toEqual([])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('returns_empty_on_network_error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => { throw new TypeError('fetch failed') }) as unknown as typeof fetch
    expect(await fetchQiitaItems(fetchImpl)).toEqual([])
    warn.mockRestore()
  })

  it('returns_empty_when_body_is_not_an_array', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchImpl = (async () => jsonResponse({ items: [] })) as unknown as typeof fetch
    expect(await fetchQiitaItems(fetchImpl)).toEqual([])
    warn.mockRestore()
  })
})
```

`src/lib/writing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { toWritingItems } from './writing'
import type { BlogPost } from './content'

const post = (slug: string, iso: string): BlogPost => ({
  slug,
  frontmatter: { title: `Post ${slug}`, date: iso, excerpt: '', tags: [] },
  content: '',
  date: new Date(`${iso}T00:00:00Z`),
})

describe('toWritingItems', () => {
  it('merges_own_posts_and_qiita_newest_first', () => {
    const items = toWritingItems(
      [post('old', '2025-01-01'), post('new', '2026-04-01')],
      [{ title: 'Q', url: 'https://qiita.com/Pitta/items/q', createdAt: new Date('2025-06-01T00:00:00Z') }],
    )

    expect(items).toEqual([
      { title: 'Post new', href: '/blog/new', date: new Date('2026-04-01T00:00:00Z'), external: false },
      { title: 'Q', href: 'https://qiita.com/Pitta/items/q', date: new Date('2025-06-01T00:00:00Z'), external: true },
      { title: 'Post old', href: '/blog/old', date: new Date('2025-01-01T00:00:00Z'), external: false },
    ])
  })

  it('works_with_no_qiita_items', () => {
    expect(toWritingItems([post('a', '2025-01-01')], [])).toHaveLength(1)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `pnpm vitest run src/lib/qiita.test.ts src/lib/writing.test.ts`
Expected: FAIL（`fetchQiitaItems` / `toWritingItems` が存在しない）

- [ ] **Step 3: `src/lib/qiita.ts` を書き換える**

```ts
// Qiita articles are fetched once at build time and listed next to our own posts.
export interface QiitaItem {
  title: string
  url: string
  createdAt: Date
}

export const QIITA_ITEMS_URL = "https://qiita.com/api/v2/users/Pitta/items?page=1&per_page=100"

function toQiitaItem(raw: unknown): QiitaItem | null {
  if (typeof raw !== "object" || raw === null) return null
  const { title, url, created_at } = raw as Record<string, unknown>
  if (typeof title !== "string" || typeof url !== "string" || typeof created_at !== "string") return null
  const createdAt = new Date(created_at)
  if (Number.isNaN(createdAt.getTime())) return null
  return { title, url, createdAt }
}

// Never throws: a Qiita outage or rate limit must not break the site build.
export async function fetchQiitaItems(fetchImpl: typeof fetch = fetch): Promise<QiitaItem[]> {
  try {
    const response = await fetchImpl(QIITA_ITEMS_URL)
    if (!response.ok) {
      console.warn(`[qiita] skipped: HTTP ${response.status}`)
      return []
    }
    const body: unknown = await response.json()
    if (!Array.isArray(body)) {
      console.warn("[qiita] skipped: unexpected response shape")
      return []
    }
    return body.map(toQiitaItem).filter((item): item is QiitaItem => item !== null)
  } catch (error) {
    console.warn("[qiita] skipped:", error)
    return []
  }
}
```

- [ ] **Step 4: `src/lib/writing.ts` を作る**

```ts
import type { BlogPost } from "./content"
import type { QiitaItem } from "./qiita"

export interface WritingItem {
  title: string
  href: string
  date: Date
  external: boolean
}

export function toWritingItems(posts: BlogPost[], qiita: QiitaItem[]): WritingItem[] {
  const own = posts.map((post) => ({
    title: post.frontmatter.title,
    href: `/blog/${post.slug}`,
    date: post.date,
    external: false,
  }))
  const external = qiita.map((item) => ({
    title: item.title,
    href: item.url,
    date: item.createdAt,
    external: true,
  }))
  return [...own, ...external].sort((a, b) => b.date.getTime() - a.date.getTime())
}
```

- [ ] **Step 5: テストが通ることを確認する**

Run: `pnpm vitest run src/lib/qiita.test.ts src/lib/writing.test.ts`
Expected: PASS（全件）

- [ ] **Step 6: `src/pages/blog/index.astro` を作る**

```astro
---
import Layout from '../../layouts/Layout.astro';
import Row from '../../components/Row.astro';
import { getAllBlogPosts, formatYearMonth } from '../../lib/content';
import { fetchQiitaItems } from '../../lib/qiita';
import { toWritingItems } from '../../lib/writing';

const items = toWritingItems(getAllBlogPosts(), await fetchQiitaItems());
---

<Layout title="Writing — Shuna Maekawa" description="Notes on software engineering by Shuna Maekawa.">
  <p class="crumb"><a href="/">Shuna Maekawa</a> / Writing</p>
  <h1>Writing</h1>
  <p class="meta"><a href="/rss.xml">RSS</a></p>
  <div class="list section">
    {items.map((item) => (
      <Row meta={formatYearMonth(item.date)}>
        {item.external ? (
          <>
            <a href={item.href} target="_blank" rel="noopener noreferrer">{item.title}</a>
            <span class="muted"> Qiita ↗</span>
          </>
        ) : (
          <a href={item.href}>{item.title}</a>
        )}
      </Row>
    ))}
  </div>
</Layout>
```

- [ ] **Step 7: `src/pages/blog/[slug].astro` を作る**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getAllBlogPosts, formatDate, type BlogPost } from '../../lib/content';
import { markdownToHtml } from '../../lib/markdown';

export function getStaticPaths() {
  return getAllBlogPosts().map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

interface Props {
  post: BlogPost;
}

const { post } = Astro.props;
const { frontmatter } = post;
const html = await markdownToHtml(post.content);
const meta = [formatDate(post.date), frontmatter.readTime, frontmatter.tags.join(', ')]
  .filter(Boolean)
  .join(' · ');
---

<Layout
  title={`${frontmatter.title} — Shuna Maekawa`}
  description={frontmatter.excerpt}
  ogImage={`/og/blog-${post.slug}.png`}
>
  <p class="crumb"><a href="/">Shuna Maekawa</a> / <a href="/blog">Writing</a></p>
  <h1>{frontmatter.title}</h1>
  <p class="meta">{meta}</p>
  <article class="prose" set:html={html} />
  <p class="footer-nav">← <a href="/blog">All writing</a></p>
</Layout>
```

- [ ] **Step 8: ビルドして出力を確認する**

Run: `pnpm build && ls dist/blog | wc -l && grep -c 'Qiita ↗' dist/blog/index.html`
Expected: ビルド成功。`dist/blog` は記事12件のフォルダ＋`index.html`で `13`。Qiita の件数は通信状況次第（0 でもビルドは成功していること）

- [ ] **Step 9: 全テストを流してコミットする**

Run: `pnpm test`
Expected: PASS

```bash
git add src/lib/qiita.ts src/lib/qiita.test.ts src/lib/writing.ts src/lib/writing.test.ts src/pages/blog
git commit -m "feat: add plain writing pages with build-time Qiita items

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 共有用サムネ画像と RSS の見た目・文言

**Files:**
- Modify: `src/lib/og-image.ts`, `src/pages/rss.xml.ts`

**Interfaces:**
- Consumes: `getAllBlogPosts`（Task 3）
- Produces: `generateOgImage(title: string): Promise<Buffer>`（第2引数 `tags` は廃止）。`src/pages/og/[slug].png.ts` の呼び出しも合わせて直す

- [ ] **Step 1: `src/lib/og-image.ts` を書き換える**

```ts
import satori from 'satori'
import sharp from 'sharp'

// Fonts are fetched only at build time; the site itself uses system fonts.
async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
  const css = await (await fetch(url)).text()
  const match = css.match(/src:\s*url\(([^)]+)\)/)
  if (!match) throw new Error(`Failed to load font: ${family}`)
  return (await fetch(match[1])).arrayBuffer()
}

export async function generateOgImage(title: string): Promise<Buffer> {
  const [regular, semibold] = await Promise.all([
    loadGoogleFont('Inter', 400),
    loadGoogleFont('Inter', 600),
  ])

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: title.length > 60 ? '48px' : '60px', fontWeight: 600, lineHeight: 1.25 },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '26px', fontWeight: 400, color: '#666666' },
              children: 'Shuna Maekawa · fairy-pitta.net',
            },
          },
        ],
      },
    // satori accepts plain element objects; its types expect React nodes
    } as unknown as Parameters<typeof satori>[0],
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: semibold, weight: 600, style: 'normal' },
      ],
    },
  )

  return await sharp(Buffer.from(svg)).png().toBuffer()
}
```

- [ ] **Step 2: `src/pages/og/[slug].png.ts` の呼び出しを直す**

`props` から `tags` を外し、呼び出しを `generateOgImage(props.title as string)` にする。ファイル全体:

```ts
import type { APIContext, GetStaticPaths } from 'astro'
import { getAllBlogPosts, getAllProjects } from '../../lib/content'
import { generateOgImage } from '../../lib/og-image'

export const getStaticPaths: GetStaticPaths = () => [
  ...getAllBlogPosts().map((post) => ({
    params: { slug: `blog-${post.slug}` },
    props: { title: post.frontmatter.title },
  })),
  ...getAllProjects().map((project) => ({
    params: { slug: `project-${project.slug}` },
    props: { title: project.frontmatter.title },
  })),
]

export async function GET({ props }: APIContext) {
  const png = await generateOgImage(props.title as string)

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
```

- [ ] **Step 3: `src/pages/rss.xml.ts` を書き換える**

```ts
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllBlogPosts } from '../lib/content'

export function GET(context: APIContext) {
  return rss({
    title: 'Shuna Maekawa — Writing',
    description: 'Notes on software engineering by Shuna Maekawa.',
    site: context.site!.toString(),
    items: getAllBlogPosts().map((post) => ({
      title: post.frontmatter.title,
      pubDate: post.date,
      description: post.frontmatter.excerpt,
      link: `/blog/${post.slug}/`,
      categories: post.frontmatter.tags,
    })),
    customData: '<language>en</language>',
  })
}
```

- [ ] **Step 4: ビルドして画像と RSS を確認する**

Run: `pnpm build && ls dist/og | wc -l && grep -c '<item>' dist/rss.xml`
Expected: サムネ画像が `22`（記事12＋作品10）、RSS の `<item>` が `12`

`dist/og/blog-fiscal-month-hell.png` を画像として開き、白地に黒いタイトル、左下に灰色の「Shuna Maekawa · fairy-pitta.net」だけが描かれていることを目で確認する

- [ ] **Step 5: コミットする**

```bash
git add src/lib/og-image.ts src/pages/og src/pages/rss.xml.ts
git commit -m "style: plain OG images and renamed RSS feed

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 経歴データ・トップページ・問い合わせフォーム

**Files:**
- Create: `src/data/cv.ts`, `src/data/cv.test.ts`, `src/lib/contact.ts`, `src/lib/contact.test.ts`, `src/components/Contact.astro`
- Modify: `src/pages/index.astro`（仮のものを置き換え）

**Interfaces:**
- Consumes: `getAllBlogPosts`, `getFeaturedProjects`, `formatYearMonth`（Task 3）、`Layout` / `Section` / `Row`（Task 2）
- Produces:
  - `src/data/cv.ts`: 型 `CvLink { label: string; href: string }`, `CvExperience { role: string; org: string; period: string; bullets: string[] }`, `CvEducation { school: string; degree: string; period: string; note?: string }`, `CvSkillGroup { label: string; items: string[] }`, `Cv { name; handle; headline; email; links: CvLink[]; summary; experience: CvExperience[]; education: CvEducation[]; certifications: string[]; skills: CvSkillGroup[] }`、値 `cv: Cv`
    （設計書の型に `email: string` を足している。問い合わせフォームの失敗時表示と `<noscript>` で使うため）
  - `src/lib/contact.ts`: `interface ContactMessage { name: string; email: string; message: string }`、`CONTACT_ENDPOINT: string`、`sendContact(message: ContactMessage, fetchImpl?: typeof fetch): Promise<boolean>`（例外を投げない）

- [ ] **Step 1: 失敗するテストを書く**

`src/data/cv.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cv } from './cv'

describe('cv', () => {
  it('has_required_top_level_fields', () => {
    expect(cv.name).toBe('Shuna Maekawa')
    expect(cv.handle).toBe('fairy-pitta')
    expect(cv.headline).toBeTruthy()
    expect(cv.summary).toBeTruthy()
    expect(cv.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/)
    expect(cv.experience.length).toBeGreaterThan(0)
    expect(cv.education.length).toBeGreaterThan(0)
    expect(cv.certifications.length).toBeGreaterThan(0)
    expect(cv.skills.length).toBeGreaterThan(0)
  })

  it('has_no_empty_entries', () => {
    for (const job of cv.experience) {
      expect(job.role && job.org && job.period).toBeTruthy()
      job.bullets.forEach((b) => expect(b.trim()).not.toBe(''))
    }
    for (const group of cv.skills) {
      expect(group.label).toBeTruthy()
      expect(group.items.length).toBeGreaterThan(0)
    }
  })

  it('links_use_https_or_mailto', () => {
    for (const link of cv.links) {
      expect(link.href).toMatch(/^(https:\/\/|mailto:)/)
    }
  })

  it.each(['Tampines', '520297', 'Employment Pass', '(EP', 'PR pending', 'GPA', '4.52'])(
    'does_not_publish_%s',
    (secret) => {
      expect(JSON.stringify(cv)).not.toContain(secret)
    },
  )
})
```

`src/lib/contact.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { sendContact, CONTACT_ENDPOINT } from './contact'

const message = { name: 'Ada', email: 'ada@example.com', message: 'Hello' }

describe('sendContact', () => {
  it('posts_json_to_the_worker_and_returns_true_on_success', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 })) as unknown as typeof fetch

    expect(await sendContact(message, fetchImpl)).toBe(true)
    expect(fetchImpl).toHaveBeenCalledWith(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
  })

  it('returns_false_on_server_error', async () => {
    const fetchImpl = (async () => new Response('fail', { status: 500 })) as unknown as typeof fetch
    expect(await sendContact(message, fetchImpl)).toBe(false)
  })

  it('returns_false_on_network_error', async () => {
    const fetchImpl = (async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    expect(await sendContact(message, fetchImpl)).toBe(false)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `pnpm vitest run src/data/cv.test.ts src/lib/contact.test.ts`
Expected: FAIL（`./cv` と `./contact` が存在しない）

- [ ] **Step 3: `src/lib/contact.ts` を作る**

```ts
export interface ContactMessage {
  name: string
  email: string
  message: string
}

export const CONTACT_ENDPOINT = "https://resend-worker.shuna120700.workers.dev/api/contact"

// Returns false instead of throwing so the form can always show a fallback.
export async function sendContact(message: ContactMessage, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
    return response.ok
  } catch {
    return false
  }
}
```

- [ ] **Step 4: `src/data/cv.ts` を作る**

情報源は `~/Projects/pitta/career-ops/cv.md`（2026-04-11）。住所・在留資格・取引先案件の数字・GPA は入れない。

```ts
export interface CvLink {
  label: string
  href: string
}

export interface CvExperience {
  role: string
  org: string
  period: string
  bullets: string[]
}

export interface CvEducation {
  school: string
  degree: string
  period: string
  note?: string
}

export interface CvSkillGroup {
  label: string
  items: string[]
}

export interface Cv {
  name: string
  handle: string
  headline: string
  email: string
  links: CvLink[]
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  certifications: string[]
  skills: CvSkillGroup[]
}

// Source: career-ops/cv.md. Keep address, visa status, client figures and GPA out of this file.
export const cv: Cv = {
  name: "Shuna Maekawa",
  handle: "fairy-pitta",
  headline: "Software Engineer · Singapore",
  email: "shuna120700@gmail.com",
  links: [
    { label: "Email", href: "mailto:shuna120700@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shunamaekawa" },
    { label: "GitHub", href: "https://github.com/fairy-pitta" },
    { label: "Qiita", href: "https://qiita.com/Pitta" },
  ],
  summary:
    "Full-stack engineer working across React, TypeScript, Python and Go, from database design to deployment. Currently leading engineering on client-facing systems at WAO Singapore.",
  experience: [
    {
      role: "Software Engineer",
      org: "WAO Singapore",
      period: "Dec 2023 – Present",
      bullets: [
        "Led a team of 3 building an invoicing and customer-communication platform on React and Hono (Cloudflare Workers), replacing a manual spreadsheet workflow.",
        "Project manager and lead engineer for a financial system built for an external client: architecture, client communication and task allocation.",
        "Also teach maths, English, science and introductory programming one-on-one.",
      ],
    },
    {
      role: "Part-time Keeper",
      org: "Mandai Wildlife Group",
      period: "May 2022 – Apr 2023",
      bullets: [],
    },
    {
      role: "Administrative Assistant",
      org: "Osaka Prefectural Government",
      period: "May 2020 – Jul 2020",
      bullets: [],
    },
    {
      role: "Student Research Associate",
      org: "Yale-NUS Ecology Adaptation Lab",
      period: "Dec 2019 – Dec 2022",
      bullets: [
        "Classified hornbill vocalisations and identified individuals from acoustic features.",
        "Built a Zooniverse citizen-science workflow to test crowd-sourced identification.",
      ],
    },
    {
      role: "Part-time Tutor",
      org: "WAO Singapore",
      period: "Sep 2019 – Apr 2023",
      bullets: [],
    },
  ],
  education: [
    {
      school: "Yale-NUS College",
      degree: "BSc (Hons) Environmental Studies, First Class Honours",
      period: "2019 – 2023",
      note: "Minor in Mathematical, Computational & Statistical Science",
    },
    {
      school: "United World College Costa Rica",
      degree: "International Baccalaureate Diploma",
      period: "2017 – 2019",
    },
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "IPA Database Specialist",
    "IPA Applied Information Technology Engineer",
    "IPA Fundamental Information Technology Engineer",
  ],
  skills: [
    { label: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "Rust", "R"] },
    { label: "Frameworks", items: ["React", "Next.js", "Vue", "Hono", "Django"] },
    { label: "Cloud", items: ["AWS", "Cloudflare Workers / Pages", "Vercel", "Supabase"] },
    { label: "Data", items: ["PostgreSQL", "SQLite", "SQL modelling"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)"] },
  ],
}
```

- [ ] **Step 5: テストが通ることを確認する**

Run: `pnpm vitest run src/data/cv.test.ts src/lib/contact.test.ts`
Expected: PASS（全件）

- [ ] **Step 6: `src/components/Contact.astro` を作る**

```astro
---
import { cv } from '../data/cv';
---

<form class="contact" id="contact-form" data-email={cv.email} hidden>
  <label>Name<input name="name" required autocomplete="name" /></label>
  <label>Email<input name="email" type="email" required autocomplete="email" /></label>
  <label>Message<textarea name="message" rows="5" required></textarea></label>
  <button type="submit">Send</button>
</form>
<p class="status" id="contact-status" role="status" aria-live="polite"></p>
<noscript>
  <p>Email me at <a href={`mailto:${cv.email}`}>{cv.email}</a>.</p>
</noscript>

<script>
  import { sendContact } from '../lib/contact';

  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const status = document.getElementById('contact-status');

  if (form && status) {
    const email = form.dataset.email ?? '';
    const button = form.querySelector('button') as HTMLButtonElement;
    form.hidden = false;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      button.textContent = 'Sending…';
      status.textContent = '';

      const data = new FormData(form);
      const ok = await sendContact({
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        message: String(data.get('message') ?? ''),
      });

      if (ok) {
        form.remove();
        status.textContent = "Thanks — I'll get back to you soon.";
        return;
      }

      button.disabled = false;
      button.textContent = 'Send';
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      status.replaceChildren('Something went wrong. Please email me directly at ', link, '.');
    });
  }
</script>
```

- [ ] **Step 7: `src/pages/index.astro` を書き換える**

```astro
---
import Layout from '../layouts/Layout.astro';
import Section from '../components/Section.astro';
import Row from '../components/Row.astro';
import Contact from '../components/Contact.astro';
import { cv } from '../data/cv';
import { getAllBlogPosts, getFeaturedProjects, formatYearMonth } from '../lib/content';

const projects = getFeaturedProjects();
const posts = getAllBlogPosts().slice(0, 3);
---

<Layout>
  <header>
    <h1>{cv.name} <span class="muted" style="font-weight:400">({cv.handle})</span></h1>
    <p class="muted">{cv.headline}</p>
    <p class="links">
      {cv.links.map((link, i) => (
        <>{i > 0 && ' · '}<a href={link.href}>{link.label}</a></>
      ))}
    </p>
    <p class="summary">{cv.summary}</p>
  </header>

  <Section title="Experience">
    {cv.experience.map((job) => (
      <>
        <Row meta={job.period}>{job.role} — {job.org}</Row>
        {job.bullets.length > 0 && (
          <ul class="bullets">
            {job.bullets.map((bullet) => <li>{bullet}</li>)}
          </ul>
        )}
      </>
    ))}
  </Section>

  <Section title="Projects">
    {projects.map((project) => (
      <Row meta={project.frontmatter.tags.slice(0, 2).join(' · ')}>
        <a href={`/projects/${project.slug}`}>{project.frontmatter.title}</a>
      </Row>
    ))}
    <p class="more"><a href="/projects">All projects →</a></p>
  </Section>

  <Section title="Writing">
    {posts.map((post) => (
      <Row meta={formatYearMonth(post.date)}>
        <a href={`/blog/${post.slug}`}>{post.frontmatter.title}</a>
      </Row>
    ))}
    <p class="more"><a href="/blog">All writing →</a> · <a href="/rss.xml">RSS</a></p>
  </Section>

  <Section title="Education">
    {cv.education.map((edu) => (
      <>
        <Row meta={edu.period}>{edu.school} — {edu.degree}</Row>
        {edu.note && <p class="muted">{edu.note}</p>}
      </>
    ))}
  </Section>

  <Section title="Certifications">
    <p>{cv.certifications.join(' · ')}</p>
  </Section>

  <Section title="Skills">
    {cv.skills.map((group) => (
      <p style="margin:0"><span class="muted">{group.label}</span> {group.items.join(', ')}</p>
    ))}
  </Section>

  <Section title="Contact">
    <Contact />
  </Section>
</Layout>
```

- [ ] **Step 8: ビルドして出力を確認する**

Run: `pnpm build && grep -c 'class="row"' dist/index.html && grep -E 'Tampines|Employment Pass|PR pending|4\.52' dist/index.html || echo "no secrets"`
Expected: ビルド成功。`row` が `14` 以上（職歴5＋作品4＋記事3＋学歴2）。最後は `no secrets`

- [ ] **Step 9: 全テストを流してコミットする**

Run: `pnpm test`
Expected: PASS

```bash
git add src/data src/lib/contact.ts src/lib/contact.test.ts src/components/Contact.astro src/pages/index.astro
git commit -m "feat: add CV-style home page with contact form

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: プライバシーポリシー・利用規約ページ

**Files:**
- Create: `src/pages/privacy.astro`, `src/pages/terms.astro`

**Interfaces:**
- Consumes: `Layout`（Task 2）
- Produces: `/privacy`, `/terms`

- [ ] **Step 1: 旧ページの本文を取り出す**

Run: `git show 1035087:src/pages/privacy.astro` と `git show 1035087:src/pages/terms.astro`

それぞれの `<div class="prose ...">` の中にある `<h2>` と `<p>`（と `<ul>`）だけが本文。`Last updated: {new Date().toLocaleDateString()}` の行は使わない。

- [ ] **Step 2: `src/pages/privacy.astro` を作る**

次の枠を作り、`<article class="prose">` の中に Step 1 の本文をそのまま貼る。貼った本文の中の `SingBirds` はすべて `Shuna Maekawa` に置き換える。

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Privacy Policy — Shuna Maekawa" description="Privacy policy for fairy-pitta.net.">
  <p class="crumb"><a href="/">Shuna Maekawa</a> / Privacy</p>
  <h1>Privacy Policy</h1>
  <p class="meta">Last updated: 2026-09-30</p>
  <article class="prose">
    <!-- Step 1 で取り出した privacy の <h2>/<p> をここに貼る -->
  </article>
</Layout>
```

- [ ] **Step 3: `src/pages/terms.astro` を作る**

同じ枠で `title="Terms of Use — Shuna Maekawa"`、`description="Terms of use for fairy-pitta.net."`、見出し `Terms of Use`、パンくず `/ Terms` にし、Step 1 の terms の本文を貼る（`SingBirds` → `Shuna Maekawa`）。貼り終えたら、枠の中の案内コメント行は削除する。

- [ ] **Step 4: 確認する**

Run: `pnpm build && grep -c SingBirds dist/privacy/index.html dist/terms/index.html; grep -c '<h2' dist/privacy/index.html dist/terms/index.html`
Expected: `SingBirds` はどちらも `0`。`<h2` はどちらも `1` 以上

- [ ] **Step 5: コミットする**

```bash
git add src/pages/privacy.astro src/pages/terms.astro
git commit -m "feat: restore privacy and terms pages in the plain layout

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: 最終確認

**Files:**
- なし（問題があれば該当タスクのファイルを直す）

**Interfaces:**
- Consumes: Task 1〜8 のすべて

- [ ] **Step 1: 作り直しのあとに不要なものが残っていないか確認する**

Run: `grep -rnE "react|tailwind|lucide|emdash|SingBirds|client:" src astro.config.mjs package.json || echo clean`
Expected: `clean`

Run: `ls package-lock.json 2>/dev/null || echo "no npm lockfile"`
Expected: `no npm lockfile`

- [ ] **Step 2: テストとビルドをまとめて流す**

Run: `pnpm install --frozen-lockfile && pnpm test && pnpm build`
Expected: すべて成功

- [ ] **Step 3: 出力されたページを数える**

Run: `find dist -name index.html | sort`
Expected: `dist/index.html`, `dist/blog/index.html`＋記事12件, `dist/projects/index.html`＋作品10件, `dist/privacy/index.html`, `dist/terms/index.html`（計 27）

Run: `ls dist/rss.xml && ls dist/og | wc -l`
Expected: `dist/rss.xml` があり、サムネ画像は `22`

- [ ] **Step 4: 目で見て確認する**

Run: `pnpm dev`（`http://localhost:4321`）

次の4ページを、パソコン幅とスマホ幅（375px）、明るい画面と暗い画面（macOS の外観設定を切り替える）の組み合わせで確認する:

- `/`: 全区画が見本の順に並ぶ。スマホ幅では各行の日付が下に回り込む
- `/blog/cicd-aws-oidc-seven-walls`: コードの背景が暗い画面でも読める。表が横にはみ出さず、横にスクロールできる
- `/projects/Portree`: GIF がはみ出さない。Code リンクがある
- `/blog`: Qiita の記事に「Qiita ↗」が付いている

問い合わせフォームで、ブラウザの開発者ツールの「Network → Offline」にしてから送信し、エラー文とメールアドレスが出て、ボタンが再び押せることを確認する（本当の送信は行わない）

- [ ] **Step 5: 問題があれば直してコミットする**

直した場合のみ:

```bash
git add -A
git commit -m "fix: polish issues found in final review

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: 公開前に本人に伝えること（コードの外）**

- Cloudflare Pages の管理画面で、ビルドコマンドを `pnpm build`、出力先を `dist` にする（`pnpm-lock.yaml` があれば pnpm が自動で使われるが、コマンド欄が `npm run build` のままなら書き換える）
- 環境変数 `NODE_VERSION` を設定している場合は `22` にする
- 退避用ブランチ `wip/emdash-migration` は不要になったら本人が消す
