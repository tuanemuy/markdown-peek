# 実装ステップ

## Phase 1: プロジェクト基盤

### Step 1.1: TypeScript設定・依存関係インストール

- `tsconfig.json` を作成
  - `target: "ES2022"`, `module: "Node16"`, `moduleResolution: "Node16"`
  - `strict: true`
  - `jsx: "react-jsx"`, `jsxImportSource: "hono/jsx"`（Hono JSXコンポーネント用）
  - ※ビルドはtsdownが担当するため、`outDir`/`rootDir`は不要（エディタの型チェック用）
- `tsdown.config.ts` を作成
  ```typescript
  import { defineConfig } from "tsdown";

  export default defineConfig({
    entry: "src/index.ts",
    outDir: "dist",
    format: "esm",
    clean: true,
    loader: { ".css": "text" },
    banner: "#!/usr/bin/env node\n",
  });
  ```
- 依存関係をインストール
  - 本体: `hono`, `@hono/node-server`, `md4w`, `gunshi`, `@clack/prompts`, `picocolors`
  - 開発: `typescript`, `@types/node`, `tsdown`, `tsx`, `tailwindcss`, `postcss`, `postcss-cli`, `@tailwindcss/postcss`
  - 注: `@hono/node-server` はoverviewの技術スタックに明記されていないが、HonoをNode.jsで動作させるために必須
  - 注: TailwindCSS v4はPostCSS経由（`@tailwindcss/postcss`）で実行し、`postcss.config.mjs` で設定
- TailwindCSS v4のセットアップ（PostCSS経由）
  - `postcss.config.mjs` を作成（`@tailwindcss/postcss` プラグインを設定）
  - `src/styles/input.css` を作成（`@import "tailwindcss"`）
  - TailwindCSS v4はデフォルトでプロジェクト内のファイルを自動スキャンするため、`@source` ディレクティブは不要
  - `.gitignore` に `src/styles/output.css` を追加
- 開発時のCSS importのためのNode.jsローダーを作成
  - `src/loaders/css.mjs` — `node:module` の `register()` でCSSファイルをテキストとしてインポートするカスタムローダー
- `package.json` に scripts を追加
  - `"dev": "postcss src/styles/input.css -o src/styles/output.css --watch & tsx --import ./src/loaders/css.mjs src/index.ts"`
  - `"build:css": "postcss src/styles/input.css -o src/styles/output.css --env production"`
  - `"build": "pnpm build:css && tsdown"`
  - `"start": "node dist/index.js"`
- `package.json` に `type: "module"` を追加（ESMファースト）
- `src/` ディレクトリ作成

### Step 1.2: CLIエントリーポイント

- `src/index.ts` を実装
  - gunshiでコマンド定義（name, args, description）
  - positionalでパスを受け取る
  - `--port` オプション
  - `--host` オプション（デフォルト: `localhost`、`0.0.0.0` で外部アクセス許可）
  - `--css` オプション（カスタムCSSファイルのパス指定）
  - `--no-open` オプション（ブラウザ自動オープン無効化）
  - `@clack/prompts` の `intro()` でツール名表示
  - パスの存在チェック・ファイル/ディレクトリ判定（エラー時は `cancel()` で終了）
  - `spinner()` を表示しながらmd4w WASM初期化・サーバー起動
  - サーバー起動後、デフォルトブラウザでURLを自動オープン（`--no-open` 時はスキップ）
  - `outro()` で起動完了メッセージ表示
  - 注: パス省略時はカレントディレクトリをディレクトリモードで起動（overviewには明記されていない拡張仕様）

## Phase 2: コアサーバー

### Step 2.1: Markdownレンダラー

- `src/markdown/renderer.ts` を実装
  - md4wの初期化（`await init()`）
  - `renderMarkdown(content: string): string` 関数
  - parseFlags: `["DEFAULT", "LATEX_MATH_SPANS"]`

### Step 2.2: カスタムCSS解決

- `src/styles/content.css` を作成
  - GitHub風のMarkdownコンテンツ用CSSを定義
  - `.markdown-body` クラスに対するスタイル定義
