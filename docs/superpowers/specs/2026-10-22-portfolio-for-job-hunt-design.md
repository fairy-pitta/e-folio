# fairy-pitta.net を転職用に作り直す — 設計

日付: 2026-10-22
ブランチ: `feature/portfolio-for-job-hunt`

## 目的

応募フォームの Website 欄に毎回入れるサイトにする。読み手はシンガポールの採用担当
（英語で読む・30秒で判断する）。CV に書ききれない「どう考えて作ったか」を補う。

成功の基準: トップを開いて、スクロールとアコーディオンだけで
「何ができる人か」「仕事で何を作ったか」「どう判断したか」が分かる。別ページに移らなくてよい。

## 方針（決定事項）

- 見た目は今のシンプルな1ページ CV 型を保つ。デザインは作り直さない。
- 詳細はアコーディオン（`<details>`）で開く。既存の Experience と同じ部品を使う。
- **勤め先の名前（WAO）はサイトに出さない。** 「a software company in Singapore, part of a Japanese group」と書く。CV（PDF）には今どおり載せる。
- **顧客名・スクリーンショット・コードは出さない。** 事例は業種だけで書く。
- **電話番号とメールアドレスは表示しない。** 連絡はお問い合わせフォームと LinkedIn。
- **CV の PDF ダウンロードは置かない。** 個人情報（電話・メール・勤め先）を公開しないため。代わりに「CV available on request」とフォームに誘導する。
- **数字は AI で水増しできないものだけ。** 率いた人数、現場の結果（請求件数、削減時間、誤り率）、使われている事実。テスト件数・コミット数・テーブル数・書いたコードの割合は載せない。数字の代わりに設計上の判断を書く。
- 文体: 短縮形を使わない。「the part I enjoy most」型の気取った言い回しを避ける。英国綴り（既存サイトに合わせる）。

## トップの構成（上から）

1. **ヘッダー**: 名前、肩書き（Software Engineer & Project Manager）、Singapore、LinkedIn / GitHub。電話・メールは出さない。
2. **強み（新設）**: 3行＋着任時期。
   - Designs LLM agents and the evaluation that keeps them reliable
   - Designs AWS systems from the data model to deployment
   - Works with clients to turn requirements into features, and leads the team that builds them
   - Available from April 2027
3. **Summary**: CV 冒頭の文から勤め先名を除いた版。
4. **Case studies（新設・アコーディオン3件）**
   - 閉じた状態: タイトル、1行の要約、技術タグ。
   - 開いた状態: Problem / My role / Key decisions / Outcome の4項目。Key decisions が本体。
   - 3件:
     1. **LLM agent for a financial management SaaS** — 顧客の会計データに答えるツール呼び出しエージェント。判断: ツールごとに型付きの出力契約（valid / empty / invalid）を持たせ、空や誤りの結果でモデルが動かないようにした。golden-set harness でプロンプト・モデル変更を回帰テストする。役割: principal engineer と PM、9人のチーム、顧客の技術窓口。本番稼働は 2027-04 予定と明記（shipped とは書かない）。
     2. **Document AI for revising condominium bylaws** — 日本の不動産管理会社向け。スキャンした規約を OCR、LLM で標準規約と比較、Word で出力。判断: 遅く失敗の仕方が違う3段階を、ファイル受け渡しの契約でつないだ3サービスに分け、段ごとにやり直せるようにした。役割: architect と reviewer。
     3. **Operations platform for a tuition centre** — Excel の請求を置き換え。会員管理、月次請求、メール・WhatsApp・SMS。結果: 月約100件、月5時間の手作業削減、請求の誤り約10% → ほぼゼロ、本人が一人で運用中。
5. **Experience**: 既存のアコーディオン。勤め先名を伏せる。
6. **Side projects（アコーディオン5件）**: SG Bird Observation Map、portree、Printable Spectrogram、Code Annotator、CC Account Switcher。開くと「何を作ったか」「技術上のポイント」「デモ / GitHub」。portree からは Qiita の解説記事（日本語）にリンクする。
7. **Education / Certifications / Skills**: CV に合わせる。Frameworks は `Django, React, Hono`（Vue と Next.js は載せない）。
8. **Contact**: フォーム＋「CV available on request」。

## 外すもの

- トップの **Writing** セクションを削除。`/blog` は残すがナビゲーションから外す（既存リンクを切らない）。
- **OCR-VFS** はサイトから完全に削除する（`content/projects/OCR-VFS.md` とそのページ）。PoC として失敗したため（2026-10-18 の判断）。
- Contact.astro の `mailto:` 表示（フォームが使えないときの代替）も、メールを出さない方針に合わせて LinkedIn への誘導に変える。

## 残すもの

- `/projects` 一覧と `/projects/[slug]` の個別ページ（OCR-VFS 以外）。既存リンクを切らない。
- お問い合わせフォーム（Pages Function `/api/contact`）。

## データの持ち方

- 強み・Case studies は `src/data/cv.ts` に型を足して持つ（既存の CV データと同じ場所。コメントにある「住所・ビザ・顧客の数字・GPA を入れない」ルールを守る）。
- Side projects は既存の `content/projects/*.md` の frontmatter を使い、トップに出す5件を `featured` と `order` で選ぶ。アコーディオンの中身は frontmatter の `description` と、新しい短いフィールド（技術上のポイント1〜2行）で足りるなら本文は使わない。

## 実装とレビュー

- 実装はサブエージェントに任せる。このブランチで作業し、PR を作る。
- 既存の vitest（約95件）・astro check・lint・build を通す。追加するデータとセクションにはテストを足す（cv.ts の型・必須項目、トップに勤め先名と電話・メールが出ないこと、OCR-VFS が出ないこと）。
- **Case studies の英文は、公開前に本人が確認する。** 顧客が特定されないか、事実と合っているか。
- 本人の確認後にマージし、Cloudflare Pages に反映する。

## 範囲外

- デザインの作り直し、日英切り替え、下書き記事の公開、CV の PDF 配布。
