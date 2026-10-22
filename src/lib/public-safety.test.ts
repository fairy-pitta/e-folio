import { describe, it, expect } from 'vitest'
import { findForbidden, parsePrivateTerms, privateTermPatterns } from './public-safety'

// Fake private terms. The real list lives outside git (.private-terms.txt /
// PRIVATE_TERMS) and must never be written into this repository.
const FAKE = privateTermPatterns(['ACME Holdings', 'Globex', '000000', '(XP'])

describe('findForbidden (generic patterns)', () => {
  it('test_find_forbidden_in_clean_text_returns_empty', () => {
    expect(findForbidden('Software engineer and project manager in Singapore.', [])).toEqual([])
  })

  it.each([
    ['+65 9123 4567', 'phone number (+65)'],
    ['+6591234567', 'phone number (+65)'],
    ['call 9123 4567 today', 'phone number (8 digits)'],
    ['6123-4567', 'phone number (8 digits)'],
    ['someone@private-mail.test.com', 'email address'],
    ['<a href="mailto:someone@example.com">', 'mailto link'],
    ['OCR-VFS — Visual Fidelity Scorer', 'removed project (OCR-VFS)'],
    ['/projects/OcrVfs/', 'removed project (OCR-VFS)'],
    ['https://github.com/fairy-pitta/ocr-vfs', 'removed project (OCR-VFS)'],
  ])('test_find_forbidden_in_%s_returns_its_label', (text, label) => {
    expect(findForbidden(text, [])).toContain(label)
  })

  it.each([
    'page.xAB12y.js',
    'chunk.a9123b.js',
    'const DAY = 86400000',
    'git clone git@github.com:fairy-pitta/e-folio.git',
    'ada@example.com',
    'react@18.3.1',
    'Published 2026-10-22',
  ])('test_find_forbidden_with_harmless_text_returns_no_match_%s', (text) => {
    expect(findForbidden(text, [])).toEqual([])
  })

  it('test_find_forbidden_called_twice_on_same_text_returns_same_labels', () => {
    // Guards against a /g flag sneaking in: RegExp.test with /g keeps state between calls.
    const text = 'mailto: and OCR-VFS and a@b.co'
    expect(findForbidden(text, [])).toEqual(findForbidden(text, []))
  })
})

describe('findForbidden (private terms)', () => {
  it.each([
    'Worked at ACME Holdings',
    'acme   holdings',
    'client: GLOBEX',
    'postal code 000000',
    'visa (XP)',
  ])('test_find_forbidden_with_private_term_in_%s_returns_a_numbered_label', (text) => {
    const labels = findForbidden(text, FAKE)
    expect(labels.some((label) => label.startsWith('private term #'))).toBe(true)
  })

  it.each(['xGlobexy.js', 'chunk.a000000b.js', 'ACMEHoldings'])(
    'test_find_forbidden_with_term_glued_to_other_characters_returns_no_match_%s',
    (text) => {
      expect(findForbidden(text, FAKE)).toEqual([])
    },
  )

  it('test_find_forbidden_with_private_term_does_not_print_the_term_in_its_label', () => {
    expect(findForbidden('Globex', FAKE).join(' ')).not.toMatch(/globex/i)
  })
})

describe('parsePrivateTerms', () => {
  it('test_parse_private_terms_from_file_and_env_returns_trimmed_unique_terms', () => {
    const file = '# comment\nACME Holdings\n\n  Globex  \n'
    expect(parsePrivateTerms(file, 'Globex, Initech ,')).toEqual(['ACME Holdings', 'Globex', 'Initech'])
  })

  it('test_parse_private_terms_with_nothing_returns_empty', () => {
    expect(parsePrivateTerms('', '')).toEqual([])
  })
})
