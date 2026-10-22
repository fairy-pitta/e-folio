# fairy-pitta.net 転職用作り直し Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** トップページを「強み → Summary → Case studies → Experience → Side projects → Education/Certifications/Skills → Contact」の1ページ CV に作り直し、勤め先名・電話・メール・OCR-VFS がビルド成果物のどこにも出ないことをビルド時に機械的に保証する。

**Architecture:** 新しい文言はすべて型付きデータ（`src/data/cv.ts` と `content/projects/*.md` の frontmatter）に置き、描画は既存の `<details class="job">` アコーディオンを使う小さな Astro コンポーネント2つ（`CaseStudy.astro` / `SideProject.astro`）に任せる。公開してはいけない文字列は `src/lib/public-safety.ts` の1か所で定義し、(1) vitest でソースデータを、(2) `astro build` 直後に走る別設定の vitest（`tests/dist/`）で `dist/` の全テキストファイルを検査する。`pnpm build` がこの検査を含むので、CI でも Cloudflare Pages のビルドでも漏れがあれば落ちる。

**Tech Stack:** Astro 5（静的出力）、TypeScript、vitest 4、gray-matter、Cloudflare Pages（git 連携、Pages Function `/api/contact`）、pnpm 10、Node 22（`.nvmrc`）。

**設計書:** `docs/superpowers/specs/2026-10-22-portfolio-for-job-hunt-design.md`
**ブランチ:** `feature/portfolio-for-job-hunt`（チェックアウト済み。このブランチのまま作業する）

---

## 前提知識（ゼロから入る実装者向け）

### コマンド（`package.json` で確認済み）

| 目的 | コマンド | 備考 |
|---|---|---|
| 単体テスト | `pnpm test` | `vitest run`。対象は `src/**/*.test.ts` のみ（`vitest.config.ts`） |
| 型検査 | `pnpm astro check` | |
| Lint | `pnpm lint` | `eslint .` |
| ビルド | `pnpm build` | 現状 `astro check && astro build`。Task 6 で `dist/` 検査を末尾に足す |
| 公開物検査 | `pnpm test:dist` | Task 2 で新設。`dist/` が必要 |
| プレビュー | `pnpm preview` | http://localhost:4321 |

作業開始時点のベースライン（2026-10-22 計測）: `pnpm test` = 11 files / 119 tests pass、`pnpm build` 約6秒、`pnpm lint` エラーなし。

### 既存コードの要点

- `src/data/cv.ts` … CV データ（型 `Cv` と定数 `cv`）。トップページのほぼ全部の文言の源。冒頭コメントの「住所・ビザ・顧客の数字・GPA を入れない」ルールを守る。
- `src/data/cv.test.ts` … 既存テスト。`does_not_publish_%s` で顧客名などの禁止語を検査している（これは残す）。
- `src/pages/index.astro` … トップページ。Experience は `<details class="job" open={i === 0}>` + `<summary class="row">` + `<ul class="bullets">` という形。**新しいアコーディオンはすべてこの class 構成を流用する**（CSS は `src/styles/site.css` の `.job` 系ルールがそのまま効く）。
- `src/components/Contact.astro` … フォーム。現在 `data-email={cv.email}`、`<noscript>` の mailto、送信失敗時の mailto リンクでメールを公開している。
- `src/lib/content.ts` … `content/projects/*.md` を gray-matter で読む。`getFeaturedProjects(limit = 4)` は `featured: true` を `order` 順に返す。`projectLinks()` は `Code`（githubUrl）→ `Live`（liveUrl）の順でリンクを返す。
- `src/lib/site-map.ts` … sitemap.xml と llms.txt が共有するページ一覧。`/blog/` はページとして残すのでここからは消さない。
- `src/pages/llms.txt.ts` / `src/pages/sitemap.xml.ts` / `src/pages/rss.xml.ts` / `src/pages/og/[slug].png.ts` … いずれも `getAllProjects()` から作るので、`content/projects/OcrVfs.md` を消せば OCR-VFS は全部から消える。
- **JSON-LD は存在しない**（`grep -r "ld+json" src` で0件）。対応不要。
- **ナビゲーション専用のコンポーネントは無い。** `/blog` への導線は (1) トップの Writing セクションの「All writing →」、(2) `src/pages/404.astro` の「Writing」リンク、の2か所だけ。フッターの RSS リンクは `hasFeed`（公開記事が1件以上）のときだけ出るが、現在ブログ記事は全部 `draft: true` なので出ていない。
- 電話番号は現状リポジトリのどこにも無い（CV の PDF / `career-ops/cv.md` にだけある）。検査は「今後入れてしまう」ことへの備え。

### 文体ルール（英語の文言すべて）

- 短縮形を使わない（`I'll` → `I will`、`isn't` → `is not`）。所有格の `'s` は可。
- 気取った言い回しを使わない: "the part I enjoy most", "passionate", "leverage", "seamless" など。
- 英国綴り（organise, modelling, licence, centre）。
- 数字は「率いた人数・現場の結果（請求件数・削減時間・誤り率）・使われている事実」だけ。テスト件数・コミット数・テーブル数・コードの割合は書かない。
- 顧客名を書かない。

### テスト名の規約

新しく書くテストはすべて `test_<action>_<condition>_<expected_result>` 形式にする（既存の古い名前は触らない）。

### コミット規約

`type: 説明`（日本語、50字以内）。type は feat / fix / refactor / test / docs / chore / style / perf。各コミットの本文末尾に必ず次の2行を付ける:

```
Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MbyfcUVfVkasoDAmhPxkC7
```

コミットコマンドは以下の形で書く（本計画中の `git commit -m "..."` はすべてこの2行付きで実行すること）:

```bash
git commit -m "feat: 例" -m "Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MbyfcUVfVkasoDAmhPxkC7"
```

---

## ファイル構成

| ファイル | 種別 | 責務 |
|---|---|---|
| `src/lib/public-safety.ts` | 新規 | 公開禁止文字列の一覧と `findForbidden(text)` |
| `src/lib/public-safety.test.ts` | 新規 | 上の単体テスト |
| `vitest.dist.config.ts` | 新規 | `tests/dist/` だけを走らせる vitest 設定 |
| `tests/dist/published-output.test.ts` | 新規 | `dist/` の全テキスト検査＋トップページの構造検査 |
| `src/components/CaseStudy.astro` | 新規 | 事例1件のアコーディオン |
| `src/components/SideProject.astro` | 新規 | 個人開発1件のアコーディオン |
| `src/data/cv.ts` | 変更 | email 削除、勤め先名を伏せる、strengths / availability / caseStudies 追加、Skills 等を CV に合わせる |
| `src/data/cv.test.ts` | 変更 | 上記のテスト |
| `src/components/Contact.astro` | 変更 | メール→LinkedIn、「CV available on request.」 |
| `src/pages/index.astro` | 変更 | セクション構成の組み替え、Writing 削除 |
| `src/pages/404.astro` | 変更 | Writing リンク削除 |
| `src/lib/content.ts` / `content.test.ts` | 変更 | frontmatter に `name` / `technicalPoint` / `articleUrl` / `articleLabel`、featured 5件、記事リンク |
| `src/lib/site-map.ts` | 変更 | HOME の説明文 |
| `src/styles/site.css` | 変更 | strengths / case の小さな追加 |
| `content/projects/*.md` | 変更・削除 | OcrVfs.md 削除、5件の frontmatter、SBBirdMap の typo と GitHub リンク、CCAccountSwitcher のテスト件数 |
| `package.json` | 変更 | `test:dist` 追加、`build` に検査を連結 |
| `wrangler.toml` | 変更 | `name` を実在の Pages プロジェクト名 `e-folio` に |

---

## 計画時点で確認した事実（実装者は再確認不要。Task 15 で再確認する）

### リンク確認（2026-10-22, `curl -s -o /dev/null -L -w '%{http_code}' -A 'Mozilla/5.0' <URL>`）

| URL | 結果 | 使う？ |
|---|---|---|
| https://sgbirdsmap.fairy-pitta.net | 200 | ○（SG Bird Observation Map のデモ） |
| https://github.com/fairy-pitta/SGBirdMap | **404**（非公開） | ×（付けない。現在 frontmatter にあるので消す） |
| https://github.com/fairy-pitta/portree | 200 | ○ |
| https://qiita.com/Pitta/items/4a6537a3450aa6f8f050 | 200 | ○（「git worktree の並行開発で困るポート管理を自動化する CLI を作りました」2026-02-23） |
| https://spectrogram.fairy-pitta.net/ | 200 | ○ |
| https://github.com/fairy-pitta/printable_spectrogram | 200 | ○ |
| https://github.com/fairy-pitta/code-annotator | 200 | ○（デモ URL は空なので GitHub のみ） |
| https://github.com/fairy-pitta/cc-account-switcher | 200 | ○ |
| https://www.npmjs.com/package/@fairy-pitta/cc-account-switcher | 403（npm のボット対策）。`https://registry.npmjs.org/@fairy-pitta%2fcc-account-switcher` は 200 | ○（パッケージは実在） |
| https://www.linkedin.com/in/shunamaekawa | 999（LinkedIn のボット対策。ブラウザでは開く） | ○ |
| https://github.com/fairy-pitta | 200 | ○ |

### wrangler.toml の判断

