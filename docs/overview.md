# @maku/peek

Webサーバーを起動して指定されたMarkdownをレンダリングするCLI。

- ファイルを指定して起動すると、ローカルホストでWebサーバーが立ち上がり、ブラウザでMarkdownファイルをレンダリングする
- ディレクトリを指定して起動すると、ファイルツリーが表示され、Markdownファイルを選択して開くことができる
- ファイル閲覧中は起動したディレクトリのファイルツリーを開閉することができる
- Markdownファイルの内容をリアルタイムで監視し、更新する
- カスタムCSSに対応
    - `--css` オプションでCSSファイルのパスを指定できる
    - XDG Config Home（`$XDG_CONFIG_HOME/peek/style.css` または `~/.config/peek/style.css`）に配置したCSSを自動検出する
    - カスタムCSSはMarkdownコンテンツ部分のスタイルを上書きする（レイアウトには影響しない）
- 技術スタック
    - TypeScript
    - Node.js
    - Hono
    - md4w
    - gunshi
    - @clack/prompts
    - picocolors
    - TailwindCSS v4
