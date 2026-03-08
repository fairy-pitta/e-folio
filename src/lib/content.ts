import fs from "fs"
import path from "path"
import matter from "gray-matter"

// Content directory paths
const blogDirectory = path.join(process.cwd(), "content", "blog")
const projectsDirectory = path.join(process.cwd(), "content", "projects")

// Blog post frontmatter type definition
export interface BlogFrontmatter {
  title: string
  date: string
  excerpt: string
  coverImage: string
  readTime: string
  tags: string[]
}

// Project frontmatter type definition
export interface ProjectFrontmatter {
  title: string
  description: string
  date: string
  coverImage: string
  tags: string[]
  liveUrl: string
  githubUrl: string
  gallery?: string[]
}

// Blog post type definition
export interface BlogPost {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
}

// Project type definition
export interface Project {
  slug: string
  frontmatter: ProjectFrontmatter
  content: string
}

// Read markdown files from a directory
function readMarkdownFiles<T>(directory: string): { slug: string; frontmatter: T; content: string }[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs.readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "")
      const fullPath = path.join(directory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)
      return { slug, frontmatter: data as T, content }
    })
}

// Get all blog post slugs
export function getAllBlogSlugs() {
  return getAllBlogPosts().map(({ slug }) => ({ slug }))
}

// Get all project slugs
export function getAllProjectSlugs() {
  return getAllProjects().map(({ slug }) => ({ slug }))
}

// Get blog post content
export function getBlogPost(slug: string): BlogPost | null {
  const fullPath = path.join(blogDirectory, `${slug}.md`)
  if (!fs.existsSync(fullPath)) {
    return null
  }
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)
  return { slug, frontmatter: data as BlogFrontmatter, content }
}

// Get project content
export function getProject(slug: string): Project | null {
  const fullPath = path.join(projectsDirectory, `${slug}.md`)
  if (!fs.existsSync(fullPath)) {
    return null
  }
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)
  return { slug, frontmatter: data as ProjectFrontmatter, content }
}

// Get all blog posts sorted by date (newest first)
export function getAllBlogPosts(): BlogPost[] {
  return readMarkdownFiles<BlogFrontmatter>(blogDirectory)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

// Get all projects sorted by date (newest first)
export function getAllProjects(): Project[] {
  return readMarkdownFiles<ProjectFrontmatter>(projectsDirectory)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

// Get blog posts by tag
export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter((post) =>
    post.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

// Get all tags
export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  getAllBlogPosts().forEach((post) => {
    post.frontmatter.tags.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}
