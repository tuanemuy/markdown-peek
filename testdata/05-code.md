# Code

## Inline Code

Use the `console.log()` function to debug.

Inline code with backtick: `` `backtick` ``

## Fenced Code Blocks

### JavaScript

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Arrow function
const greet = (name) => `Hello, ${name}!`;

// Async/Await
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Class
class EventEmitter {
  #listeners = new Map();

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push(callback);
  }
}
```

### TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function parseUser(input: unknown): Result<User> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: new Error("Invalid input") };
  }
  return { ok: true, value: input as User };
}

const users: ReadonlyArray<User> = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
];
```

### Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False

def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

# List comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ["hello", "world", "python"]}
```

### Rust

```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Config {
    settings: HashMap<String, String>,
}

impl Config {
    fn new() -> Self {
        Config {
            settings: HashMap::new(),
        }
    }

    fn get(&self, key: &str) -> Option<&String> {
        self.settings.get(key)
    }
}

fn main() {
    let mut config = Config::new();
    config.settings.insert("key".to_string(), "value".to_string());
    println!("{:?}", config);
}
```

### Go

```go
package main

import (
	"fmt"
	"sync"
)

type SafeCounter struct {
	mu sync.Mutex
	v  map[string]int
}

func (c *SafeCounter) Inc(key string) {
	c.mu.Lock()
	c.v[key]++
	c.mu.Unlock()
}

func main() {
	c := SafeCounter{v: make(map[string]int)}
	c.Inc("somekey")
	fmt.Println(c.v)
}
```

### SQL

```sql
SELECT
    u.id,
    u.name,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 10;
```

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example</title>
</head>
<body>
  <div id="app">
    <h1>Hello World</h1>
    <p class="description">This is a paragraph.</p>
  </div>
</body>
</html>
```

### CSS

```css
:root {
  --primary: #3b82f6;
  --spacing: 1rem;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing);
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a2e;
    color: #eee;
  }
}
```

### Shell / Bash

```bash
#!/bin/bash
set -euo pipefail

# Function
greet() {
  local name="${1:-World}"
  echo "Hello, ${name}!"
}

# Loop with array
fruits=("apple" "banana" "cherry")
for fruit in "${fruits[@]}"; do
  echo "Fruit: ${fruit}"
done

# Pipe chain
find . -name "*.md" -type f | sort | head -20
```

### JSON

```json
{
  "name": "markdown-peek",
  "version": "1.0.0",
  "dependencies": {
    "hono": "^4.0.0"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsdown"
  }
}
```

### YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
        - name: app
          image: my-app:latest
          ports:
            - containerPort: 8080
```

### Diff

```diff
--- a/file.txt
+++ b/file.txt
@@ -1,4 +1,5 @@
 unchanged line
-removed line
+added line
+another added line
 unchanged line
 unchanged line
```

### No Language Specified

```
This is a code block without a language identifier.
It should be rendered as plain text.
    Indentation is preserved.
```

## Indented Code Block

    This is an indented code block.
    It uses 4 spaces of indentation.
    No syntax highlighting is applied.

## Code Block with Very Long Lines

```
This is a very long line that should test horizontal scrolling behavior in the code block renderer. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

## Code Block with Special Characters

```html
<div class="test" data-value="a&b">
  <p>Less than: &lt; Greater than: &gt;</p>
  <script>alert("XSS test: <script>evil()</script>")</script>
</div>
```

## Code Block with Empty Lines

```python
def function_with_gaps():

    x = 1


    y = 2



    return x + y
```
