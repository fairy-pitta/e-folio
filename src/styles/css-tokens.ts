// Small readers for the token sheets, shared by the tests that check colours.

// The body of the first block whose opener matches, braces balanced.
export function block(source: string, opener: RegExp): string {
  const match = opener.exec(source)
  if (!match) throw new Error(`block not found: ${opener}`)
  const start = match.index + match[0].length
  let depth = 1
  let i = start
  while (i < source.length && depth > 0) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') depth--
    i++
  }
  return source.slice(start, i - 1)
}

// A hex colour custom property, such as variable(css, 'bg') for --bg.
export function variable(source: string, name: string): string {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`).exec(source)
  if (!m) throw new Error(`variable not found: ${name}`)
  return m[1]
}

// The light theme: the first plain :root block.
export function lightTheme(tokens: string): string {
  return block(tokens, /^:root\s*\{/m)
}