`wrangler pages project list` の結果、本番は **git 連携の Pages プロジェクト `e-folio`**（ドメイン e-folio.pages.dev / fairy-pitta.net、Git Provider: Yes）。`singbirds-portfolio` というプロジェクトは存在しない。デプロイは GitHub への push で Cloudflare がビルドする方式で、`wrangler pages deploy` は使っていない（`.github/workflows/ci.yml` にデプロイ手順は無い）。今の `name = "singbirds-portfolio"` のまま git ビルドが成功しているので、git ビルドは name を見ていない。一方、手で `wrangler pages deploy` を打つと別プロジェクト `singbirds-portfolio` が新しく作られてしまう。→ **`e-folio` に直すのが正しく、危険は小さい。** ただし念のため単独コミットにし、push 後のブランチのプレビュービルド（`feature/portfolio-for-job-hunt` の Preview デプロイ）が成功することを Task 15 で確かめる。失敗したらそのコミットだけ `git revert` する。

---

## Task 1: 公開禁止文字列の検出関数を追加

**Files:**
- Create: `src/lib/public-safety.ts`
- Test: `src/lib/public-safety.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/public-safety.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { findForbidden } from './public-safety'

describe('findForbidden', () => {
  it('test_find_forbidden_in_clean_text_returns_empty', () => {
    expect(findForbidden('Software engineer and project manager in Singapore.')).toEqual([])
  })

  it.each([
    ['WAO Singapore', 'employer name (WAO)'],
    ['part of wao tech', 'employer name (WAO)'],
    ['+65 8851', 'phone number'],
    ['shuna120700@gmail.com', 'email address'],
    ['<a href="mailto:someone@example.com">', 'mailto link'],
    ['OCR-VFS — Visual Fidelity Scorer', 'removed project (OCR-VFS)'],
    ['/projects/OcrVfs/', 'removed project (OCR-VFS)'],
    ['https://github.com/fairy-pitta/ocr-vfs', 'removed project (OCR-VFS)'],
    ['Haseko', 'client name (Haseko)'],
  ])('test_find_forbidden_in_%s_returns_its_label', (text, label) => {
    expect(findForbidden(text)).toContain(label)
  })

  it('test_find_forbidden_called_twice_on_same_text_returns_same_labels', () => {
    // Guards against a /g flag sneaking in: RegExp.test with /g keeps state between calls.
    const text = 'WAO and OCR-VFS'
    expect(findForbidden(text)).toEqual(findForbidden(text))
  })
})
```

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/lib/public-safety.test.ts`
Expected: FAIL（`Failed to resolve import "./public-safety"`）

- [ ] **Step 3: 実装**

`src/lib/public-safety.ts`:

```ts
// Strings that must never reach the published site: the employer's name and
// the phone number and email address that appear on the PDF CV, client names,
// and the OCR-VFS project that was withdrawn. The source data is checked in
// vitest, and the built dist/ is checked after every build by
// tests/dist/published-output.test.ts, which `pnpm build` runs.
//
// No /g flag on any pattern: RegExp.test with /g keeps state between calls.

export interface ForbiddenPattern {
  label: string
  pattern: RegExp
}

export const FORBIDDEN: ForbiddenPattern[] = [
  { label: "employer name (WAO)", pattern: /wao/i },
  { label: "phone number", pattern: /8851/ },
  { label: "email address", pattern: /shuna120700/i },
  { label: "mailto link", pattern: /mailto:/i },
  { label: "removed project (OCR-VFS)", pattern: /ocr-?vfs/i },
  { label: "client name (Haseko)", pattern: /haseko/i },
  { label: "client name (Hasegawa)", pattern: /hasegawa/i },
  { label: "client name (Forval)", pattern: /forval/i },
  { label: "client name (Crossgear)", pattern: /crossgear/i },
]

export function findForbidden(text: string): string[] {
  return FORBIDDEN.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label)
}
```

- [ ] **Step 4: 通ることを確認**

Run: `pnpm test src/lib/public-safety.test.ts`
Expected: PASS（11 tests）

- [ ] **Step 5: コミット**

```bash
git add src/lib/public-safety.ts src/lib/public-safety.test.ts
git commit -m "feat: 公開禁止文字列を検出する関数を追加"   # 本文に署名2行
```

---

## Task 2: 公開ビルド（dist/）の検査テストを追加（この時点では意図的に赤）

**Files:**
- Create: `vitest.dist.config.ts`
- Create: `tests/dist/published-output.test.ts`
- Modify: `package.json`（scripts に `test:dist`）

ここで書くテストは今のサイトの漏れ（WAO・メール・OCR-VFS）を実際に検出して**赤になる**。Task 3〜5 で緑にし、Task 6 で `pnpm build` に組み込む。`pnpm test` と CI はまだこのテストを走らせないので、赤のままコミットしてよい。

- [ ] **Step 1: vitest 設定を作る**

`vitest.dist.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

// Checks the built site in dist/, so it needs `astro build` first.
// `pnpm build` runs it after every build; `pnpm test` does not.
export default defineConfig({
  test: {
    include: ['tests/dist/**/*.test.ts'],
  },
})
```

- [ ] **Step 2: package.json に script を足す**

`package.json` の `"test:watch": "vitest",` の次の行に追加:

```json
    "test:dist": "vitest run --config vitest.dist.config.ts",
```

- [ ] **Step 3: テストを書く**

`tests/dist/published-output.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { findForbidden } from '../../src/lib/public-safety'

const DIST = resolve(__dirname, '../../dist')

// Everything a reader, crawler or agent can read as text. Images and video are
// left out: the only generated images are the OG cards, drawn from page titles
// that the HTML carries too.
const TEXT_EXTENSIONS = new Set(['.html', '.txt', '.xml', '.js', '.css', '.json', '.svg'])

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

describe('built site', () => {
  it('test_read_dist_after_build_contains_home_page', () => {
    expect(existsSync(join(DIST, 'index.html')), 'run `pnpm build` first').toBe(true)
  })

  it('test_scan_text_files_in_dist_returns_no_forbidden_strings', () => {
    const leaks = walk(DIST)
      .filter((file) => TEXT_EXTENSIONS.has(extname(file)))
      .flatMap((file) =>
        findForbidden(readFileSync(file, 'utf8')).map((label) => `${relative(DIST, file)}: ${label}`),
      )
    expect(leaks).toEqual([])
  })

  it('test_list_project_routes_in_dist_excludes_ocr_vfs', () => {
    expect(existsSync(join(DIST, 'projects', 'OcrVfs'))).toBe(false)
    expect(existsSync(join(DIST, 'og', 'project-OcrVfs.png'))).toBe(false)
  })

  it('test_render_project_pages_never_link_the_private_bird_map_repo', () => {
    const html = walk(DIST).filter((file) => extname(file) === '.html')
    for (const file of html) {
      expect(readFileSync(file, 'utf8'), relative(DIST, file)).not.toContain('github.com/fairy-pitta/SGBirdMap')
    }
  })

  // Page-structure checks are added by later tasks below this line.
})
```

（ページ単位の検査で使う `page()` ヘルパーは、最初に使う Task 4 で足す。未使用の関数を置くと lint が落ちるため。）

- [ ] **Step 4: 赤を確認**

Run: `pnpm build && pnpm test:dist`
Expected: FAIL。`test_scan_text_files_in_dist_returns_no_forbidden_strings` の差分に少なくとも次が並ぶ:
- `index.html: employer name (WAO)` / `index.html: email address` / `index.html: mailto link` / `index.html: removed project (OCR-VFS)`
- `projects/index.html: removed project (OCR-VFS)` / `llms.txt: removed project (OCR-VFS)` / `sitemap.xml: removed project (OCR-VFS)`
- `test_list_project_routes_in_dist_excludes_ocr_vfs` と `test_render_project_pages_never_link_the_private_bird_map_repo`（`projects/SBBirdMap/index.html`）も FAIL

- [ ] **Step 5: lint を確認**

Run: `pnpm lint`
Expected: エラーなし

- [ ] **Step 6: コミット**

```bash
git add vitest.dist.config.ts tests/dist/published-output.test.ts package.json
git commit -m "test: 公開ビルドの禁止文字列を検査するテストを追加"   # 本文に署名2行
```

---

## Task 3: OCR-VFS をサイトから削除

**Files:**
- Delete: `content/projects/OcrVfs.md`（メディアは無い。`public/projects/` と `assets/media/projects/` に ocr 系ディレクトリは存在しない）
- Modify: `src/lib/content.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/content.test.ts` の import に `findForbidden` を足す:

```ts
import { findForbidden } from './public-safety'
```

ファイル末尾に追加:

```ts
describe('project content', () => {
  it('test_read_projects_excludes_withdrawn_ocr_vfs', () => {
    expect(getAllProjects().map((project) => project.slug)).not.toContain('OcrVfs')
  })

  it('test_read_project_files_contains_no_forbidden_strings', () => {
    for (const project of getAllProjects()) {
      const text = JSON.stringify(project.frontmatter) + project.content
      expect(findForbidden(text), project.slug).toEqual([])
    }
  })
})
```

既存の `returns_the_four_featured_projects_in_order` を次に置き換える（OCR-VFS が抜けて3件になる。Task 10 で5件にする）:

```ts
  it('test_read_featured_projects_after_ocr_vfs_removal_returns_remaining_three', () => {
    expect(getFeaturedProjects().map((p) => p.slug)).toEqual([
      'Portree',
      'CCAccountSwitcher',
      'PrintableSpectrogram',
    ])
  })
```

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/lib/content.test.ts`
Expected: FAIL — `test_read_projects_excludes_withdrawn_ocr_vfs`、`test_read_project_files_contains_no_forbidden_strings`（OcrVfs: removed project）、featured の件数

- [ ] **Step 3: 削除**

```bash
git rm content/projects/OcrVfs.md
grep -rniE "ocr-?vfs" src content public functions   # 何も出ないこと（content.test.ts の 'OcrVfs' 文字列リテラルだけは残ってよい）
```

