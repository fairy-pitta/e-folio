// Strings that must never reach the published site. The source data is checked
// in vitest, and the built dist/ is checked after every build by
// tests/dist/published-output.test.ts, which `pnpm build` runs.
//
// Two kinds of check:
//
// - Generic patterns live here: any email address, Singapore phone numbers,
//   mailto: links and the OCR-VFS project that was withdrawn. They name no
//   private fact, so they can sit in a public repository.
// - Specific private terms (employer, clients, address, visa status, figures
//   from the PDF CV) must not be written in this repository at all, because
//   the repository is public too. They are read at test time from a gitignored
//   `.private-terms.txt` at the repo root (one term per line, `#` comments) and
//   from the `PRIVATE_TERMS` environment variable (comma-separated). With
//   neither, that check is skipped with a console note, so a CI build without
//   the list still passes.
//
// Every pattern is bounded so that content hashes in Astro file names
// (page.xAB12y.js) cannot trigger it. No /g flag on any pattern: RegExp.test
// with /g keeps state between calls.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export interface ForbiddenPattern {
  label: string
  pattern: RegExp
}

// Addresses that are public by nature and appear in published text: the git
// SSH user in a blog post and the reserved example domains.
const ALLOWED_EMAIL = /^(git@github\.com|[^@]+@example\.(com|org|net))$/i
const EMAIL = /(?<![\w.%+-])[\w.%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?![\w-])/gi

function containsPrivateEmail(text: string): boolean {
  return [...text.matchAll(EMAIL)].some(([address]) => !ALLOWED_EMAIL.test(address))
}

export const GENERIC_FORBIDDEN: ForbiddenPattern[] = [
  // +65 followed by an 8-digit number starting with 3, 6, 8 or 9.
  { label: 'phone number (+65)', pattern: /\+65[\s-]?[3689]\d{3}[\s-]?\d{4}(?![\w])/ },
  // A local number written as two groups of four (8123 4567, 6123-4567).
  // Unseparated 8-digit runs are left to the private list: minified JS is full
  // of them (86400000 ms in a day).
  { label: 'phone number (8 digits)', pattern: /(?<![\w.:/-])[3689]\d{3}[\s-]\d{4}(?![\w.-])/ },
  { label: 'mailto link', pattern: /mailto:/i },
  { label: 'removed project (OCR-VFS)', pattern: /ocr-?vfs/i },
]

const PRIVATE_TERMS_FILE = fileURLToPath(new URL('../../.private-terms.txt', import.meta.url))

export function parsePrivateTerms(fileText: string, envValue = ''): string[] {
  const fromFile = fileText.split(/\r?\n/)
  const fromEnv = envValue.split(',')
  const terms = [...fromFile, ...fromEnv].map((term) => term.trim()).filter((term) => term && !term.startsWith('#'))
  return [...new Set(terms)]
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Matched case-insensitively and only where the term is not glued to other
// letters or digits, so "ACME" matches "ACME Holdings" but not "xACMEy".
// Whitespace inside a term matches any run of whitespace.
export function privateTermPatterns(terms: string[]): ForbiddenPattern[] {
  return terms.map((term, index) => ({
    label: `private term #${index + 1}`,
    pattern: new RegExp(
      `(?<![A-Za-z0-9])${escapeRegExp(term).replace(/\s+/g, '\\s+')}(?![A-Za-z0-9])`,
      'i',
    ),
  }))
}

let cachedPrivatePatterns: ForbiddenPattern[] | undefined

function loadPrivatePatterns(): ForbiddenPattern[] {
  if (cachedPrivatePatterns) return cachedPrivatePatterns
  const fileText = existsSync(PRIVATE_TERMS_FILE) ? readFileSync(PRIVATE_TERMS_FILE, 'utf8') : ''
  const terms = parsePrivateTerms(fileText, process.env.PRIVATE_TERMS ?? '')
  if (terms.length === 0) {
    console.warn(
      'public-safety: no .private-terms.txt and no PRIVATE_TERMS; skipping the private-term check (generic checks still run).',
    )
  }
  cachedPrivatePatterns = privateTermPatterns(terms)
  return cachedPrivatePatterns
}

// Labels for private terms are numbered, never the term itself, so a failing
// test does not print the secret into CI logs.
export function findForbidden(text: string, privatePatterns: ForbiddenPattern[] = loadPrivatePatterns()): string[] {
  const labels = [...GENERIC_FORBIDDEN, ...privatePatterns]
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => label)
  return containsPrivateEmail(text) ? ['email address', ...labels] : labels
}
