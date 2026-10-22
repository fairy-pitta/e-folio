import { describe, it, expect } from 'vitest'
import { findForbidden } from './public-safety'

describe('findForbidden', () => {
  it('test_find_forbidden_in_clean_text_returns_empty', () => {
    expect(findForbidden('Software engineer and project manager in Singapore.')).toEqual([])
  })

  it.each([
    ['WAO Singapore', 'employer name (WAO)'],
    ['part of wao tech', 'employer name (WAO)'],
    ['+65 8851', 'phone number'],
    ['shuna120700@gmail.com', 'email address'],
    ['<a href="mailto:someone@example.com">', 'mailto link'],
    ['OCR-VFS — Visual Fidelity Scorer', 'removed project (OCR-VFS)'],
    ['/projects/OcrVfs/', 'removed project (OCR-VFS)'],
    ['https://github.com/fairy-pitta/ocr-vfs', 'removed project (OCR-VFS)'],
    ['Haseko', 'client name (Haseko)'],
  ])('test_find_forbidden_in_%s_returns_its_label', (text, label) => {
    expect(findForbidden(text)).toContain(label)
  })

  it('test_find_forbidden_called_twice_on_same_text_returns_same_labels', () => {
    // Guards against a /g flag sneaking in: RegExp.test with /g keeps state between calls.
    const text = 'WAO and OCR-VFS'
    expect(findForbidden(text)).toEqual(findForbidden(text))
  })
})
