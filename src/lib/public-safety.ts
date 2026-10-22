// Strings that must never reach the published site: the employer's name and
// the phone number and email address that appear on the PDF CV, client names,
// and the OCR-VFS project that was withdrawn. The source data is checked in
// vitest, and the built dist/ is checked after every build by
// tests/dist/published-output.test.ts, which `pnpm build` runs.
//
// No /g flag on any pattern: RegExp.test with /g keeps state between calls.

export interface ForbiddenPattern {
  label: string
  pattern: RegExp
}

export const FORBIDDEN: ForbiddenPattern[] = [
  { label: "employer name (WAO)", pattern: /wao/i },
  { label: "phone number", pattern: /8851/ },
  { label: "email address", pattern: /shuna120700/i },
  { label: "mailto link", pattern: /mailto:/i },
  { label: "removed project (OCR-VFS)", pattern: /ocr-?vfs/i },
  { label: "client name (Haseko)", pattern: /haseko/i },
  { label: "client name (Hasegawa)", pattern: /hasegawa/i },
  { label: "client name (Forval)", pattern: /forval/i },
  { label: "client name (Crossgear)", pattern: /crossgear/i },
]

export function findForbidden(text: string): string[] {
  return FORBIDDEN.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label)
}
