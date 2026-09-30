# fairy-pitta.net 作り直し 設計書

- 日付: 2026-09-30
- 対象リポジトリ: `fairy-pitta/e-folio`
- ブランチ: `feat/site-redesign`

## 1. 目的と前提

### 目的
海外（主にシンガポール）の採用担当・エンジニアが見て、**フルスタックエンジニアとして面談に進めたくなる**サイトにする。

### ユーザーが決めたこと
- 変える範囲は「全部作り直し」（目的・見た目・技術構成すべて）
- 見せる相手は海外の採用担当。サイトは英語
- 売り込む職種はフルスタックエンジニア
- 見た目は「履歴書そのもの」。キャッチコピー・色の演出・趣味（鳥）の打ち出しはしない。自己主張を抑え、事実の一覧で見せる
- 記事・作品の詳細ページは残し、全ページを同じ素っ気ない見た目に揃える
- 残す機能: 共有時のサムネ画像、RSS、問い合わせフォーム、暗い画面対応
- 名前は「Shuna Maekawa (fairy-pitta)」と本名＋ハンドルを併記
- 技術構成は案1「同じリポジトリの中で Astro の静的サイトとして作り直す」。EmDash への移行は破棄
- 文言は後から本人が直す。今回は構造と見た目が正しければよい

### こちらで置いた前提（違えば直す）
- 経歴の情報源は `~/Projects/pitta/career-ops/cv.md`（2026-04-11 更新）
- 公開しない情報: 自宅住所、在留資格（EP・永住権申請中）、取引先案件の具体的な数字（利用者数・チーム人数）、GPA の数値
- 学歴は「First Class Honours」までは書く
- メルマガ登録欄は削除
- 記事は元の言語のまま（日本語の記事は日本語のまま載せる）

## 2. 技術構成

- Astro の完全な静的出力（`output: "static"`）。アダプター・サーバー処理・データベースは使わない
- 公開先はこれまでどおり Cloudflare Pages（`wrangler.toml` の `pages_build_output_dir = "dist"` を維持）
- 削除する依存: React 関連（`@astrojs/react`, `react`, `react-dom`, `@types/react*`）、Tailwind 関連（`tailwindcss`, `@tailwindcss/*`, `tailwindcss-animate`, `autoprefixer`, `postcss` 設定）、`@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns`（不要なら）, `resend`, EmDash 関連（`emdash`, `@emdash-cms/*`, `better-sqlite3`, `@astrojs/node`, `@astrojs/cloudflare`, `@portabletext/react`）
- 残す依存: `astro`, `@astrojs/check`, `@astrojs/rss`, `gray-matter`, `unified` / `remark-*` / `rehype-*`（Markdown 変換）, `satori`, `sharp`（サムネ画像）, `typescript`, `vitest`, `tsx`
- パッケージ管理は npm に一本化（`pnpm-lock.yaml`, `pnpm-workspace.yaml` は削除）。`.nvmrc` は残す
- 見た目は `src/styles/site.css` の1ファイル（目安 100〜200 行）。書体は端末標準（`-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", sans-serif`）。外部フォントは読み込まない
- 暗い画面対応は `prefers-color-scheme: dark` による自動切り替えのみ（切り替えボタンは作らない）
- 色は CSS 変数で定義: 文字色・薄い文字色・線の色・背景色の4つ程度。強調色は使わない

## 3. ページ構成と URL

URL は現行と同じにする（外部からのリンクや検索結果を切らないため）。

| URL | 内容 | データ |
|---|---|---|
| `/` | 職務経歴書ページ | `src/data/cv.ts` ＋ 記事・作品の Markdown |
| `/blog` | 記事一覧（自分の記事＋Qiita 記事） | `content/blog/*.md` ＋ Qiita |
| `/blog/[slug]` | 記事本文 | `content/blog/*.md` |
| `/projects` | 作品一覧 | `content/projects/*.md` |
| `/projects/[slug]` | 作品詳細 | `content/projects/*.md` |
| `/rss.xml` | RSS | 自分の記事のみ |
| `/og/[slug].png` | 共有用サムネ画像 | 記事・作品のタイトル |
| `/privacy`, `/terms` | 既存の文面を新しい見た目で表示 | 既存 |

### `/`（トップ）の並び順
1. 名前「Shuna Maekawa (fairy-pitta)」、「Software Engineer · Singapore」
2. リンク: Email · LinkedIn · GitHub · CV (PDF)
3. 紹介文 2 行程度（事実のみ）
4. Experience（新しい順。WAO Singapore と Yale-NUS 研究室は箇条書きつき、それ以外は 1 行）
5. Projects（`featured: true` の作品を最大 4 件、「All projects →」）
6. Writing（新しい順に 3 件、「All writing →」「RSS」）
7. Education
8. Certifications
9. Skills（分類名＋一覧）
10. Contact（問い合わせフォーム）

見出しは小さな大文字の薄い文字。各行は「左に内容、右に日付や技術名」を基本形にする。

### 記事・作品ページ
- 上部に「Shuna Maekawa / Writing」（作品は「/ Projects」）の戻り道
- タイトル、日付・読む時間・タグ（作品は技術タグと GitHub・公開先リンク）
- 本文（Markdown を HTML に変換。コードは等幅・薄い灰色の背景。色付けは既存の `rehype-highlight` を使い、配色は白黒に近いものにする）
- 作品の画像・GIF（`coverImage`, `gallery`）は本文の前後に表示
- 下部に「← All writing」

