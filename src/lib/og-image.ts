import satori from 'satori'
import sharp from 'sharp'

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
  const cssRes = await fetch(url)
  const css = await cssRes.text()
  const match = css.match(/src:\s*url\(([^)]+)\)/)
  if (!match) throw new Error(`Failed to load font: ${family}`)
  const fontRes = await fetch(match[1])
  return fontRes.arrayBuffer()
}

export async function generateOgImage(title: string, tags: string[] = []): Promise<Buffer> {
  const jetbrainsMono = await loadGoogleFont('JetBrains Mono', 500)
  const sourceSans = await loadGoogleFont('Source Sans 3', 400)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          padding: '60px',
          backgroundColor: '#faf8f5',
          fontFamily: 'Source Sans 3',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '20px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '18px',
                            fontFamily: 'JetBrains Mono',
                            color: '#2d6b50',
                            letterSpacing: '-0.02em',
                          },
                          children: 'fairy-pitta.net',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { width: '64px', height: '2px', backgroundColor: '#2d6b50' },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 40 ? '40px' : '48px',
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 500,
                      color: '#1f1c19',
                      lineHeight: 1.3,
                      letterSpacing: '-0.02em',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              },
              children: tags.slice(0, 4).map((tag) => ({
                type: 'div',
                props: {
                  style: {
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono',
                    color: '#6b6560',
                    padding: '4px 0',
                  },
                  children: tag,
                },
              })),
            },
          },
        ],
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'JetBrains Mono', data: jetbrainsMono, weight: 500, style: 'normal' },
        { name: 'Source Sans 3', data: sourceSans, weight: 400, style: 'normal' },
      ],
    },
  )

  return await sharp(Buffer.from(svg)).png().toBuffer()
}
