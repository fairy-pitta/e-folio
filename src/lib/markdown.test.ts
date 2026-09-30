import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { markdownToHtml } from './markdown'

// Stands in for public/, so the sizing and GIF-to-video swap can be exercised
// without depending on the real assets.
let mediaRoot: string

beforeAll(async () => {
  mediaRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'markdown-media-'))
  const blank = sharp({ create: { width: 640, height: 360, channels: 3, background: '#000' } })
  await blank.clone().webp().toFile(path.join(mediaRoot, 'shot.webp'))
  await blank.clone().webp().toFile(path.join(mediaRoot, 'clip.poster.webp'))
  await fs.writeFile(path.join(mediaRoot, 'clip.mp4'), 'not really a video')
})

afterAll(async () => {
  await fs.rm(mediaRoot, { recursive: true, force: true })
})

describe('markdownToHtml', () => {
  it('test_convert_paragraph_returns_html_p_tag', async () => {
    const result = await markdownToHtml('Hello world')
    expect(result).toContain('<p>Hello world</p>')
  })

  it('test_convert_heading_returns_html_h_tags', async () => {
    const result = await markdownToHtml('# Title\n\n## Subtitle')
    expect(result).toContain('<h1>Title</h1>')
    expect(result).toContain('<h2>Subtitle</h2>')
  })

  it('test_convert_bold_returns_strong_tag', async () => {
    const result = await markdownToHtml('**bold text**')
    expect(result).toContain('<strong>bold text</strong>')
  })

  it('test_convert_link_returns_anchor_tag', async () => {
    const result = await markdownToHtml('[click](https://example.com)')
    expect(result).toContain('<a href="https://example.com">click</a>')
  })

  it('test_convert_code_block_returns_highlighted_html', async () => {
    const result = await markdownToHtml('```js\nconst x = 1\n```')
    expect(result).toContain('<code')
    expect(result).toContain('const')
  })

  it('test_convert_gfm_table_returns_html_table', async () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |'
    const result = await markdownToHtml(md)
    expect(result).toContain('<table>')
    expect(result).toContain('<td>1</td>')
  })

  it('test_convert_image_adds_lazy_loading_attributes', async () => {
    const result = await markdownToHtml('![alt](image.png)')
    expect(result).toContain('loading="lazy"')
    expect(result).toContain('decoding="async"')
    expect(result).toContain('fetchpriority="low"')
  })

  it('test_convert_gfm_strikethrough_returns_del_tag', async () => {
    const result = await markdownToHtml('~~deleted~~')
    expect(result).toContain('<del>deleted</del>')
  })

  it('test_convert_empty_string_returns_empty_string', async () => {
    const result = await markdownToHtml('')
    expect(result.trim()).toBe('')
  })

  it('test_convert_local_image_adds_intrinsic_dimensions', async () => {
    const result = await markdownToHtml('![alt](/shot.webp)', mediaRoot)
    expect(result).toContain('width="640"')
    expect(result).toContain('height="360"')
  })

  it('test_convert_mp4_image_syntax_returns_looping_video', async () => {
    const result = await markdownToHtml('![demo](/clip.mp4)', mediaRoot)
    expect(result).toContain('<video')
    expect(result).toContain('src="/clip.mp4"')
    expect(result).toContain('poster="/clip.poster.webp"')
    expect(result).toContain('loop')
    expect(result).toContain('muted')
    expect(result).not.toContain('<img')
  })

  it('test_convert_unordered_list_returns_ul', async () => {
    const result = await markdownToHtml('- item 1\n- item 2')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>item 1</li>')
    expect(result).toContain('<li>item 2</li>')
  })
})