- [ ] **Step 4: 通ることを確認**

Run: `pnpm test`
Expected: PASS（全件）

Run: `pnpm build && pnpm test:dist`
Expected: まだ FAIL だが、OCR-VFS 関係の行と `test_list_project_routes_in_dist_excludes_ocr_vfs` は消えている。残るのは WAO・email・mailto と SGBirdMap リンク。

- [ ] **Step 5: コミット**

```bash
git add -A content/projects/OcrVfs.md src/lib/content.test.ts
git commit -m "chore: OCR-VFSのプロジェクトをサイトから削除"   # 本文に署名2行
```

---

## Task 4: メールアドレスを外し、連絡先を LinkedIn とフォームにする

**Files:**
- Modify: `src/data/cv.ts`（`email` 削除、`links`、`linkHref` 追加、冒頭コメント）
- Modify: `src/data/cv.test.ts`
- Modify: `src/components/Contact.astro`
- Modify: `src/styles/site.css`
- Modify: `tests/dist/published-output.test.ts`

- [ ] **Step 1: 失敗するテストを書く（cv）**

`src/data/cv.test.ts`:

1. import を `import { cv, linkHref } from './cv'` に変える。
2. `has_required_top_level_fields` の中の `expect(cv.email).toMatch(...)` の行を削除する。
3. `links_use_https_or_mailto` を次の2つに置き換える:

```ts
  it('test_read_header_links_returns_linkedin_and_github_over_https', () => {
    expect(cv.links.map((link) => link.label)).toEqual(['LinkedIn', 'GitHub'])
    for (const link of cv.links) {
      expect(link.href, link.label).toMatch(/^https:\/\//)
    }
  })

  it('test_serialise_cv_contains_no_email_address_or_mailto', () => {
    expect('email' in cv).toBe(false)
    expect(JSON.stringify(cv)).not.toMatch(/shuna120700|mailto:/i)
  })

  it('test_look_up_link_href_by_label_returns_the_url', () => {
    expect(linkHref('LinkedIn')).toBe('https://www.linkedin.com/in/shunamaekawa')
  })

  it('test_look_up_link_href_with_unknown_label_throws', () => {
    expect(() => linkHref('Fax')).toThrow(/Fax/)
  })
```

- [ ] **Step 2: 失敗するテストを書く（dist）**

`tests/dist/published-output.test.ts` の `walk()` 関数の直後（`describe` の前）にヘルパーを追加:

```ts
function page(path: string): string {
  return readFileSync(join(DIST, path), 'utf8')
}
```

`// Page-structure checks are added by later tasks below this line.` の行の下に追加:

```ts
  it('test_render_contact_section_offers_cv_on_request_and_linkedin_fallback', () => {
    const home = page('index.html')
    expect(home).toContain('CV available on request.')
    expect(home).toContain('data-fallback="https://www.linkedin.com/in/shunamaekawa"')
    expect(home).not.toContain('data-email')
  })
```

- [ ] **Step 3: 失敗を確認**

Run: `pnpm test src/data/cv.test.ts`
Expected: FAIL（`linkHref` が無い、links に Email/Qiita がある、`email` がある）

- [ ] **Step 4: cv.ts を直す**

`src/data/cv.ts`:

- `interface Cv` から `email: string` の行を削除。
- データから `email: "shuna120700@gmail.com",` の行を削除。
- `links` を次にする（Qiita はヘッダーから外す。portree の行から Qiita 記事に飛べる）:

```ts
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shunamaekawa" },
    { label: "GitHub", href: "https://github.com/fairy-pitta" },
  ],
```

- 冒頭コメントを次にする:

```ts
// Source: career-ops/cv.md. Keep address, visa status, client names and figures,
// GPA, the employer's name, the phone number and the email address out of this
// file: the site is public, the PDF CV is not (src/lib/public-safety.ts).
```

- ファイル末尾に追加:

```ts
// Throws at build time rather than rendering a dead link.
export function linkHref(label: string): string {
  const link = cv.links.find((candidate) => candidate.label === label)
  if (!link) throw new Error(`No link labelled ${label} in cv.links`)
  return link.href
}
```

- [ ] **Step 5: Contact.astro を書き換える**

`src/components/Contact.astro` 全体:

```astro
---
import { linkHref } from '../data/cv';

// The site never shows an email address. When the form cannot be used, the
// fallback is LinkedIn.
const linkedin = linkHref('LinkedIn');
---

<p class="contact-note">CV available on request.</p>
<form class="contact" id="contact-form" data-fallback={linkedin} hidden>
  <label>Name<input name="name" required autocomplete="name" /></label>
  <label>Email<input name="email" type="email" required autocomplete="email" /></label>
  <label>Message<textarea name="message" rows="5" required></textarea></label>
  <button type="submit">Send</button>
</form>
<p class="status" id="contact-status" role="status" aria-live="polite"></p>
<noscript>
  <p>Please message me on <a href={linkedin}>LinkedIn</a>.</p>
</noscript>

<script>
  import { sendContact } from '../lib/contact';

  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const status = document.getElementById('contact-status');

  if (form && status) {
    const fallback = form.dataset.fallback ?? '';
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
        status.textContent = 'Thanks — I will get back to you soon.';
        return;
      }

      button.disabled = false;
      button.textContent = 'Send';
      const link = document.createElement('a');
      link.href = fallback;
      link.textContent = 'LinkedIn';
      status.replaceChildren('Something went wrong. Please message me on ', link, '.');
    });
  }
</script>
```

（フォームの「Email」入力欄は訪問者のメールを受け取るもので、こちらのアドレスではないので残す。`functions/api/contact.ts` と `src/lib/contact*.ts` は変更しない。）

- [ ] **Step 6: CSS を足す**

`src/styles/site.css` の `.contact { display: grid; ...` の直前に追加:

```css
.contact-note { margin: 0 0 12px; }
```

- [ ] **Step 7: 通ることを確認**

Run: `pnpm test`
Expected: PASS

Run: `pnpm build && pnpm test:dist`
Expected: `test_render_contact_section_offers_cv_on_request_and_linkedin_fallback` は PASS。禁止文字列の検査はまだ `index.html: employer name (WAO)` で FAIL、SGBirdMap リンクの検査も FAIL のまま。

- [ ] **Step 8: コミット**

```bash
git add src/data/cv.ts src/data/cv.test.ts src/components/Contact.astro src/styles/site.css tests/dist/published-output.test.ts
git commit -m "feat: メールを非公開にし連絡先をLinkedInとフォームに"   # 本文に署名2行
```

---

## Task 5: 勤め先名を伏せ、Experience を CV に合わせる

**Files:**
- Modify: `src/data/cv.ts`（`experience[0]`）
- Modify: `src/data/cv.test.ts`

CV（`career-ops/cv.md`）の Experience に合わせて最初の職歴を書き直す。同時に、設計の「数字のルール」に反する `largest contributor over 15 months` と `Around 2,000 automated tests` を外す。3つの案件の詳細は Case studies（Task 8〜9）に任せ、ここでは1行で触れるだけにする（Experience と Case studies で人数や役割が食い違わないように）。

- [ ] **Step 1: 失敗するテストを書く**

`src/data/cv.test.ts` の import に追加:

```ts
import { findForbidden } from '../lib/public-safety'
```

`describe('cv', ...)` の中に追加:

```ts
  it('test_serialise_cv_contains_no_forbidden_strings', () => {
    expect(findForbidden(JSON.stringify(cv))).toEqual([])
  })

  it('test_read_current_job_org_returns_anonymised_employer', () => {
    expect(cv.experience[0].org).toBe('A software company in Singapore, part of a Japanese group')
  })

  it.each(['automated tests', 'largest contributor', 'commits', 'lines of code'])(
    'test_serialise_cv_without_volume_metric_%s_returns_no_match',
    (metric) => {
      expect(JSON.stringify(cv).toLowerCase()).not.toContain(metric)
    },
  )
```

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/data/cv.test.ts`
Expected: FAIL（employer name (WAO)、org、`automated tests`、`largest contributor`）

- [ ] **Step 3: experience[0] を置き換える**

`src/data/cv.ts` の `experience` 配列の最初の要素を次に置き換える:

```ts
    {
      role: "Software Engineer & Project Manager",
      org: "A software company in Singapore, part of a Japanese group",
      period: "Dec 2023 – Present",
      bullets: [
        "About half of the role is software engineering and project management, and half is one-on-one tuition.",
        "Led teams of up to ten engineers across client and internal projects, from scoping through delivery.",
        "Principal engineer and project manager on a financial management SaaS, architect and reviewer on a document-revision AI platform, and sole engineer and operator of a tuition centre's operations platform. The case studies above cover each one.",
        "Designed the engineering onboarding process, and have run training for incoming intern engineers several times.",
        "Teach mathematics, English, science and computer science one-on-one, from Grade 1 to Grade 12.",
      ],
    },
```

- [ ] **Step 4: 通ることを確認**

Run: `pnpm test`
Expected: PASS

Run: `pnpm build && pnpm test:dist`
Expected: 禁止文字列の検査が PASS。残る FAIL は `test_render_project_pages_never_link_the_private_bird_map_repo` だけ（Task 10 で直す）。

- [ ] **Step 5: コミット**

```bash
git add src/data/cv.ts src/data/cv.test.ts
git commit -m "feat: 勤め先名を伏せExperienceをCVに合わせる"   # 本文に署名2行
```

---

## Task 6: ビルドの最後に公開物の検査を走らせる

**Files:**
- Modify: `package.json`（`build`）
- Modify: `content/projects/SBBirdMap.md`（GitHub リンクを外す。ここで外さないと build が赤のままになるため前倒し）

- [ ] **Step 1: SGBirdMap の非公開リポジトリへのリンクを外す**

`content/projects/SBBirdMap.md` の frontmatter から次の行を削除:

```yaml
githubUrl: "https://github.com/fairy-pitta/SGBirdMap"
```

- [ ] **Step 2: build に検査を連結**

`package.json` の `"build"` を次にする:

```json
    "build": "astro check && astro build && vitest run --config vitest.dist.config.ts",
