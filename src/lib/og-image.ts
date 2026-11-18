import satori from 'satori'
import sharp from 'sharp'

// Fonts are fetched only at build time. They are the site's own typefaces,
// Geist and Geist Mono, as TrueType files: satori cannot read the woff2 files
// the site ships. The colours are the light theme's tokens from site.css.
const BG = '#f5f5f7'
const FG = '#1d1d1f'
const FAINT = '#6e6e73'
const ACCENT = '#1d6b52'
const fontCache = new Map<string, ArrayBuffer>()

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cacheKey = `${family}:${weight}`
  const cached = fontCache.get(cacheKey)
  if (cached) return cached

  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
  const css = await (await fetch(url)).text()
  const match = css.match(/src:\s*url\(([^)]+)\)/)
  if (!match) throw new Error(`Failed to load font: ${family}`)
  const buffer = await (await fetch(match[1])).arrayBuffer()
  fontCache.set(cacheKey, buffer)
  return buffer
}

export async function generateOgImage(title: string): Promise<Buffer> {
  const [bold, mono] = await Promise.all([loadGoogleFont('Geist', 700), loadGoogleFont('Geist Mono', 400)])

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
          backgroundColor: BG,
          color: FG,
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
                color: FAINT,
              },
              children: [
                {
                  type: 'div',
                  props: { style: { width: '12px', height: '12px', borderRadius: '6px', backgroundColor: ACCENT } },
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
