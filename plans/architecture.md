# アーキテクチャ設計

## 概要

**@maku/peek** — Markdownファイルをブラウザでプレビューするためのローカルサーバーを起動するCLIツール。

## ディレクトリ構成

```
src/
  index.ts              # CLIエントリーポイント（gunshi）
  server.ts             # Honoサーバーの起動・設定
  routes/
    file.tsx            # 単一ファイルプレビュー画面（JSXコンポーネント使用）
    directory.tsx       # ディレクトリ（ファイルツリー）画面（JSXコンポーネント使用）
    api.tsx             # API（ファイル内容取得、ファイルツリー取得、JSXコンポーネント使用）
    sse.ts              # SSEエンドポイント（リアルタイム更新）
  components/
    layout.tsx          # Documentコンポーネント（共通HTMLシェル）
    pages.tsx           # FilePreviewPage, DirectoryListPage, DirectoryViewPage
    file-tree.tsx       # FileTree（<ul>ラッパー）, FileTreeItems（<li>一覧）
  markdown/
    renderer.ts         # md4wラッパー（Markdown → HTML変換）
  watcher/
    index.ts            # ファイル監視（node:fs watch）
  styles/
    input.css           # TailwindCSS入力ファイル（@import "tailwindcss"）
    output.css          # TailwindCSSビルド出力（git管理対象外・ビルド時自動生成）
    content.css         # GitHub風Markdownコンテンツ用CSSのデフォルト定義
  templates/
    client-script.ts    # クライアントサイドJS（UI操作・SSE受信・DOM更新）
  loaders/
    css.mjs             # 開発時のNode.js用CSSローダー（CSSファイルをテキストとしてインポート）
  config/
    styles.ts           # カスタムCSS解決（CLI引数 / XDG Config Home / デフォルト）
  types/
    css.d.ts            # CSSモジュールの型定義
  utils/
    file-tree.ts        # ディレクトリスキャン・ツリー構造生成
    file-tree-cache.ts  # ファイルツリーのキャッシュ（変更時に無効化）
```

## コアフロー

### 1. CLI起動（gunshi）

```
$ peek <path>
```

- `<path>` がファイルの場合 → ファイルモード
- `<path>` がディレクトリの場合 → ディレクトリモード
- `<path>` 省略時 → カレントディレクトリをディレクトリモードで起動（※overviewには明記されていない拡張仕様）

**オプション:**

| オプション | 短縮 | 型 | デフォルト | 説明 |
|-----------|------|------|----------|------|
| `--port`  | `-p` | number | 3000 | サーバーポート |
| `--host`  | `-H` | string | `localhost` | バインドするホスト（`0.0.0.0` で外部アクセス許可） |
| `--css`     | `-c` | string | — | カスタムCSSファイルのパス |
| `--no-open` | | boolean | false | ブラウザ自動オープンを無効化 |

**起動処理（@clack/prompts によるUX）:**
1. `intro()` でツール名・バージョンを表示
2. 引数のパスを解決・検証
3. `spinner()` を表示しながら md4w WASMを初期化
4. Honoサーバーを起動
5. ターミナルにURL表示（picocolors）
6. ファイル監視を開始
7. `outro()` で起動完了メッセージを表示

### 2. Webサーバー（Hono + @hono/node-server）

- `@hono/node-server` の `serve()` に `hostname`（`--host` オプション値）と `port`（`--port` オプション値）を渡す
- デフォルトは `localhost:3000`、`--host 0.0.0.0` で外部ネットワークからのアクセスを許可

**ルーティング:**

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | ファイルモード: プレビュー画面 / ディレクトリモード: ファイルツリー画面 |
| GET | `/view?path=<relative>` | ディレクトリモードでファイルを選択して閲覧 |
| GET | `/api/content?path=<relative>` | Markdown HTMLコンテンツ取得（SSEからの更新用） |
| GET | `/api/tree` | ファイルツリーJSON取得 |
| GET | `/api/tree-html?currentPath=<relative>` | ファイルツリーHTML取得（SSEからのツリー更新用） |
| GET | `/sse` | Server-Sent Eventsエンドポイント |