```

（`pnpm test:dist` を中から呼ばずに直接 vitest を呼ぶのは、Cloudflare Pages のビルド環境で入れ子の pnpm 呼び出しに依存しないため。vitest は devDependency で、Pages は devDependencies もインストールする。CI の `Build` ステップは `pnpm build` なのでワークフローの変更は不要。）

- [ ] **Step 3: 緑を確認**

Run: `pnpm build`
Expected: astro build の後に vitest が走り、`tests/dist/published-output.test.ts` が全件 PASS、終了コード 0。

- [ ] **Step 4: 検査が本当に効くことを確認（確認後に戻す）**

`src/data/cv.ts` の `summary` の先頭に一時的に `WAO ` を足して `pnpm build` → **FAIL**（`index.html: employer name (WAO)` など）で終了コード 1 になることを確認。`git checkout src/data/cv.ts` で戻し、`pnpm build` が再び PASS することを確認。

- [ ] **Step 5: コミット**

```bash
git add package.json content/projects/SBBirdMap.md
git commit -m "chore: ビルド後に公開物の禁止文字列検査を実行"   # 本文に署名2行
```

---

## Task 7: Summary を差し替え、強み（Strengths）を追加

**Files:**
- Modify: `src/data/cv.ts`（型に `strengths` / `availability`、`summary`）
- Modify: `src/data/cv.test.ts`
- Modify: `src/pages/index.astro`（header）
- Modify: `src/styles/site.css`
- Modify: `tests/dist/published-output.test.ts`

- [ ] **Step 1: 失敗するテストを書く（cv）**

`src/data/cv.test.ts` の `describe('cv', ...)` に追加:

```ts
  it('test_read_strengths_returns_three_non_empty_lines', () => {
    expect(cv.strengths).toHaveLength(3)
    cv.strengths.forEach((line) => expect(line.trim()).not.toBe(''))
  })

  it('test_read_availability_returns_month_and_year', () => {
    expect(cv.availability).toBe('Available from April 2027')
  })

  it('test_read_summary_without_employer_opens_with_role_and_place', () => {
    expect(cv.summary.startsWith('Solutions architect and software engineer in Singapore.')).toBe(true)
  })

  it('test_serialise_cv_contains_no_contractions', () => {
    // Possessive 's is fine; contractions are not (house style).
    const contraction = /\b\w+(n['’]t|['’](ll|re|ve|m|d))\b|\b(it|that|there|here|what|who|he|she)['’]s\b/i
    expect(JSON.stringify(cv)).not.toMatch(contraction)
  })

  it.each(['passionate', 'leverage', 'seamless', 'the part I enjoy most', 'cutting-edge'])(
    'test_serialise_cv_without_stock_phrase_%s_returns_no_match',
    (phrase) => {
      expect(JSON.stringify(cv).toLowerCase()).not.toContain(phrase.toLowerCase())
    },
  )
```

- [ ] **Step 2: 失敗するテストを書く（dist）**

`tests/dist/published-output.test.ts` の最後の `it` の後に追加:

```ts
  it('test_render_home_header_orders_strengths_availability_then_summary', () => {
    const home = page('index.html')
    const strengths = home.indexOf('Designs LLM agents and the evaluation that keeps them reliable')
    const availability = home.indexOf('Available from April 2027')
    const summary = home.indexOf('Solutions architect and software engineer in Singapore.')
    expect(strengths).toBeGreaterThan(-1)
    expect(availability).toBeGreaterThan(strengths)
    expect(summary).toBeGreaterThan(availability)
  })
```

- [ ] **Step 3: 失敗を確認**

Run: `pnpm test src/data/cv.test.ts`
Expected: FAIL（`strengths` / `availability` が undefined、summary の先頭が違う）

- [ ] **Step 4: cv.ts を直す**

`interface Cv` の `summary: string` の次に追加:

```ts
  // Three short lines under the name: what to hire for, in the reader's terms.
  strengths: string[]
  availability: string
```

データの `summary` を置き換え、その次に2項目を追加:

```ts
  summary:
    "Solutions architect and software engineer in Singapore. As lead engineer and project manager, I work on data modelling, cloud architecture and LLM agent design, and take systems through to delivery. I also lead and mentor the engineers who build them.",
  strengths: [
    "Designs LLM agents and the evaluation that keeps them reliable",
    "Designs AWS systems from the data model to deployment",
    "Works with clients to turn requirements into features, and leads the team that builds them",
  ],
  availability: "Available from April 2027",
```

- [ ] **Step 5: index.astro の header を直す**

`src/pages/index.astro` の `<p class="summary">{cv.summary}</p>` の行を次の3要素に置き換える:

```astro
    <ul class="bullets strengths">
      {cv.strengths.map((line) => <li>{line}</li>)}
    </ul>
    <p class="availability">{cv.availability}</p>
    <p class="summary">{cv.summary}</p>
```

- [ ] **Step 6: CSS を足す**

`src/styles/site.css` の `.more { ... }` の行（77行目付近）の次の行に追加する。`.bullets`（75行目付近）の小さい灰色文字を、見出し直下の強みでは本文と同じにするための上書きで、同じ詳細度なので **`.bullets` より後ろに書く必要がある**:

```css
.strengths { margin-top: 20px; font-size: inherit; color: var(--fg); }
.availability { margin: 10px 0 0; font-weight: 600; }
```

- [ ] **Step 7: 通ることを確認**

Run: `pnpm test && pnpm build`
Expected: どちらも PASS（build の最後の dist 検査も全件 PASS）

- [ ] **Step 8: 見た目を確認**

Run: `pnpm preview` → http://localhost:4321 を開き、名前の下に「3行の強み（点付き）→ 太字の Available from April 2027 → Summary」が並ぶこと、ダークテーマ（右上のボタン）でも読めることを確認。

- [ ] **Step 9: コミット**

```bash
git add src/data/cv.ts src/data/cv.test.ts src/pages/index.astro src/styles/site.css tests/dist/published-output.test.ts
git commit -m "feat: トップに強みと着任時期を追加しSummaryを差し替え"   # 本文に署名2行
```

---

## Task 8: Case studies のデータを追加

**Files:**
- Modify: `src/data/cv.ts`（型 `CvCaseStudy`、`caseStudies`）
- Modify: `src/data/cv.test.ts`

英文は下に確定版を載せる。**事実は依頼時に与えられたものと `career-ops/cv.md` にあるものだけ**を使っている。推測が混じる箇所は「本人確認が必要な点」（計画末尾）に挙げてあり、PR でも本人に確認を求める。

- [ ] **Step 1: 失敗するテストを書く**

`src/data/cv.test.ts` の `describe('cv', ...)` に追加:

```ts
  it('test_read_case_studies_returns_three_with_every_part_filled', () => {
    expect(cv.caseStudies).toHaveLength(3)
    for (const study of cv.caseStudies) {
      for (const field of [study.title, study.summary, study.problem, study.role, study.outcome]) {
        expect(field.trim(), study.title).not.toBe('')
      }
      expect(study.tags.length, study.title).toBeGreaterThan(0)
      expect(study.decisions.length, study.title).toBeGreaterThan(0)
      study.decisions.forEach((decision) => expect(decision.trim(), study.title).not.toBe(''))
    }
  })

  it('test_read_case_study_summaries_returns_single_lines', () => {
    for (const study of cv.caseStudies) {
      expect(study.summary, study.title).not.toMatch(/\n/)
      expect(study.summary.length, study.title).toBeLessThanOrEqual(110)
    }
  })

  it('test_read_case_studies_contains_no_volume_metrics', () => {
    const text = JSON.stringify(cv.caseStudies)
    expect(text).not.toMatch(/\b\d[\d,]*\s+(tests?|commits?|tables?|lines)\b/i)
    expect(text).not.toMatch(/% of (the )?code/i)
  })

  it('test_read_llm_agent_case_study_says_launch_is_planned_not_shipped', () => {
    const agent = cv.caseStudies[0]
    expect(agent.title).toBe('LLM agent for a financial management SaaS')
    expect(agent.outcome).toContain('planned for April 2027')
    expect(JSON.stringify(agent)).not.toMatch(/\bshipped\b|\blaunched\b|\bin production\b/i)
  })

  it('test_read_tuition_platform_case_study_keeps_field_results', () => {
    const platform = cv.caseStudies[2]
    expect(platform.outcome).toContain('around 100 invoices a month')
    expect(platform.outcome).toContain('about five hours')
    expect(platform.outcome).toContain('roughly 10% to near zero')
  })
```

（契約の話をする文で "valid / empty / invalid" のような語が出るので、短縮形・禁止語・禁止文字列の検査は Task 5・7 で入れた cv 全体へのテストがそのまま効く。）

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/data/cv.test.ts`
Expected: FAIL（`cv.caseStudies` が undefined）

- [ ] **Step 3: 型を足す**

`src/data/cv.ts` の `interface CvAward` の後に追加:

```ts
export interface CvCaseStudy {
  title: string
  // One line for the closed accordion.
  summary: string
  tags: string[]
  problem: string
  role: string
  // The body of the case study: what was decided, and why.
  decisions: string[]
  outcome: string
}
```

`interface Cv` の `availability: string` の次に追加:

```ts
  // Industry only: no client names, screenshots or code (see the design doc).
  caseStudies: CvCaseStudy[]
```

- [ ] **Step 4: データを足す（英文確定版）**

`src/data/cv.ts` のデータの `availability: "Available from April 2027",` の次に追加:

```ts
  caseStudies: [
    {
      title: "LLM agent for a financial management SaaS",
      summary: "A tool-calling agent that answers finance questions over customer accounting data.",
      tags: ["Vue", "Django", "PostgreSQL", "AWS"],
      problem:
        "A client-commissioned reporting platform turns annual P&L statements into information a business can act on. It needed an agent that answers finance questions over each customer's accounting data. An agent that calls tools to fetch data will still write a confident answer when a tool returns nothing, or returns the wrong thing.",
      role:
        "Principal engineer and project manager. I led a team of nine engineers, was the client's direct technical contact, designed the architecture and owned code review.",
      decisions: [
        "Every tool has a typed output contract with three outcomes: valid, empty or invalid. The agent answers only from a valid result. An empty or invalid result is handled as such, instead of being passed to the model as if it were data.",
        "A golden-set harness runs a fixed set of questions with known answers against every prompt or model change, so a change that makes the answers worse is caught before release.",
      ],
      outcome: "The agent is in development. Its production launch is planned for April 2027.",
    },
    {
      title: "Document AI for revising condominium bylaws",
      summary: "OCR and an LLM turn scanned bylaws into a revised draft in Word.",
      tags: ["Next.js", "Python", "GCP", "Azure"],
      problem:
        "A Japanese property-management group revises condominium management bylaws against the standard bylaws. The bylaws it starts from are scanned paper documents.",
      role: "Architect, and reviewer of the code that the delivery engineers write.",
      decisions: [
        "The work has three steps: OCR of the scanned bylaws, comparison with the standard bylaws by an LLM, and export to Word. Each step is slow and fails in its own way, so I split them into three services (OCR, revision and export) joined by a file-handoff contract. A step that fails can be retried on its own, without running the steps before it again.",
        "OCR and LLM output will sometimes be partly wrong. I designed how those outputs are handled so that a person can check them before they are used.",
      ],
      outcome:
        "The system takes a scanned set of bylaws to a revised draft in Word, which a person checks before use. I continue to review the delivery engineers' implementations.",
    },
    {
      title: "Operations platform for a tuition centre",
      summary: "Member records, monthly invoices and messaging in one system, replacing invoicing in Excel.",
      tags: ["Cloudflare", "Hono"],
      problem:
        "The centre produced its monthly invoices from Excel by hand. The work took hours every month, and roughly one invoice in ten had an error.",
      role: "Sole engineer and operator. I built the system and I still run it.",
      decisions: [
        "Member records, invoices and messages live in one system, so each invoice is generated from the same member record that the message goes to, instead of being copied between spreadsheets.",
        "Messages go out over email, WhatsApp and SMS from the same place, so a family is reached on the channel it uses.",
      ],
      outcome:
        "The system sends around 100 invoices a month. It saves about five hours of manual work every month, and invoicing errors went from roughly 10% to near zero. It is in production use across the centre's operations.",
    },
  ],
```

- [ ] **Step 5: 通ることを確認**

Run: `pnpm test`
Expected: PASS（短縮形・禁止語・禁止文字列・数字のテストも含めて全件）

- [ ] **Step 6: コミット**

```bash
git add src/data/cv.ts src/data/cv.test.ts
git commit -m "feat: 事例紹介3件のデータを追加"   # 本文に署名2行
```

---

## Task 9: Case studies をトップにアコーディオンで描画

**Files:**
- Create: `src/components/CaseStudy.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/site.css`
- Modify: `tests/dist/published-output.test.ts`

- [ ] **Step 1: 失敗するテストを書く（dist）**

`tests/dist/published-output.test.ts` の最後の `it` の後に追加:

```ts
  it('test_render_case_studies_returns_three_closed_accordions_with_four_parts', () => {
    const home = page('index.html')
    const openings = home.match(/<details class="job case-study"[^>]*>/g) ?? []
    expect(openings).toHaveLength(3)
    for (const opening of openings) expect(opening).not.toMatch(/\sopen\b/)
    for (const heading of ['Problem', 'My role', 'Key decisions', 'Outcome']) {
      const count = (home.match(new RegExp(`<dt[^>]*>${heading}</dt>`, 'g')) ?? []).length
      expect(count, heading).toBe(3)
    }
  })

  it('test_render_home_orders_case_studies_before_experience', () => {
    const home = page('index.html')
    const caseStudies = home.indexOf('>Case studies</h2>')
    const experience = home.indexOf('>Experience</h2>')
    expect(caseStudies).toBeGreaterThan(-1)
    expect(experience).toBeGreaterThan(caseStudies)
  })
```

- [ ] **Step 2: 失敗を確認**

Run: `pnpm build`
Expected: FAIL（dist 検査で case-study が0件、`Case studies` 見出しが無い）

- [ ] **Step 3: コンポーネントを作る**

`src/components/CaseStudy.astro`:

```astro
---
import type { CvCaseStudy } from '../data/cv';

interface Props {
  study: CvCaseStudy;
}

const { study } = Astro.props;
---

<details class="job case-study">
  <summary class="row">
    <span class="row-main"><span class="role">{study.title}</span> — {study.summary}</span>
    <span class="row-meta">{study.tags.join(' · ')}</span>
  </summary>
  <dl class="case">
    <dt>Problem</dt>
    <dd>{study.problem}</dd>
    <dt>My role</dt>
    <dd>{study.role}</dd>
    <dt>Key decisions</dt>
    <dd>
      <ul class="bullets">
        {study.decisions.map((decision) => <li>{decision}</li>)}
      </ul>
    </dd>
    <dt>Outcome</dt>
    <dd>{study.outcome}</dd>
  </dl>
</details>
```

（`<style>` を持たせないこと。持たせると Astro が `data-astro-cid-*` 属性を足し、`site.css` の `.job` 系ルールと dist テストの正規表現の前提が崩れる。）

- [ ] **Step 4: index.astro に差し込む**

`src/pages/index.astro` の frontmatter の import 群に追加:

```astro
import CaseStudy from '../components/CaseStudy.astro';
```

`</header>` と `<Section title="Experience">` の間に追加:

```astro
  <Section title="Case studies">
    {cv.caseStudies.map((study) => <CaseStudy study={study} />)}
  </Section>
```

- [ ] **Step 5: CSS を足す**

`src/styles/site.css` の `.job > .bullets { padding-left: 2.4em; }` の次の行に追加:

```css
.job > .case { margin: 6px 0 0; padding-left: 1.2em; font-size: .875rem; color: var(--muted); }
.case dt { margin-top: 10px; font-weight: 600; color: var(--fg); }
.case dd { margin: 2px 0 0; }
.case .bullets { margin-top: 2px; font-size: inherit; }
```

- [ ] **Step 6: 通ることを確認**

Run: `pnpm test && pnpm build`
Expected: PASS（`pnpm test` は `src/styles/site.test.ts` のコントラスト検査も含む。色は増やしていないので通る）

- [ ] **Step 7: 見た目を確認**

`pnpm preview` → 3件が閉じた状態で「+ タイトル — 1行要約 ……… タグ」と並び、開くと Problem / My role / Key decisions / Outcome が太字見出しで出ること。幅 375px（DevTools のモバイル表示）でタグが要約の下に回り込み、横スクロールが出ないこと。

- [ ] **Step 8: コミット**

```bash
git add src/components/CaseStudy.astro src/pages/index.astro src/styles/site.css tests/dist/published-output.test.ts
git commit -m "feat: トップに事例紹介のアコーディオンを追加"   # 本文に署名2行
```

---

## Task 10: Side projects の frontmatter を整える

**Files:**
- Modify: `src/lib/content.ts`（`ProjectFrontmatter`、`getFeaturedProjects` の既定件数）
- Modify: `src/lib/content.test.ts`
- Modify: `content/projects/SBBirdMap.md`、`Portree.md`、`PrintableSpectrogram.md`、`CodeAnnotator.md`、`CCAccountSwitcher.md`

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/content.test.ts` の `describe('getFeaturedProjects', ...)` の中の `test_read_featured_projects_after_ocr_vfs_removal_returns_remaining_three` を次に置き換え、2件追加:

```ts
  it('test_read_featured_projects_returns_the_five_side_projects_in_order', () => {
    expect(getFeaturedProjects().map((p) => p.slug)).toEqual([
      'SBBirdMap',
      'Portree',
      'PrintableSpectrogram',
      'CodeAnnotator',
      'CCAccountSwitcher',
    ])
  })

  it('test_read_featured_projects_returns_short_name_and_technical_point_for_each', () => {
    for (const project of getFeaturedProjects()) {
      expect(project.frontmatter.name?.trim(), project.slug).toBeTruthy()
      expect(project.frontmatter.technicalPoint?.trim(), project.slug).toBeTruthy()
      expect(project.frontmatter.technicalPoint, project.slug).not.toMatch(/\n/)
    }
  })
```

`describe('project content', ...)` の中に追加:

```ts
  it('test_read_bird_map_frontmatter_returns_demo_only_and_fixed_typo', () => {
    const map = getAllProjects().find((project) => project.slug === 'SBBirdMap')!
    expect(map.frontmatter.githubUrl ?? '').toBe('')
    expect(map.frontmatter.liveUrl).toBe('https://sgbirdsmap.fairy-pitta.net')
    expect(map.frontmatter.description).not.toContain('interative')
  })

  it('test_read_portree_frontmatter_returns_qiita_article_link', () => {
    const portree = getAllProjects().find((project) => project.slug === 'Portree')!
    expect(portree.frontmatter.articleUrl).toBe('https://qiita.com/Pitta/items/4a6537a3450aa6f8f050')
    expect(portree.frontmatter.articleLabel).toBe('Article on Qiita (Japanese)')
  })

  it('test_read_project_content_contains_no_test_counts', () => {
    for (const project of getAllProjects()) {
      expect(project.content, project.slug).not.toMatch(/\b\d+\s+(\[[^\]]+\]\([^)]+\)\s+)?tests\b/i)
    }
  })
