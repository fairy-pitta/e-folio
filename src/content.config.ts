import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { blogSchema, workSchema } from './lib/schema'

// The id is the file name as written: the glob loader would otherwise lower-case
// it, and /projects/Portree, /projects/SBBirdMap and their OG images are named
// after the file.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '')

// Pages render the body with markdownToHtml (src/lib/markdown.ts), not with
// Astro's render(), so media keep their sizes and GIF replacements.
export const collections = {
  blog: defineCollection({
    loader: glob({ pattern: '*.md', base: './content/blog', generateId }),
    schema: blogSchema,
  }),
  work: defineCollection({
    loader: glob({ pattern: '*.md', base: './content/work', generateId }),
    schema: workSchema,
  }),
}