- `src/config/styles.ts` を実装
  - `resolveStyles(cssOption?: string): Promise<ResolvedStyles>` 関数
  - `ResolvedStyles` 型: `{ tailwindCss: string; contentCss: string; }`
  - `tailwindCss` は常に `src/styles/output.css` から読み込み（カスタマイズ不可）
  - `contentCss` の優先順位: CLI `--css` > XDG Config Home > ビルトインデフォルト（`content.css`）
  - カスタムCSSが見つかった場合、ビルトインのコンテンツCSSを**置換**する（追加ではない）
  - XDG解決ロジック:
    - `process.env.XDG_CONFIG_HOME` があればそれを使用
    - なければ `~/.config` にフォールバック
    - 探索パス: `<xdg_config_home>/peek/style.css`
    - ファイルが存在しなければ無視してデフォルトへ
  - `--css` で存在しないパスが指定された場合はエラー終了

### Step 2.3: JSXコンポーネント・テンプレート

- `tsconfig.json` にJSX設定を追加
  - `jsx: "react-jsx"`, `jsxImportSource: "hono/jsx"`
- `src/components/layout.tsx` を実装（Documentコンポーネント）
  - 共通HTMLシェル（DOCTYPE, html, head, body）
  - `raw()`（`hono/html`）でDOCTYPE出力、CSS/JSインライン埋め込み
  - `ResolvedStyles` を受け取り、TailwindCSS → コンテンツCSS の順でインライン埋め込み
  - `getClientScript()` を呼び出してクライアントJSをインライン埋め込み
- `src/components/file-tree.tsx` を実装
  - `FileTreeItems` — `<li>`のリストをFragment内で再帰レンダリング（APIからも使用）
  - `FileTree` — `<ul id="file-tree">` + `FileTreeItems`（ページ内で使用）
  - HTMLエスケープはJSXが自動処理、HTMLエンティティは`raw()`で出力
- `src/components/pages.tsx` を実装
  - `FilePreviewPage` — 単一ファイルプレビュー（Document + header + markdown content）
  - `DirectoryListPage` — ディレクトリ一覧（Document + header + FileTree）
  - `DirectoryViewPage` — サイドバー+プレビュー（Document + sidebar + header + markdown content）
  - Markdown HTMLは `raw()` で挿入
- `src/templates/client-script.ts` を実装
  - サイドバー開閉ロジック
  - ファイルツリーのディレクトリ開閉ロジック
  - ※SSE関連ロジックはPhase 4で追加する（この時点ではUI操作のみ）

### Step 2.4: Webサーバー・ルーティング

- `src/server.ts` を実装
  - Honoアプリ作成
  - `@hono/node-server` でサーバー起動
  - ファイルモード/ディレクトリモードの分岐
- `src/routes/file.tsx` を実装
  - `GET /` → Markdownファイルを読み込み・レンダリング・`FilePreviewPage` JSXを `c.html()` で返却
- `src/routes/api.tsx` を実装
  - `GET /api/content?path=<relative>` → Markdown HTMLを返却
  - `GET /api/tree` → ファイルツリーJSONを返却
  - `GET /api/tree-html?currentPath=<relative>` → `FileTreeItems` JSXを `c.html()` で返却（SSEからのツリー更新用）

## Phase 3: ディレクトリモード

### Step 3.1: ファイルツリー生成

- `src/utils/file-tree.ts` を実装
  - ディレクトリ再帰スキャン
  - `.git`, `node_modules` 等を除外
  - Markdownファイルのみフィルタ
  - `FileTreeNode` 型に整形
  - アルファベット順ソート（ディレクトリ優先）
- `src/utils/file-tree-cache.ts` を実装
  - ファイルツリーのキャッシュレイヤー
  - `get()` でキャッシュヒット時はそのまま返却、ミス時に `buildFileTree` を呼び出し
  - `invalidate()` でキャッシュを無効化（ファイル変更時に呼び出し）

### Step 3.2: ディレクトリモードルーティング

- `src/routes/directory.tsx` を実装
  - `GET /` → `DirectoryListPage` JSXを `c.html()` で返却
  - `GET /view?path=<relative>` → `DirectoryViewPage` JSXを `c.html()` で返却

## Phase 4: リアルタイム更新

### Step 4.1: ファイル監視

- `src/watcher/index.ts` を実装
  - `node:fs` の `watch` API使用
  - ファイル変更コールバック登録
  - ファイルモード: 単一ファイル監視
  - ディレクトリモード: 再帰監視
  - debounce処理（短時間の連続変更をまとめる）

### Step 4.2: SSEエンドポイント

