# 日英混在ドキュメント / Mixed Language Document

## Introduction / はじめに

This document tests how the renderer handles mixed Japanese and English content.
このドキュメントは、日本語と英語が混在したコンテンツの表示をテストします。

## Installation / インストール

Install the package using npm:
npmを使ってパッケージをインストールします：

```bash
npm install -g markdown-peek
```

## Usage / 使い方

### Basic Usage / 基本的な使い方

| Command | 説明 | Example |
|---------|------|---------|
| `peek file.md` | 単一ファイルをプレビュー | `peek README.md` |
| `peek directory/` | ディレクトリをプレビュー | `peek docs/` |
| `peek --port 8080` | ポート指定 | `peek . -p 8080` |

### Advanced Usage / 高度な使い方

> **Note / 注意:** Custom CSS files must be valid CSS.
> カスタムCSSファイルは有効なCSSである必要があります。

```typescript
// Configuration interface / 設定インターフェース
interface Config {
  port: number;      // ポート番号
  host: string;      // ホスト名
  open: boolean;     // ブラウザを開くかどうか
  css?: string;      // カスタムCSSパス（任意）
}
```

## FAQ / よくある質問

**Q: Can I use custom themes? / カスタムテーマは使えますか？**

A: Yes, use the `--css` flag to specify a custom CSS file.
はい、`--css`フラグでカスタムCSSファイルを指定できます。

**Q: Does it support hot reload? / ホットリロードに対応していますか？**

A: Yes, file changes are automatically detected and the browser refreshes.
はい、ファイルの変更は自動的に検出され、ブラウザが更新されます。

## Links / リンク

- [GitHub Repository](https://github.com/example/markdown-peek) - ソースコード
- [npm Package](https://www.npmjs.com/package/markdown-peek) - npmパッケージ
- [Issues / バグ報告](https://github.com/example/markdown-peek/issues)

## Glossary / 用語集

| English | 日本語 | 説明 |
|---------|--------|------|
| Renderer | レンダラー | Markdownをhtmlに変換するモジュール |
| Live reload | ライブリロード | ファイル変更時の自動更新 |
| Syntax highlighting | シンタックスハイライト | コードの色分け表示 |
| File tree | ファイルツリー | ディレクトリ構造の表示 |
| Breadcrumb | パンくずリスト | 現在位置のナビゲーション |
