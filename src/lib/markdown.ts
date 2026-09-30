import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import type { Element, Node, Parent } from "hast"
import { resolveMedia } from "./media"

function isParent(node: Node): node is Parent {
  return "children" in node
}

function collectImages(node: Node, found: Element[] = []): Element[] {
  if (node.type === "element" && (node as Element).tagName === "img") {
    found.push(node as Element)
  }
  if (isParent(node)) {
    for (const child of node.children) collectImages(child, found)
  }
  return found
}

// Sizes every image, and turns the ones pointing at a converted GIF into a
// muted looping video — which is what the former .gif markdown now resolves to.
function rehypeMedia(root?: string) {
  return async (tree: Node) => {
    for (const node of collectImages(tree)) {
      const properties = node.properties ?? (node.properties = {})
      const src = typeof properties.src === "string" ? properties.src : ""
      const media = await resolveMedia(src, root)

      if (media.width && !properties.width) properties.width = media.width
      if (media.height && !properties.height) properties.height = media.height

      if (media.kind === "video") {
        node.tagName = "video"
        node.children = []
        properties.poster = media.poster
        properties.autoplay = true
        properties.muted = true
        properties.loop = true
        properties.playsinline = true
        // Offscreen demos stay unfetched until the browser decides to play them.
        properties.preload = "metadata"
        delete properties.alt
        delete properties.loading
        delete properties.decoding
        delete properties.fetchpriority
        continue
      }

      if (!properties.loading) properties.loading = "lazy"
      if (!properties.decoding) properties.decoding = "async"
      if (!properties.fetchpriority) properties.fetchpriority = "low"
    }
  }
}

// Function to parse and convert markdown
export async function markdownToHtml(markdown: string, mediaRoot?: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      // Disable automatic ID generation for headings
      properties: false,
    })
    .use(rehypeHighlight)
    .use(rehypeMedia, mediaRoot)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)

  return result.toString()
}