- `src/routes/sse.ts` を実装
  - Honoの `streamSSE` を使用
  - ファイル変更イベントを接続クライアントに配信
  - `event: file-changed`, `data: {}` 形式（ファイルモード）
  - `event: file-changed`, `data: { path }` 形式（ディレクトリモード・変更ファイルの相対パスを含む）
  - `event: tree-changed`, `data: {}` 形式（ディレクトリモードでファイルツリー更新通知）
  - keep-alive用にコメント行を定期送信

### Step 4.3: クライアント更新ロジック

- `src/templates/client-script.ts` を更新
  - `EventSource` でSSE接続
  - `file-changed` イベント受信時に `/api/content` をfetch
  - `tree-changed` イベント受信時に `/api/tree-html` をfetchしてツリーDOMを更新
  - レンダリング済みHTMLでDOM更新

## Phase 5: 仕上げ

### Step 5.1: CLI体験の向上

- 起動時にURL表示（picocolorsで色付き）
- Ctrl+C（SIGINT）でのグレースフルシャットダウン
  1. SSE接続を全てクローズ
  2. ファイルウォッチャーを停止
  3. Honoサーバーをシャットダウン
  4. `@clack/prompts` の `outro()` で終了メッセージを表示
- エラーメッセージの整備（`@clack/prompts` の `cancel()` で統一的に表示）

### Step 5.2: ビルド・配布設定

- `package.json` の `bin` フィールド設定
  - `"bin": { "peek": "./dist/index.js" }`
- tsdownが `banner` オプションでshebangを自動付与するため、手動でのshebang追加は不要
- tsdownがビルド時に自動で実行権限を付与するため、手動での `chmod +x` は不要
- `package.json` の `files` フィールドに `"dist"` を追加（npm publish用）

## Phase 6: テスト

### Step 6.1: テスト基盤セットアップ

- テストフレームワーク: `vitest` をインストール
- `vitest.config.ts` を作成
- `package.json` に `"test": "vitest run"`, `"test:watch": "vitest"` を追加

### Step 6.2: ユニットテスト

- `src/config/styles.test.ts`
  - `--css` 指定時に指定ファイルの内容がコンテンツCSSとして返されるか
  - XDG Config Homeにファイルがある場合に正しく読み込まれるか
  - どちらもない場合にビルトインデフォルトが返されるか
  - `--css` に存在しないパスを指定した場合にエラーになるか
  - `--css` が XDG Config Home より優先されるか
- `src/markdown/renderer.test.ts`
  - 基本的なMarkdown（見出し、リスト、コードブロック等）が正しくHTMLに変換されるか
  - 空文字列・不正入力のハンドリング
- `src/utils/file-tree.test.ts`
  - ディレクトリスキャンで正しいツリー構造が生成されるか
  - `.git`, `node_modules` が除外されるか
  - `.md` ファイルのみがフィルタされるか
  - アルファベット順ソート（ディレクトリ優先）が正しいか

### Step 6.3: 統合テスト

- `src/routes/file.test.ts`
  - `GET /` でJSXコンポーネントからレンダリングされたHTMLが返るか（`.toContain()`で検証）
- `src/routes/api.test.ts`
  - `GET /api/content?path=...` で正しいHTMLが返るか
  - `GET /api/tree` で正しいツリーJSONが返るか
  - `GET /api/tree-html` で`FileTreeItems` JSXからレンダリングされたHTMLが返るか
  - 存在しないパスへのリクエストでエラーレスポンスが返るか
- `src/routes/sse.test.ts`
  - SSEエンドポイントが正しい `Content-Type` を返すか
  - クライアント管理（追加・削除・closeAll）が正しく動作するか
  - broadcastが全クライアントにイベント送信するか
- `src/routes/directory.test.ts`
  - `GET /` でJSXコンポーネントからレンダリングされたファイルツリー画面が返るか
  - `GET /view?path=...` でJSXコンポーネントからレンダリングされたサイドバー付きプレビュー画面が返るか
- `src/watcher/index.test.ts`
  - debounce処理が正しく動作するか
  - close後のイベントが無視されるか
  - close後のwatch登録が無視されるか

## 実装順序の理由

1. **Phase 1** → 基盤がないと何も始まらない
2. **Phase 2** → 最小限の動作（ファイルモード）を最速で実現
3. **Phase 3** → ディレクトリモードを追加して主要機能をカバー
4. **Phase 4** → リアルタイム更新でUXを向上
5. **Phase 5** → 配布に向けた仕上げ
6. **Phase 6** → テストで品質を担保

各Phaseの完了時点で動作確認可能な状態にする。