### 3. カスタムCSS（`src/config/styles.ts`）

ユーザーが独自のCSSを適用できる仕組み。

**CSS解決の優先順位（上が優先）:**

1. **CLI引数** `--css <path>` — 指定されたCSSファイルを読み込む
2. **XDG Config Home** — `$XDG_CONFIG_HOME/peek/style.css` を自動検出（`$XDG_CONFIG_HOME` 未設定時は `~/.config/peek/style.css`）
3. **ビルトインデフォルト** — `src/styles/content.css` のGitHub風CSS

**動作仕様:**

- カスタムCSSが見つかった場合、ビルトインのコンテンツCSSを**置換**する
- レイアウトCSS（サイドバー等のUI構造に関わるスタイル）はカスタムCSSの影響を受けない
  - レイアウトCSSはTailwindCSSのユーティリティクラスで実装（`src/styles/output.css` から読み込み）
  - コンテンツCSS（GitHub風のMarkdownスタイル）は `src/styles/content.css` に定義
  - カスタムCSSはコンテンツCSS部分のみを置換対象とする
- `--css` に存在しないパスが指定された場合はエラーで終了（`@clack/prompts` の `cancel()`）
- XDG設定ファイルが存在しない場合は無視してデフォルトにフォールバック

**CSS解決関数:**

```typescript
type ResolvedStyles = {
  tailwindCss: string;  // TailwindCSS出力（レイアウト用ユーティリティクラス・常にビルトイン）
  contentCss: string;   // Markdownコンテンツ用CSS（カスタマイズ可能）
};

async function resolveStyles(cssOption?: string): Promise<ResolvedStyles>;
```

**テンプレートでの適用順序:**

```html
<style>/* TailwindCSS出力（レイアウト用ユーティリティクラスを含む） */</style>
<style>/* コンテンツCSS（デフォルト or カスタム） */</style>
```

### 4. Markdownレンダリング（md4w）

```typescript
import { init, mdToHtml } from "md4w";

await init();

function renderMarkdown(content: string): string {
  return mdToHtml(content, {
    parseFlags: ["DEFAULT", "LATEX_MATH_SPANS"],
  });
}
```

- GitHub風のCSSを適用
- コードブロックのシンタックスハイライトは初期実装ではスキップ（将来拡張可能）

### 5. リアルタイム更新（SSE + node:fs watch）

**選定理由: SSE vs WebSocket**
- ファイル変更通知はサーバー→クライアントの一方向
- SSEは自動再接続あり・追加パッケージ不要
- WebSocketは双方向通信が不要なためオーバースペック

**フロー:**
1. サーバーが `node:fs` の `watch` でファイル変更を監視
2. 変更検知時、接続中の全SSEクライアントにイベント送信
3. クライアントがイベント受信後、`/api/content` にfetchして最新HTMLを取得
4. DOMを差し替え

**SSEイベント形式:**
```
# ファイルモード（パス情報は含めない）
event: file-changed
data: {}

# ディレクトリモード（変更されたファイルの相対パスを含む）
event: file-changed
data: {"path": "relative/path/to/file.md"}

event: tree-changed
data: {}
```

### 6. ファイルツリー（ディレクトリモード）

**ツリー構造:**
```typescript
type FileTreeNode = {
  name: string;
  path: string; // ルートからの相対パス
  type: "file" | "directory";
  children?: FileTreeNode[];
};
```

- `.git`、`node_modules`、ドットファイルなどはデフォルトで除外
- Markdownファイル（`.md`）のみ表示
- ディレクトリはアルファベット順、ファイルはアルファベット順でソート

### 7. UI構成

**ファイルモード（単一ファイル）:**
```
+------------------------------------------+
|  ファイル名                                |
+------------------------------------------+
|                                          |
|  レンダリングされたMarkdown               |
|                                          |
+------------------------------------------+
```

**ディレクトリモード（ファイル選択前）:**
```
+------------------------------------------+
|  ディレクトリ名                            |
+------------------------------------------+
|                                          |
|  📁 docs/                                |
|    📄 overview.md                        |
|    📄 setup.md                           |
|  📁 guides/                              |
|    📄 getting-started.md                 |
|  📄 README.md                            |
|                                          |
+------------------------------------------+
```