```

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/lib/content.test.ts`
Expected: FAIL（featured の並び、name / technicalPoint 未定義、typo、articleUrl、CCAccountSwitcher の `85 [bats](...) tests`）。`astro check` は後で通す。

- [ ] **Step 3: 型と既定件数を直す**

`src/lib/content.ts` の `ProjectFrontmatter` を次にする:

```ts
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
  // Short name for the homepage accordion; the title is written for the project page.
  name?: string
  // One or two sentences on the engineering choice worth noticing, shown on the homepage.
  technicalPoint?: string
  // A write-up hosted elsewhere, such as a Qiita article.
  articleUrl?: string
  articleLabel?: string
}
```

`getFeaturedProjects(limit = 4)` を `getFeaturedProjects(limit = 5)` にする。

- [ ] **Step 4: frontmatter を直す**

各ファイルの frontmatter（`---` の間）に次を反映する。本文は CCAccountSwitcher の1行以外触らない。

`content/projects/SBBirdMap.md`（`githubUrl` は Task 6 で削除済み）:
- `description:` を `"An interactive map of Singapore Birds in the past 23 years."` に（typo `interative` の修正のみ）
- 追加:

```yaml
featured: true
order: 1
name: "SG Bird Observation Map"
technicalPoint: "Observations from the eBird API are synced into the map's own database by a scheduled job every night, so the map filters by date and species without calling eBird on each visit."
```

