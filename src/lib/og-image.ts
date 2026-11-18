import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import satori from 'satori'
import sharp from 'sharp'

// The site's own typefaces, Geist and Geist Mono, as TrueType files: satori
// cannot read the woff2 files the site ships. They are committed under
// assets/fonts (see SOURCE.txt there), so a build needs no network for them.
const FONT_DIR = resolve(process.cwd(), 'assets/fonts')

// The light theme's tokens from styles/tokens.css (a test keeps them in step).
export const OG_COLOURS = {
  bg: '#f5f5f7',
  fg: '#1d1d1f',
  faint: '#6e6e73',
  accent: '#0066cc',
} as const

const fontCache = new Map<string, Buffer>()

function loadFont(file: string): Buffer {
  const cached = fontCache.get(file)
  if (cached) return cached
  const buffer = readFileSync(resolve(FONT_DIR, file))
  fontCache.set(file, buffer)
  return buffer
}

export async function generateOgImage(title: string): Promise<Buffer> {
  const bold = loadFont('Geist-Bold.ttf')
  const mono = loadFont('GeistMono-Regular.ttf')

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          backgroundColor: OG_COLOURS.bg,
          color: OG_COLOURS.fg,
          fontFamily: 'Geist',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: title.length > 60 ? '52px' : '68px',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontFamily: 'Geist Mono',
                fontSize: '24px',
                color: OG_COLOURS.faint,
              },
              children: [
                {
                  type: 'div',
                  props: { style: { width: '12px', height: '12px', borderRadius: '6px', backgroundColor: OG_COLOURS.accent } },
                },
                'Shuna Maekawa · fairy-pitta.net',
              ],
            },
          },
        ],
      },
    // satori accepts plain element objects; its types expect React nodes
    } as unknown as Parameters<typeof satori>[0],
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: bold, weight: 700, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
      ],
    },
  )

  return await sharp(Buffer.from(svg)).png().toBuffer()
}
