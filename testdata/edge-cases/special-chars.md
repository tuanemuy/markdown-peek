# Special Characters & Edge Cases

## HTML Entities

&amp; &lt; &gt; &quot; &apos; &copy; &reg; &trade;

## Unicode Characters

### Currency Symbols
$ € £ ¥ ₹ ₩ ₽ ₿

### Arrows
← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓

### Mathematical Symbols
± × ÷ ≠ ≤ ≥ ≈ ∞ ∑ ∏ √ ∫ ∂ ∆ ∇

### Box Drawing
┌─────────┐
│  Box    │
│ Drawing │
└─────────┘

### Miscellaneous
★ ☆ ♠ ♣ ♥ ♦ ♩ ♪ ♫ ♬ ☀ ☁ ☂ ☃

## Emoji

### Faces
😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊

### Flags
🇺🇸 🇯🇵 🇬🇧 🇩🇪 🇫🇷 🇨🇳 🇰🇷 🇧🇷

### Complex Emoji (ZWJ Sequences)
👨‍👩‍👧‍👦 👩‍💻 🏳️‍🌈 👨‍🦽

## Escaping Edge Cases

\*literal asterisks\*

\`literal backtick\`

\[literal brackets\]

\\literal backslash\\

\#literal hash

1\. not a list

\- not a list either

## Characters That Look Like Markdown

* * * (three asterisks with spaces = horizontal rule)

---

\* \* \* (escaped = literal)

## Zero-Width Characters

Zero​Width​Joiner (contains ZWJ U+200D between words)

Zero‌Width‌Non‌Joiner (contains ZWNJ U+200C between words)

## RTL Text

مرحبا بالعالم (Arabic: Hello World)

שלום עולם (Hebrew: Hello World)

## Mixed Script Directions

This is English مع نص عربي mixed together.

## Combining Characters

é (e + combining acute accent: U+0065 U+0301)

ñ (n + combining tilde: U+006E U+0303)

## Control Characters

Tab:	(tab character)

Null character should be stripped: (nothing visible here)
