// Turns the originals in assets/media into the web payload in public/.
//
//   assets/media/**/*.{png,jpg,jpeg,webp}  ->  public/**/*.webp
//   assets/media/**/*.gif (animated)       ->  public/**/*.mp4 + *.poster.webp
//   assets/media/**/*.gif (single frame)   ->  public/**/*.webp
//   assets/media/new-favicon*.png          ->  the favicon / PWA / OG icon set
//
// Screenshots are capped at MAX_WIDTH because the content column is 680px, so
// twice that covers a 2x display and everything beyond it is wasted bytes.
// Animated GIFs go to H.264: animated WebP came out larger than the source on
// three of the four demos, video is 65-95% smaller.
//
// Outputs are committed, since Cloudflare Pages has no ffmpeg at build time.
// Re-run with `pnpm media` after adding an original; `--force` re-encodes
// everything instead of skipping outputs that are newer than their source.

import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import sharp from 'sharp'

const run = promisify(execFile)

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'assets', 'media')
const OUTPUT_DIR = path.join(ROOT, 'public')

const MAX_WIDTH = 1360
const WEBP = { quality: 80, effort: 6 }
const VIDEO_CRF = 30
const MAX_FPS = 20

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])
// Masters for the icon set rather than page content, so the generic walk skips them.
const ICON_SOURCES = new Set(['new-favicon.png', 'new-favicon_t.png'])

const force = process.argv.includes('--force')
const report = []

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return walk(full)
      return entry.isFile() ? [full] : []
    })
  )
  return files.flat()
}

async function mtime(file) {
  try {
    return (await fs.stat(file)).mtimeMs
  } catch {
    return -1
  }
}

// An output counts as current when it exists and is not older than its source.
async function isStale(source, ...outputs) {
  if (force) return true
  const sourceTime = await mtime(source)
  const outputTimes = await Promise.all(outputs.map(mtime))
  return outputTimes.some((time) => time < sourceTime)
}

async function sizeOf(file) {
  return (await fs.stat(file)).size
}

async function record(source, outputs) {
  const before = await sizeOf(source)
  const after = (await Promise.all(outputs.map(sizeOf))).reduce((a, b) => a + b, 0)
  report.push({ source: path.relative(ROOT, source), before, after })
}

async function writeImage(source, output) {
  await fs.mkdir(path.dirname(output), { recursive: true })
  await sharp(source)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp(WEBP)
    .toFile(output)
}

async function writeVideo(source, output, poster) {
  await fs.mkdir(path.dirname(output), { recursive: true })
  // trunc(.../2)*2 keeps the width even, which H.264 requires under yuv420p.
  const scale = `scale=trunc(min(${MAX_WIDTH}\\,iw)/2)*2:-2:flags=lanczos`
  await run('ffmpeg', [
    '-y', '-i', source,
    '-vf', `fps=${MAX_FPS},${scale}`,
    '-c:v', 'libx264', '-crf', String(VIDEO_CRF), '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
    output,
  ])
  // The poster paints the first frame while the video loads, and its dimensions
  // are what the page uses to reserve space (sharp cannot read an mp4).
  await sharp(source, { page: 0 })
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp(WEBP)
    .toFile(poster)
}

async function convert(source) {
  const relative = path.relative(SOURCE_DIR, source)
  const extension = path.extname(source).toLowerCase()
  const base = path.join(OUTPUT_DIR, relative.slice(0, -extension.length))

  if (extension === '.gif') {
    const { pages = 1 } = await sharp(source).metadata()
    if (pages > 1) {
      const video = `${base}.mp4`
      const poster = `${base}.poster.webp`
      if (await isStale(source, video, poster)) {
        await writeVideo(source, video, poster)
        await record(source, [video, poster])
      }
      return
    }
  }

  if (extension !== '.gif' && !IMAGE_EXTENSIONS.has(extension)) return

  const output = `${base}.webp`
  if (await isStale(source, output)) {
    await writeImage(source, output)
    await record(source, [output])
  }
}

// The favicon keeps its own master because it is the trimmed, non-square mark.
const ICONS = [
  { master: 'new-favicon_t.png', output: 'favicon-32.png', size: 32 },
  { master: 'new-favicon.png', output: 'apple-icon.png', size: 180 },
  { master: 'new-favicon.png', output: 'web-app-manifest-192x192.png', size: 192 },
  { master: 'new-favicon.png', output: 'web-app-manifest-512x512.png', size: 512 },
  // Social scrapers are unreliable with WebP, so the fallback card stays PNG.
  { master: 'new-favicon.png', output: 'og-default.png', size: 512 },
]

// The mark is essentially two colours, so a small palette costs nothing
// visually and halves the large sizes. Which encoding wins varies with the
// size, so all three run and the smallest output is kept.
const PNG_ENCODINGS = [
  { compressionLevel: 9, palette: true, colors: 128, effort: 10 },
  { compressionLevel: 9, palette: true },
  { compressionLevel: 9, palette: false },
]

async function buildIcons() {
  for (const { master, output, size } of ICONS) {
    const source = path.join(SOURCE_DIR, master)
    const target = path.join(OUTPUT_DIR, output)
    if (!(await isStale(source, target))) continue
    const resized = sharp(source).resize({
      width: size,
      height: size,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    const encoded = await Promise.all(
      PNG_ENCODINGS.map((options) => resized.clone().png(options).toBuffer())
    )
    const smallest = encoded.reduce((a, b) => (b.length < a.length ? b : a))
    await fs.writeFile(target, smallest)
    await record(source, [target])
  }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`

async function main() {
  const sources = (await walk(SOURCE_DIR)).filter(
    (file) => !ICON_SOURCES.has(path.relative(SOURCE_DIR, file))
  )
  for (const source of sources) await convert(source)
  await buildIcons()

  if (report.length === 0) {
    console.log('media: every output is up to date')
    return
  }
  report.sort((a, b) => b.before - b.after - (a.before - a.after))
  for (const { source, before, after } of report) {
    const saved = Math.round(100 - (after / before) * 100)
    console.log(`${kb(before).padStart(7)} -> ${kb(after).padStart(7)}  ${String(-saved).padStart(4)}%  ${source}`)
  }
  const before = report.reduce((sum, r) => sum + r.before, 0)
  const after = report.reduce((sum, r) => sum + r.after, 0)
  console.log(`\n${report.length} files: ${kb(before)} -> ${kb(after)} (${Math.round(100 - (after / before) * 100)}% smaller)`)
}

await main()