`content/projects/Portree.md`:
- `order: 1` → `order: 2`
- 追加:

```yaml
name: "portree"
technicalPoint: "Each worktree's ports come from a hash of its branch name (FNV-32), so a branch gets the same ports every time without a shared registry. A built-in reverse proxy routes branch-name.localhost to the right server."
articleUrl: "https://qiita.com/Pitta/items/4a6537a3450aa6f8f050"
articleLabel: "Article on Qiita (Japanese)"
```

`content/projects/PrintableSpectrogram.md`:
- `order: 4` → `order: 3`
- 追加:

```yaml
name: "Printable Spectrogram"
technicalPoint: "The STFT runs in Rust compiled to WebAssembly, so the whole tool works in the browser with no server. Annotations stay as SVG, so exported figures remain vector graphics."
```

`content/projects/CodeAnnotator.md`:
- 追加:

```yaml
featured: true
order: 4
name: "Code Annotator"
technicalPoint: "Runs entirely in the browser, with Prism.js for highlighting and an HTML5 Canvas pipeline for PNG export, so no code leaves the user's machine."
```

`content/projects/CCAccountSwitcher.md`:
- `order: 2` → `order: 5`
- 追加:

```yaml
name: "CC Account Switcher"
technicalPoint: "A single Bash 3.2 script, so it runs on the stock macOS shell with no extra dependencies. A switch that fails halfway rolls back automatically, and credentials are kept in the macOS keychain or in protected files on Linux and WSL."
```

- 本文の31行目を置き換え（テスト件数を外す）:

```diff
-- 85 [bats](https://github.com/bats-core/bats-core) tests covering concurrency, isolation and platform differences, run in GitHub Actions
+- A [bats](https://github.com/bats-core/bats-core) test suite covering concurrency, isolation and platform differences, run in GitHub Actions
```

- [ ] **Step 5: 通ることを確認**

Run: `pnpm test && pnpm build`
Expected: PASS。トップの Projects セクション（Task 11 で置き換える）は5件になっている。

- [ ] **Step 6: コミット**

```bash
git add src/lib/content.ts src/lib/content.test.ts content/projects
git commit -m "feat: 個人開発5件に短い名前と技術上の要点を追加"   # 本文に署名2行
```

---

## Task 11: Side projects をアコーディオンで描画し、記事リンクを足す

**Files:**
- Modify: `src/lib/content.ts`（`projectLinks`）
- Modify: `src/lib/content.test.ts`
- Create: `src/components/SideProject.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/site.css`
- Modify: `tests/dist/published-output.test.ts`

- [ ] **Step 1: 失敗するテストを書く（projectLinks）**

`src/lib/content.test.ts` の `describe('projectLinks', ...)` に追加:

```ts
  it('test_build_links_with_article_url_appends_article_after_code_and_live', () => {
    expect(
      projectLinks({
        ...base,
        githubUrl: 'https://github.com/x',
        liveUrl: 'https://x.dev',
        articleUrl: 'https://qiita.com/x/items/1',
        articleLabel: 'Article on Qiita (Japanese)',
      }),
    ).toEqual([
      { label: 'Code', href: 'https://github.com/x' },
      { label: 'Live', href: 'https://x.dev' },
      { label: 'Article on Qiita (Japanese)', href: 'https://qiita.com/x/items/1' },
    ])
  })

  it('test_build_links_with_article_url_but_no_label_uses_article', () => {
    expect(projectLinks({ ...base, articleUrl: 'https://example.com/post' })).toEqual([
      { label: 'Article', href: 'https://example.com/post' },
    ])
  })
```

- [ ] **Step 2: 失敗するテストを書く（dist）**

`tests/dist/published-output.test.ts` の最後の `it` の後に追加:

```ts
  it('test_render_side_projects_returns_five_closed_accordions_with_links', () => {
    const home = page('index.html')
    const openings = home.match(/<details class="job side-project"[^>]*>/g) ?? []
    expect(openings).toHaveLength(5)
    for (const opening of openings) expect(opening).not.toMatch(/\sopen\b/)
    expect(home).toContain('href="https://sgbirdsmap.fairy-pitta.net"')
    expect(home).toContain('href="https://qiita.com/Pitta/items/4a6537a3450aa6f8f050"')
    expect(home).toContain('href="https://github.com/fairy-pitta/code-annotator"')
    expect(home).toContain('>Side projects</h2>')
  })
```

- [ ] **Step 3: 失敗を確認**

Run: `pnpm test src/lib/content.test.ts`
Expected: FAIL（article のリンクが返らない）

- [ ] **Step 4: projectLinks を直す**

`src/lib/content.ts` の `projectLinks` を次に置き換える:

```ts
export interface ProjectLink {
  label: string
  href: string
}

export function projectLinks(frontmatter: ProjectFrontmatter): ProjectLink[] {
  const links: ProjectLink[] = []
  if (frontmatter.githubUrl?.trim()) links.push({ label: "Code", href: frontmatter.githubUrl.trim() })
  if (frontmatter.liveUrl?.trim()) links.push({ label: "Live", href: frontmatter.liveUrl.trim() })
  if (frontmatter.articleUrl?.trim()) {
    links.push({ label: frontmatter.articleLabel?.trim() || "Article", href: frontmatter.articleUrl.trim() })
  }
  return links
}
```

（`src/pages/projects/[slug].astro` も `projectLinks` を使っているので、portree の個別ページにも記事リンクが出る。これは意図どおり。）

- [ ] **Step 5: コンポーネントを作る**

`src/components/SideProject.astro`:

```astro
---
import { projectLinks, type Project } from '../lib/content';

interface Props {
  project: Project;
}

const { project } = Astro.props;
const { frontmatter } = project;
const links = [...projectLinks(frontmatter), { label: 'Project page', href: `/projects/${project.slug}` }];
---

<details class="job side-project">
  <summary class="row">
    <span class="row-main"><span class="role">{frontmatter.name ?? frontmatter.title}</span></span>
    <span class="row-meta">{frontmatter.tags.slice(0, 2).join(' · ')}</span>
  </summary>
  <dl class="case">
    <dt>What it is</dt>
    <dd>{frontmatter.description}</dd>
    {frontmatter.technicalPoint && (
      <>
        <dt>Technical point</dt>
        <dd>{frontmatter.technicalPoint}</dd>
      </>
    )}
  </dl>
  <p class="case-links">
    {links.map((link, i) => (
      <>
        {i > 0 && ' · '}
        {link.href.startsWith('/') ? (
          <a href={link.href}>{link.label}</a>
        ) : (
          <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
        )}
      </>
    ))}
  </p>
</details>
```

- [ ] **Step 6: index.astro の Projects セクションを置き換える**

frontmatter の import 群に追加:

```astro
import SideProject from '../components/SideProject.astro';
```

既存の `<Section title="Projects"> ... </Section>`（`projects.map` と `All projects →` を含むブロック全体）を次に置き換える:

```astro
  <Section title="Side projects">
    {projects.map((project) => <SideProject project={project} />)}
    <p class="more"><a href="/projects">All projects →</a></p>
  </Section>
```

- [ ] **Step 7: CSS を足す**

`src/styles/site.css` の `.case .bullets { ... }`（Task 9）の次の行に追加:

```css
.job > .case-links { margin: 8px 0 0; padding-left: 1.2em; font-size: .875rem; }
```

- [ ] **Step 8: 通ることを確認**

Run: `pnpm test && pnpm build`
Expected: PASS

