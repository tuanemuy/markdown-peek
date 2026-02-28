# Webサーバーを起動して指定されたMarkdownをレンダリングするCLI

- ファイルを指定して起動すると、ローカルホストでWebサーバーが立ち上がり、ブラウザでMarkdownファイルをレンダリングする
- ディレクトリを指定して起動すると、ファイルツリーが表示され、Markdownファイルを選択して開くことができる
- ファイル閲覧中は起動したディレクトリのファイルツリーを開閉することができる
- Markdownファイルの内容をリアルタイムで監視し、更新する
- 技術スタック
    - TypeScript
    - Node.js
    - Hono
    - md4w
    - gunshi
    - @clack/prompts
    - picocolors
