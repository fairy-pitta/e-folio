import satori from 'satori'
import sharp from 'sharp'

// Fonts are fetched only at build time; the site itself uses system fonts.
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
  const [regular, semibold] = await Promise.all([
    loadGoogleFont('Inter', 400),
    loadGoogleFont('Inter', 600),
  ])

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
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: title.length > 60 ? '48px' : '60px', fontWeight: 600, lineHeight: 1.25 },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '26px', fontWeight: 400, color: '#666666' },
              children: 'Shuna Maekawa · fairy-pitta.net',
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
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: semibold, weight: 600, style: 'normal' },
      ],
    },
  )

  return await sharp(Buffer.from(svg)).png().toBuffer()
}
