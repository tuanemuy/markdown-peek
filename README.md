# markdown-peek

Markdown preview CLI with live reload. Spins up a local web server and renders Markdown files in the browser with real-time updates via Server-Sent Events.

## Features

- **Live reload** - Automatically refreshes the browser when you save a file
- **Directory browsing** - Specify a directory to browse and preview Markdown files from a file tree
- **Custom CSS** - Customize styles via `--css` flag or `~/.config/peek/style.css`
- **Dark / Light theme** - Built-in theme toggle

## Requirements

- Node.js >= 22.0.0

## Install

```bash
npm install -g @maku/peek
```

## Usage

```bash
# Preview a single file
peek README.md

# Browse a directory
peek docs/

# Preview current directory
peek

# Specify port and host
peek . --port 8080 --host 0.0.0.0

# Use custom CSS
peek README.md --css ./custom.css

# Disable auto-open browser
peek README.md --no-open
```

## Options

| Option | Short | Default | Description |
|---|---|---|---|
| `path` | - | `.` | File or directory path to preview |
| `--port` | `-p` | `3000` | Server port |
| `--host` | `-H` | `localhost` | Bind hostname (`0.0.0.0` for external access) |
| `--css` | `-c` | - | Path to a custom CSS file |
| `--open` / `--no-open` | - | `true` | Auto-open browser on start |

## Custom CSS

Content styles can be customized in three ways (in priority order):

1. **`--css` flag** - Pass a CSS file path directly
2. **XDG config** - Place a `style.css` at `$XDG_CONFIG_HOME/peek/style.css` or `~/.config/peek/style.css`
3. **Built-in styles** - GitHub-flavored Markdown styles (default)

Custom CSS only affects the `.markdown-body` content area, not the layout chrome.

You can override design tokens (CSS custom properties) for full theme customization. See [`docs/design-token-example.css`](docs/design-token-example.css) for reference.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Lint and format
pnpm lint:fix
pnpm format

# Type check
pnpm typecheck

# Build for production
pnpm build
```

## Tech Stack

- [Hono](https://hono.dev/) - Web framework (routing, JSX SSR)
- [md4w](https://github.com/nicolo-ribaudo/md4w) - WASM-based Markdown renderer
- [gunshi](https://github.com/poppinss/gunshi) - CLI framework
- [TailwindCSS v4](https://tailwindcss.com/) - Styling
- [@clack/prompts](https://github.com/bombshell-dev/clack) - Terminal UI

## License

ISC