### 一覧ページ
- 1 行 1 件、「左にタイトル、右に日付」の表。画像のカードは使わない
- Qiita 記事は同じ一覧に日付順で混ぜ、タイトルの後ろに「Qiita ↗」と薄く表示して外部リンクにする

### 共有用サムネ画像
- 白地に黒文字でタイトル、下に「Shuna Maekawa · fairy-pitta.net」。装飾なし
- 既存の `src/lib/og-image.ts` を新しい見た目に書き換える

## 4. データ

### `src/data/cv.ts`
職務経歴書の中身を型付きで 1 か所にまとめる。

```ts
export interface CvLink { label: string; href: string }
export interface CvExperience {
  role: string
  org: string
  period: string        // 表示用文字列 例 "Dec 2023 – Present"
  bullets: string[]     // 空なら 1 行表示
}
export interface CvEducation { school: string; degree: string; period: string; note?: string }
export interface CvSkillGroup { label: string; items: string[] }

export const cv: {
  name: string
  handle: string
  headline: string      // "Software Engineer · Singapore"
  links: CvLink[]
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  certifications: string[]
  skills: CvSkillGroup[]
}
```

- CV の PDF は `public/cv/shuna-maekawa-cv.pdf` に置く（内容から住所・在留資格を除いたものを本人が用意する。用意されるまでは「CV (PDF)」リンクを表示しない＝`links` に入れない）

### 記事・作品の Markdown
- 既存の frontmatter（`title`, `date`, `excerpt`, `coverImage`, `readTime`, `tags` / `description`, `liveUrl`, `githubUrl`, `gallery`）はそのまま使う
- 作品に任意項目 `featured?: boolean` と `order?: number` を追加し、トップに出す 4 件を選ぶ。初期値は Portree, PR Viewer, Printable Spectrogram, Code Annotator
- `src/lib/content.ts` は EmDash 移行前（`HEAD` の版）の Markdown 読み込みを土台に戻し、`featured` を扱えるようにする
- 日付は `"April 5, 2026"` や `"6 Feb, 2026"` など書式が混在しているため、`content.ts` で `Date` に変換して並べ替え、表示は `YYYY-MM` / `YYYY-MM-DD` に統一する。変換できない日付はビルドを失敗させる

### Qiita 記事
- `src/lib/qiita.ts` をビルド時取得に変更（ユーザー `Pitta` の記事一覧 API）
- 取得に失敗した場合は警告を出して空配列を返し、ビルドは続ける

## 5. 動く部分

JavaScript はフォーム送信だけ。React は使わない。

### 問い合わせフォーム
- 項目: Name, Email, Message（すべて必須、ブラウザ標準の入力チェック）
- 送信先: 既存の `https://resend-worker.shuna120700.workers.dev/api/contact`（送る内容の形は現行 `contact.tsx` と同じにする）
- 送信中はボタンを無効化し「Sending…」
- 成功: フォームを消して「Thanks — I'll get back to you soon.」
- 失敗（通信エラー・200 番台以外）: 「Something went wrong. Please email me directly at …」とメールアドレスを表示
- JavaScript が無効な環境では、フォームの代わりにメールアドレスのリンクが見える（`<noscript>`）

### 削除するもの
- メルマガ登録、上に戻るボタン、スクロール時のアニメーション、ナビゲーションバー、ヒーロー画像、波形アニメーション、`use-mobile` など React 用の部品すべて

## 6. 片付け（EmDash 移行作業の破棄）

1. 未コミットの EmDash 作業を `wip/emdash-migration` ブランチにコミットして退避する（データベースファイル `data.db*` と `uploads/` は除外）
2. `feat/site-redesign` では以下を削除または元に戻す: `seed/`, `scripts/`, `emdash-env.d.ts`, `src/live.config.ts`, `wrangler.jsonc`, `src/components/portable-text-renderer.tsx`, `data.db*`, `uploads/`, `dist/`
3. `.gitignore` に `.superpowers/`, `data.db*`, `uploads/` を追加

## 7. テストと確認

- `src/lib/content.test.ts`: 新しい `content.ts` に合わせて直す。日付の変換（混在した書式）、並べ替え、`featured` の抽出、変換できない日付でエラーになることを確認
- `src/data/cv.test.ts`（新規）: 必須項目が空でないこと、住所・在留資格に当たる文字列（`Tampines`, `520297`, `Employment Pass`, `(EP`, `PR pending`）が含まれていないこと
- `src/lib/qiita.test.ts`（新規）: 取得失敗時に空配列を返すこと（`fetch` を差し替えて確認）
- `src/lib/utils.test.ts`: `cn()` など不要になった関数のテストは関数と一緒に削除
- 最終確認: `npm test` と `npm run build`（`astro check && astro build`）が通ること。`dist/` に全記事・全作品・RSS・サムネ画像が出力されていること
- 見た目の確認: 開発サーバーでトップ・記事・作品・一覧を、明るい画面／暗い画面、スマホ幅（375px）／パソコン幅で目視確認する

## 8. 今回やらないこと

- 文言の推敲（本人が後で直す）
- CV の PDF の作成
- 日本語版ページ
- 見た目の比較テスト（スクリーンショット比較）の導入
- 問い合わせ用サーバー（`resend-worker`）側の変更
