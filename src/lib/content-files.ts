// The content files read straight from disk and checked against the same
// schemas as the collections, for tests that run outside Astro (vitest cannot
// load astro:content). Pages use ./collections instead.

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { z } from 'astro/zod'
import { jobIds } from '../data/cv'
import { blogSchema, workSchema } from './schema'
import { toBlogPosts, toJobWork, toProjects, type ContentEntry } from './content'

export const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface ContentFile {
  id: string
  file: string
  text: string
}

export function readContentFiles(collection: 'blog' | 'work'): ContentFile[] {
  const dir = path.join(CONTENT_DIR, collection)
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const file = path.join(dir, name)
      return { id: name.replace(/\.md$/, ''), file, text: fs.readFileSync(file, 'utf8') }
    })
}

function parse<S extends z.ZodTypeAny>(file: ContentFile, schema: S): ContentEntry<z.output<S>> {
  const { data, content } = matter(file.text)
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`${file.id}.md: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`)
  }
  return { id: file.id, data: result.data, body: content }
}

export const readWorkEntries = () => readContentFiles('work').map((file) => parse(file, workSchema))
export const readBlogEntries = () => readContentFiles('blog').map((file) => parse(file, blogSchema))

export const readProjects = () => toProjects(readWorkEntries())
export const readBlogPosts = (options?: { includeDrafts?: boolean }) => toBlogPosts(readBlogEntries(), options)
export const readJobWork = () =>
toJobWork(readWorkEntries(), jobIds())
