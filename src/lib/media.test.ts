import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { mediaKind, posterFor, resolveMedia } from './media'

let root: string

beforeAll(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'media-test-'))
  await fs.mkdir(path.join(root, 'shots'), { recursive: true })
  const blank = sharp({ create: { width: 320, height: 180, channels: 3, background: '#000' } })
  await blank.clone().webp().toFile(path.join(root, 'shots', 'still.webp'))
  await blank.clone().webp().toFile(path.join(root, 'shots', 'clip.poster.webp'))
  await fs.writeFile(path.join(root, 'shots', 'clip.mp4'), 'not really a video')
})

afterAll(async () => {
  await fs.rm(root, { recursive: true, force: true })
})

describe('mediaKind', () => {
  it('test_classify_webp_path_returns_image', () => {
    expect(mediaKind('/shots/still.webp')).toBe('image')
  })

  it('test_classify_mp4_path_returns_video', () => {
    expect(mediaKind('/shots/clip.mp4')).toBe('video')
  })

  it('test_classify_uppercase_extension_returns_video', () => {
    expect(mediaKind('/shots/CLIP.MP4')).toBe('video')
  })
})

describe('posterFor', () => {
  it('test_derive_poster_from_mp4_returns_sibling_webp', () => {
    expect(posterFor('/shots/clip.mp4')).toBe('/shots/clip.poster.webp')
  })
})

describe('resolveMedia', () => {
  it('test_resolve_existing_image_returns_intrinsic_size', async () => {
    const media = await resolveMedia('/shots/still.webp', root)
    expect(media).toMatchObject({ kind: 'image', width: 320, height: 180 })
  })

  it('test_resolve_video_returns_poster_and_poster_size', async () => {
    const media = await resolveMedia('/shots/clip.mp4', root)
    expect(media).toMatchObject({
      kind: 'video',
      poster: '/shots/clip.poster.webp',
      width: 320,
      height: 180,
    })
  })

  it('test_resolve_missing_file_returns_no_dimensions', async () => {
    const media = await resolveMedia('/shots/gone.webp', root)
    expect(media).toEqual({ src: '/shots/gone.webp', kind: 'image' })
  })

  it('test_resolve_remote_url_returns_no_dimensions', async () => {
    const media = await resolveMedia('https://example.com/a.webp', root)
    expect(media).toEqual({ src: 'https://example.com/a.webp', kind: 'image' })
  })

  it('test_resolve_path_escaping_root_returns_no_dimensions', async () => {
    const media = await resolveMedia('/../package.json', root)
    expect(media.width).toBeUndefined()
  })
})
