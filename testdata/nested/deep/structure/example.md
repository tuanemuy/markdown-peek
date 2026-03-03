# Deeply Nested File

This file is located at `testdata/nested/deep/structure/example.md`.

It tests that the file tree and navigation work correctly with deeply nested directory structures.

## Navigation Test

- [Go to root README](../../../README.md)
- [Go to parent directory](../)
- [Relative link to edge cases](../../../edge-cases/special-chars.md)

## Breadcrumb Test

The breadcrumb should show:

```
testdata > nested > deep > structure > example.md
```

## Content

This file has minimal content because its purpose is to test directory structure handling, not Markdown rendering.

### Some Basic Content

Just to make sure rendering works at this depth:

- **Bold text**
- *Italic text*
- `Inline code`

```python
print("Hello from a deeply nested file!")
```

| Depth | Directory |
|-------|-----------|
| 1 | testdata |
| 2 | nested |
| 3 | deep |
| 4 | structure |
