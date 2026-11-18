// Records a short demo of each live project in a headless Chrome, then encodes
// it the way scripts/optimize-media.mjs encodes GIFs: H.264, at most 20 fps and
// 1360px wide, with a .poster.webp of the first frame.
//
//   node scripts/record-demos.mjs            all demos
//   node scripts/record-demos.mjs birdmap    only the named ones
//
// Uses the installed Google Chrome (playwright-core, channel "chrome"), so no
// browser is downloaded. Outputs go straight to public/ and are committed.

import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const run = promisify(execFile)
const ROOT = path.resolve(import.meta.dirname, '..')
const VIEWPORT = { width: 1280, height: 800 }

// A two-note rising call, synthesised so the spectrogram demo has a recording
// that is ours to publish.
async function birdCall(dir) {
  const file = path.join(dir, 'call.wav')
  const expr =
    "if(lt(mod(t,1.2),0.35), sin(2*PI*(2200*t+2600*mod(t,1.2)*mod(t,1.2))), if(between(mod(t,1.2),0.45,0.95), sin(2*PI*(3000*t+900*sin(PI*(mod(t,1.2)-0.45)*2))), 0))*0.6"
  await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', `aevalsrc='${expr}':s=22050:d=3.6`, file])
  return file
}

// Moves the mouse in steps, so the recording shows it travel.
async function glide(page, x, y, steps = 25) {
  await page.mouse.move(x, y, { steps })
}

const DEMOS = {
  gameoflife: {
    url: 'https://fairy-pitta.github.io/Game-Of-Life/',
    out: 'projects/gameoflife/gameoflife-demo.mp4',
    async play(page) {
      const start = page.getByRole('button', { name: 'Start' })
      const box = await start.boundingBox()
      await glide(page, box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(400)
      await start.click()
      await page.waitForTimeout(9000)
    },
  },
  annotator: {
    url: 'https://annotator.fairy-pitta.net/',
    out: 'projects/code-annotator/annotator-demo.mp4',
    async play(page) {
      // Select "message" on the second line of the canvas, then annotate it.
      const word = page.locator('text=console.log(message)').last()
      const box = await word.boundingBox()
      await glide(page, box.x + 2, box.y + box.height / 2)
      await page.mouse.down()
      await glide(page, box.x + box.width - 2, box.y + box.height / 2, 30)
      await page.mouse.up()
      await page.waitForTimeout(700)
      const annotate = page.getByRole('button', { name: 'Annotate' })
      if (await annotate.isVisible().catch(() => false)) {
        const b = await annotate.boundingBox()
        await glide(page, b.x + b.width / 2, b.y + b.height / 2)
        await annotate.click()
        await page.waitForTimeout(500)
        await page.keyboard.type('Logs the greeting before returning it', { delay: 45 })
        await page.waitForTimeout(400)
        await page.keyboard.press('Enter')
      }
      await page.waitForTimeout(2500)
    },
  },
  birdmap: {
    url: 'https://sgbirdsmap.fairy-pitta.net',
    out: 'projects/sgbirdsmap/birdmap-demo.mp4',
    async play(page) {
      const clickOn = async (locator) => {
        const box = await locator.boundingBox()
        await glide(page, box.x + box.width / 2, box.y + box.height / 2)
        await locator.click()
        await page.waitForTimeout(500)
      }
      await clickOn(page.getByRole('button', { name: 'This Year' }))
      await clickOn(page.getByText('Past 3 Years'))
      await page.keyboard.press('Escape')
      await clickOn(page.getByText('Select a species'))
      await page.keyboard.type('Collared Kingfisher', { delay: 50 })
      await page.waitForTimeout(600)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      await clickOn(page.getByRole('button', { name: 'Get Data' }))
      await page.waitForTimeout(4500)
      // The play button is the first one in the timeline bar, left of "Show All".
      const all = await page.getByRole('button', { name: 'Show All' }).boundingBox()
      await glide(page, all.x - 28, all.y + all.height / 2)
      await page.mouse.click(all.x - 28, all.y + all.height / 2)
      await page.waitForTimeout(7000)
      await clickOn(page.getByRole('button', { name: /show(ing)? all/i }).first())
      await page.waitForTimeout(3000)
    },
  },
  spectrogram: {
    url: 'https://spectrogram.fairy-pitta.net/',
    out: 'projects/printable-spectrogram/spectrogram-demo.mp4',
    async play(page, { audio }) {
      const upload = page.getByText('Upload Audio File').first()
      const box = await upload.boundingBox()
      await glide(page, box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(400)
      await page.locator('input[type=file]').setInputFiles(audio)
      await page.waitForTimeout(3500)
      // Change the colour map, so the figure visibly redraws.
      const colours = page.locator('select').filter({ has: page.locator('option[value=magma]') }).first()
      await colours.scrollIntoViewIfNeeded({ timeout: 5000 })
      await colours.selectOption('magma', { timeout: 5000 })
      await page.waitForTimeout(2500)
      await colours.selectOption('grayscale', { timeout: 5000 })
      await page.waitForTimeout(2500)
    },
  },
}

async function encode(webm, start, output) {
  const out = path.join(ROOT, 'public', output)
  await fs.mkdir(path.dirname(out), { recursive: true })
  await run('ffmpeg', [
    '-y', '-ss', start.toFixed(2), '-i', webm,
    '-vf', 'fps=20,scale=min(1360\\,iw):-2:flags=lanczos',
    '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
    out,
  ])
  const poster = out.replace(/\.mp4$/, '.poster.webp')
  // The local ffmpeg may lack a WebP encoder, so take a PNG frame and let sharp convert it.
  const frame = out.replace(/\.mp4$/, '.frame.png')
  await run('ffmpeg', ['-y', '-i', out, '-frames:v', '1', frame])
  await sharp(frame).webp({ quality: 80, effort: 6 }).toFile(poster)
  await fs.rm(frame)
  const { size } = await fs.stat(out)
  console.log(`${output}  ${(size / 1024).toFixed(0)} KB`)
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(DEMOS)
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'demos-'))
const audio = await birdCall(tmp)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const name of names) {
    const demo = DEMOS[name]
    if (!demo) throw new Error(`unknown demo: ${name}`)
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      recordVideo: { dir: tmp, size: VIEWPORT },
    })
    const page = await context.newPage()
    const opened = Date.now()
    await page.goto(demo.url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(1200)
    // Cut the blank page and loading from the start of the video.
    const start = (Date.now() - opened) / 1000 - 0.4
    await demo.play(page, { audio })
    await page.waitForTimeout(500)
    const video = page.video()
    await context.close()
    await encode(await video.path(), Math.max(0, start), demo.out)
  }
} finally {
  await browser.close()
}
