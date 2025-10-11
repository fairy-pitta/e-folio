import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

// rehype plugin to add attributes to images
function rehypeMarkdownImageAttributes() {
  return (tree: any) => {
    function visit(node: any) {
      if (!node) return
      if (node.type === "element" && node.tagName === "img") {
        node.properties = node.properties || {}
        if (!node.properties.loading) node.properties.loading = "lazy"
        if (!node.properties.decoding) node.properties.decoding = "async"
        if (!node.properties.fetchpriority) node.properties.fetchpriority = "low"
      }
      const children = node.children || []
      for (const child of children) visit(child)
    }
    visit(tree)
  }
}

// Function to parse and convert markdown
export async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      // Disable automatic ID generation for headings
      properties: false,
    })
    .use(rehypeHighlight)
    .use(rehypeMarkdownImageAttributes)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)

  return result.toString()
}