**ディレクトリモード（ファイル閲覧中）:**
```
+------------+-----------------------------+
| ファイルツリー|  ファイル名                   |
|            +-----------------------------+
| 📁 docs/  |                             |
|   📄 a.md |  レンダリングされた             |
|   📄 b.md |  Markdown                   |
| 📄 README |                             |
|            |                             |
+------------+-----------------------------+
```

- サイドバー（ファイルツリー）は開閉可能
- ファイルツリーのディレクトリも開閉可能

## 技術的判断

### HTMLテンプレート戦略
- Hono組み込みのJSXランタイム（`hono/jsx`）でSSRコンポーネントを構築
- `tsconfig.json` に `jsx: "react-jsx"`, `jsxImportSource: "hono/jsx"` を設定
- 共通HTMLシェル（Document）、ページコンポーネント、ファイルツリーコンポーネントに分離
- `raw()`（`hono/html`）でDOCTYPE・HTMLエンティティ・生HTML（Markdown出力/CSS/JS）を埋め込み
- JSXの自動エスケープにより`escapeHtml()`関数は不要
- CSS・JSはインラインで埋め込み（外部ファイル配信の複雑さを避ける）
- クライアントJSは最小限（SSE受信、ツリー開閉、コンテンツ更新）— `templates/client-script.ts` にJS文字列として維持

### TailwindCSS戦略
- **TailwindCSS v4** を使用（CSS-firstの設定方式）
- **PostCSS経由**で `@tailwindcss/postcss` プラグインを使用（`postcss.config.mjs` で設定）
- レイアウトCSS（サイドバー等のUI構造）をTailwindCSSのユーティリティクラスで構築
- コンテンツCSS（GitHub風Markdownスタイル）はTailwindパイプラインとは**分離**し、`src/styles/content.css` にCSSファイルとして定義
- ビルドフロー:
  1. `src/styles/input.css` に `@import "tailwindcss"` を記述（レイアウト用ユーティリティクラスのみ）
  2. TailwindCSS v4がプロジェクト内の `src/components/*.tsx`, `src/routes/*.tsx` を自動スキャン
  3. 出力された `src/styles/output.css` を `src/config/styles.ts` で読み込み、DocumentコンポーネントでHTML内にインライン埋め込み
- 開発時は `postcss --watch` で自動再ビルド
- ビルドコマンド: `postcss src/styles/input.css -o src/styles/output.css --env production`
- `src/styles/output.css` は `.gitignore` に追加（ビルド成果物のため）

### ファイル監視
- `node:fs` の `watch` を使用（追加パッケージ不要）
- ファイルモード: 指定ファイルのみ監視
- ディレクトリモード: 指定ディレクトリを再帰的に監視

### CLI UX（@clack/prompts）
- `intro()` / `outro()` で起動・終了メッセージを装飾
- `spinner()` でWASM初期化やサーバー起動中のローディング表示
- エラー時は `cancel()` で統一的にエラーメッセージを表示して終了
- picocolorsと組み合わせてURL表示やステータス表示を色付きで出力

### ブラウザ自動オープン
- サーバー起動後、デフォルトブラウザでプレビューURLを自動オープン
- `child_process.execFile` で `open`（macOS）/ `xdg-open`（Linux）/ `start`（Windows）を呼び分け
- `--no-open` オプションで無効化可能

### エラーハンドリング
- 存在しないパスが指定された場合 → `@clack/prompts` の `cancel()` でエラー表示して終了
- ファイル読み取りエラー → 画面上にエラー表示
- ポート使用中 → エラーメッセージ表示して終了

### グレースフルシャットダウン
- Ctrl+C（SIGINT）を検知して以下を順次クリーンアップ:
  1. SSE接続を全てクローズ
  2. ファイルウォッチャーを停止
  3. Honoサーバーをシャットダウン
  4. `@clack/prompts` の `outro()` で終了メッセージを表示