- [ ] **Step 9: 見た目を確認**

`pnpm preview` → Side projects に5件（SG Bird Observation Map, portree, Printable Spectrogram, Code Annotator, CC Account Switcher の順）。開くと What it is / Technical point / リンク行。SG Bird Observation Map のリンクは `Live · Project page` だけで Code が無いこと。portree に `Article on Qiita (Japanese)` があること。

- [ ] **Step 10: コミット**

```bash
git add src/lib/content.ts src/lib/content.test.ts src/components/SideProject.astro src/pages/index.astro src/styles/site.css tests/dist/published-output.test.ts
git commit -m "feat: トップに個人開発のアコーディオンを追加"   # 本文に署名2行
```

---

## Task 12: トップの Writing を外し、/blog をナビゲーションから外す

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/lib/site-map.ts`
- Modify: `src/lib/site-map.test.ts`
- Modify: `tests/dist/published-output.test.ts`

`/blog` と `/blog/[slug]`、`writing.ts`、`WritingRow.astro`、rss、sitemap と llms.txt の `/blog/` 行は**残す**（既存リンクを切らない）。

- [ ] **Step 1: 失敗するテストを書く**

`tests/dist/published-output.test.ts` の最後の `it` の後に追加:

```ts
  it('test_render_home_and_404_without_blog_link_keeps_blog_page_built', () => {
    for (const file of ['index.html', '404.html']) {
      expect(page(file), file).not.toMatch(/href="\/blog/)
    }
    expect(page('index.html')).not.toContain('>Writing</h2>')
    expect(existsSync(join(DIST, 'blog', 'index.html'))).toBe(true)
  })
```

`src/lib/site-map.test.ts` に追加:

```ts
describe('HOME', () => {
  it('test_read_home_description_names_case_studies_and_side_projects', () => {
    expect(HOME.description).toContain('case studies')
    expect(HOME.description).toContain('side projects')
  })
})
```

（import に `HOME` を足す: `import { HOME, absoluteUrl, blogEntries, indexablePages, projectEntries } from './site-map'`）

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/lib/site-map.test.ts && pnpm build`
Expected: どちらも FAIL

- [ ] **Step 3: index.astro を最終形にする**

`src/pages/index.astro` 全体を次にする（Task 7・9・11 の変更を含んだ最終形。Writing 関係の import と変数を削除し、Skills の後ろに Contact）:

```astro
---
import Layout from '../layouts/Layout.astro';
import Section from '../components/Section.astro';
import Row from '../components/Row.astro';
import Contact from '../components/Contact.astro';
import CaseStudy from '../components/CaseStudy.astro';
import SideProject from '../components/SideProject.astro';
import { cv } from '../data/cv';
import { getFeaturedProjects } from '../lib/content';

const projects = getFeaturedProjects();
---

<Layout>
  <header>
    <h1>{cv.name} <span class="muted" style="font-weight:400">({cv.handle})</span></h1>
    <p class="muted">{cv.headline} · {cv.location}</p>
    <p class="links">
      {cv.links.map((link, i) => (
        <>{i > 0 && ' · '}<a href={link.href}>{link.label}</a></>
      ))}
    </p>
    <ul class="bullets strengths">
      {cv.strengths.map((line) => <li>{line}</li>)}
    </ul>
    <p class="availability">{cv.availability}</p>
    <p class="summary">{cv.summary}</p>
  </header>

  <Section title="Case studies">
    {cv.caseStudies.map((study) => <CaseStudy study={study} />)}
  </Section>

  <Section title="Experience">
    {cv.experience.map((job, i) => (
      <details class="job" open={i === 0}>
        <summary class="row">
          <span class="row-main"><span class="role">{job.role}</span> — {job.org}</span>
          <span class="row-meta">{job.period}</span>
        </summary>
        <ul class="bullets">
          {job.bullets.map((bullet) => <li>{bullet}</li>)}
        </ul>
      </details>
    ))}
  </Section>

  <Section title="Side projects">
    {projects.map((project) => <SideProject project={project} />)}
    <p class="more"><a href="/projects">All projects →</a></p>
  </Section>

  <Section title="Education">
    {cv.education.map((edu) => (
      <>
        <Row meta={`${edu.country} · ${edu.period}`}>{edu.school} — {edu.degree}</Row>
        {edu.bullets && (
          <ul class="bullets">
            {edu.bullets.map((bullet) => <li>{bullet}</li>)}
          </ul>
        )}
      </>
    ))}
  </Section>

  <Section title="Certifications">
    <ul class="bullets">
      {cv.certifications.map((certification) => (
        <li>
          <a href={certification.href} target="_blank" rel="noopener noreferrer">{certification.name}</a>
          <span class="muted"> ({certification.year})</span>
        </li>
      ))}
    </ul>
  </Section>

  <Section title="Awards">
    {cv.awards.map((award) => (
      <Row meta={award.period}>{award.title}</Row>
    ))}
  </Section>

  <Section title="Skills">
    <dl class="skills">
      {cv.skills.map((group) => (
        <>
          <dt>{group.label}</dt>
          <dd>{group.items.join(', ')}</dd>
        </>
      ))}
    </dl>
  </Section>

  <Section title="Contact">
    <Contact />
  </Section>
</Layout>
```

- [ ] **Step 4: 404 から Writing を外す**

`src/pages/404.astro` の該当行を次にする:

```astro
    <a href="/">Home</a> · <a href="/projects">Projects</a>
```

- [ ] **Step 5: HOME の説明文**

`src/lib/site-map.ts` の `HOME.description` を次にする:

```ts
  description: "Strengths, case studies, experience, side projects, education, certifications and skills.",
```

- [ ] **Step 6: 通ることを確認**

Run: `pnpm test && pnpm build`
Expected: PASS

- [ ] **Step 7: コミット**

```bash
git add src/pages/index.astro src/pages/404.astro src/lib/site-map.ts src/lib/site-map.test.ts tests/dist/published-output.test.ts
git commit -m "feat: トップのWritingを外しブログ導線を削除"   # 本文に署名2行
```

---

## Task 13: Education / Certifications / Skills を CV に合わせる

**Files:**
- Modify: `src/data/cv.ts`
- Modify: `src/data/cv.test.ts`

CV（`career-ops/cv.md`）では運転免許は Certifications ではなく Additional にある。Certifications は CV の6件に揃え、免許は Skills の `Licence` 行に移す。Spoken に CV の `Spanish (beginner)` を足す。学歴の表記を CV に合わせる（GPA は載せない）。

- [ ] **Step 1: 失敗するテストを書く**

`src/data/cv.test.ts` の `describe('cv', ...)` に追加:

```ts
  it('test_read_frameworks_returns_django_react_hono_only', () => {
    expect(cv.skills.find((group) => group.label === 'Frameworks')?.items).toEqual(['Django', 'React', 'Hono'])
  })

  it('test_read_certifications_returns_the_six_on_the_cv_in_order', () => {
    expect(cv.certifications.map((certification) => certification.name)).toEqual([
      'AWS Certified Solutions Architect – Professional',
      'AWS Certified Generative AI Developer – Professional',
      'AWS Certified Solutions Architect – Associate',
      'IPA Database Specialist',
      'IPA Applied Information Technology Engineer',
      'IPA Fundamental Information Technology Engineer',
    ])
  })

  it('test_read_skills_keeps_driving_licence_outside_certifications', () => {
    expect(cv.skills.find((group) => group.label === 'Licence')?.items).toEqual([
      'Singapore Class 3CA driving licence (2024)',
    ])
  })

  it('test_read_first_degree_returns_cv_wording', () => {
    expect(cv.education[0].degree).toBe('BSc (Honours), First Class')
  })
```

- [ ] **Step 2: 失敗を確認**

Run: `pnpm test src/data/cv.test.ts`
Expected: FAIL（Frameworks、certifications の7件目、Licence、degree）

- [ ] **Step 3: データを直す**

`src/data/cv.ts`:

- `certifications` から `Singapore Class 3CA driving licence` の要素（`{ name: "Singapore Class 3CA driving licence", ... }` の4行）を削除。
- `skills` を次にする:

```ts
  skills: [
    { label: "Languages", items: ["Python", "TypeScript", "R"] },
    { label: "Frameworks", items: ["Django", "React", "Hono"] },
    { label: "Cloud", items: ["AWS", "Cloudflare", "Vercel", "Supabase"] },
    { label: "Data", items: ["PostgreSQL", "SQLite"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)", "Spanish (beginner)"] },
    { label: "Licence", items: ["Singapore Class 3CA driving licence (2024)"] },
  ],
```

- `education` を次の表記にする（`bullets` は既存のまま残す）:
  - Yale-NUS College: `degree: "BSc (Honours), First Class"`, `period: "Aug 2019 – May 2023"`
  - United World College Costa Rica: `period: "Aug 2017 – May 2019"`
  - Nishiyamato Gakuen Academy → `school: "Nishiyamato Gakuen"`

- [ ] **Step 4: 通ることを確認**

Run: `pnpm test && pnpm build`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/data/cv.ts src/data/cv.test.ts
git commit -m "feat: 学歴・資格・スキルをCVの表記に合わせる"   # 本文に署名2行
```

---

## Task 14: wrangler.toml の name を実在の Pages プロジェクトに直す

**Files:**
- Modify: `wrangler.toml`

判断の根拠は冒頭「wrangler.toml の判断」。git 連携ビルドは name を見ていない（現在の誤った name でもビルドが通っている）ので、直しても本番ビルドは変わらない。直す理由は、手で `wrangler pages deploy` したときに別プロジェクト `singbirds-portfolio` が作られる事故を防ぐため。

- [ ] **Step 1: 書き換え**

`wrangler.toml` 全体:

```toml
# wrangler.toml ── ルートに置いて Git にコミット
# name は Cloudflare Pages の実在プロジェクト名（fairy-pitta.net を配信している e-folio）。
# 本番は GitHub 連携ビルドで、ここの name は使われない。手で `wrangler pages deploy` した
# ときに別プロジェクトが作られないよう、実名に揃えている。
name                 = "e-folio"
compatibility_date   = "2025-07-12"

pages_build_output_dir = "dist"
compatibility_flags = ["nodejs_compat"]
```

- [ ] **Step 2: ローカルで壊れていないことを確認**

Run: `pnpm build`
Expected: PASS（wrangler.toml は astro build に関係しない）

Run: `wrangler pages project list`
Expected: `e-folio` が一覧にあり、Project Domains に `fairy-pitta.net` を含む（名前の綴りを目で照合する）

- [ ] **Step 3: コミット**

```bash
git add wrangler.toml
git commit -m "chore: wrangler.tomlのnameを実在のPagesプロジェクトに"   # 本文に署名2行
```

（ビルドへの影響は Task 15 のプレビュービルドで確認する。失敗したらこのコミットだけ `git revert` する。）

---

## Task 15: 全体確認・push・PR（マージはしない）

**Files:** なし（確認と GitHub 操作のみ）

- [ ] **Step 1: 全チェック**

```bash
pnpm lint
pnpm test
pnpm astro check
pnpm build          # 最後に tests/dist の検査が走る
```

Expected: すべて終了コード 0。`pnpm test` の件数は開始時の 119 より増えている。

- [ ] **Step 2: dist を目でも grep する**

```bash
grep -rniE 'wao|8851|shuna120700|mailto:|ocr-?vfs|github\.com/fairy-pitta/SGBirdMap' dist \
  --include='*.html' --include='*.txt' --include='*.xml' --include='*.js' --include='*.css' --include='*.json' --include='*.svg'
ls dist/projects
```

Expected: grep は何も出さない（終了コード 1）。`dist/projects` に `OcrVfs` が無い。

（もし `_astro/*.js` のハッシュ文字列などで `8851` が偶然一致した場合は、該当箇所が電話番号でないことを確認したうえで、`FORBIDDEN` の電話番号パターンを `/8851\s?0049/` に絞る。その場合は Task 1 のテストの例文も合わせて直す。）

- [ ] **Step 3: リンクを再確認**

```bash
for u in https://sgbirdsmap.fairy-pitta.net https://github.com/fairy-pitta/portree \
  https://qiita.com/Pitta/items/4a6537a3450aa6f8f050 https://spectrogram.fairy-pitta.net/ \
  https://github.com/fairy-pitta/printable_spectrogram https://github.com/fairy-pitta/code-annotator \
  https://github.com/fairy-pitta/cc-account-switcher https://registry.npmjs.org/@fairy-pitta%2fcc-account-switcher \
  https://github.com/fairy-pitta; do
  printf "%s %s\n" "$(curl -s -o /dev/null -L -w '%{http_code}' -A 'Mozilla/5.0' "$u")" "$u"
done
```

Expected: すべて 200（LinkedIn は 999 を返すので対象外。npm は www が 403 なので registry で確認）

- [ ] **Step 4: 見た目の最終確認**

`pnpm preview` → http://localhost:4321 で、上から「名前・肩書き・LinkedIn / GitHub → 強み3行 → Available from April 2027 → Summary → Case studies(3) → Experience → Side projects(5) → Education → Certifications → Awards → Skills → Contact（CV available on request. ＋フォーム）」の順であること。ライト/ダーク、幅 375px で崩れないこと。電話・メールがどこにも表示されないこと。`/blog` を直接開くとページが出ること（ナビからは辿れない）。`/projects/OcrVfs` が 404 ページになること。

- [ ] **Step 5: push**

```bash
git status --short     # 何も残っていないこと
git push -u origin feature/portfolio-for-job-hunt
```

- [ ] **Step 6: PR を作る（マージしない）**

```bash
gh pr create --base main --head feature/portfolio-for-job-hunt \
  --title "転職用にトップページを作り直す（事例紹介・個人開発・個人情報の非公開化）" \
  --body "$(cat <<'EOF'
## 概要
設計: docs/superpowers/specs/2026-10-22-portfolio-for-job-hunt-design.md
計画: docs/superpowers/plans/2026-10-22-portfolio-for-job-hunt.md

- トップを「強み → Summary → Case studies → Experience → Side projects → Education/Certifications/Skills → Contact」に再構成
- 勤め先名・電話・メール・OCR-VFS・顧客名をサイトから排除し、`pnpm build` の最後に dist/ 全体を検査するテストを追加（漏れがあれば CI と Cloudflare Pages のビルドが落ちる）
- Contact のメール表示を LinkedIn 誘導に変更、「CV available on request.」を追加
- トップの Writing を削除（/blog ページは残し、導線だけ外す）
- OCR-VFS を削除、SG Bird Observation Map の非公開リポジトリへのリンクを削除
- wrangler.toml の name を実在の Pages プロジェクト e-folio に修正

## ⚠ マージ前に本人確認が必要
- [ ] Case studies 3件の英文（`src/data/cv.ts` の `caseStudies`）: 顧客が特定されないか、事実と合っているか
- [ ] 事例3（tuition centre）の役割「Sole engineer and operator」: 以前のコミット cb99f5c で「3人チーム（PM 兼開発）」に直した経緯がある。CV（career-ops/cv.md）は sole engineer なので CV に合わせたが、どちらが正しいか
- [ ] 事例3の Key decisions 2点は CV に無い推測を含む（1つのシステムで請求と連絡を同じ会員レコードから出す／3チャネルから同じ場所で送る）
- [ ] 事例2の Outcome（人が確認してから使う Word の草案、レビューを継続中）は CV に結果の記述が無いため控えめに書いた
- [ ] Experience の1件目を CV に合わせて書き直した（WordPress サイトと Claude Code 社内勉強会の行は CV に無いので外した）
- [ ] 勤め先の表記「A software company in Singapore, part of a Japanese group」で、学習塾の授業が仕事の半分という説明と矛盾して読まれないか

## 確認
- pnpm lint / pnpm test / pnpm astro check / pnpm build（dist 検査込み）すべて通過
- dist/ を grep して WAO・電話・メール・mailto・OCR-VFS が0件
- リンクはすべて 200 を確認（LinkedIn はボット対策で 999、npm は registry で確認）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MbyfcUVfVkasoDAmhPxkC7
EOF
)"
```

- [ ] **Step 7: CI とプレビュービルドを確認**

```bash
gh pr checks --watch
wrangler pages deployment list --project-name e-folio | head -8
```

Expected: GitHub Actions の `check` が pass。Cloudflare Pages のチェック（またはデプロイ一覧の Branch `feature/portfolio-for-job-hunt` の Preview）が成功し、プレビュー URL でトップが新しい構成で表示される。Pages のビルドが wrangler.toml 起因で失敗した場合は `git revert <Task 14 のコミット>` → push → 再確認し、PR 本文にその旨を追記する。

- [ ] **Step 8: 止まる**

マージはしない。PR の URL を報告し、「Case studies の英文と上のチェックリストを本人が確認してからマージする」ことを伝える。

---

## 本人確認が必要な点・設計の曖昧な点（実装者は判断せず、この計画の決定に従う）

1. **事例3の役割が過去の修正と矛盾する。** `src/data/cv.ts` には「team of three（PM 兼開発）」とあり、コミット cb99f5c で「sole developer」から直した経緯がある。依頼と `career-ops/cv.md` は「sole engineer and operator」。→ 計画は CV に合わせ、PR で本人に確認する。
2. **事例3の Key decisions は推測を含む。** CV にあるのは機能と結果だけで、設計判断の記述が無い。設計書は「Key decisions が本体」とするので2点書いたが、本人確認が必須。
3. **事例2の Outcome に使える事実が無い。** 控えめな記述にした。
4. **事例2の技術。** 依頼と CV は「Next.js, Python, GCP, Azure」。旧 cv.ts の箇条書きは「Claude on AWS Bedrock」としていた。タグは CV に合わせた。
5. **Awards セクション。** 設計書のトップ構成一覧に Awards が無い。消すとは書いていないので残した（Skills の前）。
6. **ヘッダーの Qiita リンク。** 設計書のヘッダーは「LinkedIn / GitHub」なので外した。Qiita には portree の行から辿れる。
7. **Experience の書き換え範囲。** 設計書は「勤め先名を伏せる」だけだが、数字のルール（テスト件数など）と事例との食い違い（4〜8人 vs 9人、3人チーム vs 単独）を避けるため CV に合わせて書き直した。
8. **Skills / Education を CV に合わせる範囲。** 設計書は Frameworks だけ明示。運転免許を Certifications から Skills の `Licence` 行へ移し、Spanish を足し、学歴の表記を CV に揃えた。
9. **電話番号の検査パターン** は依頼どおり `8851` の部分一致。ハッシュとの偶然一致があり得るので Task 15 に対処法を書いた。
10. **プロジェクト個別ページの本文**（SBBirdMap の `you're`、米国綴り、Supabase/D1 の記述の不一致など）は範囲外として触っていない。SG Bird Observation Map の technicalPoint は「its own database」とし、どの DB かは書いていない。
11. **`/projects/OcrVfs` は 404 になる。** 設計書どおり完全削除で、リダイレクトは置かない。
12. **`public/manifest.json` の name が "SingBirds"** のまま（範囲外。気づいた点として記録）。
