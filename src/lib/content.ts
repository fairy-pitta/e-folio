import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { readFile } from "fs/promises"
import { access } from "fs/promises"

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

// Get all blog post slugs
export function getAllBlogSlugs() {
  try {
    if (!fs.existsSync(blogDirectory)) {
      return []
    }
    const fileNames = fs.readdirSync(blogDirectory)
    return fileNames
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .map((fileName) => ({
        slug: fileName.replace(/\.mdx?$/, ""),
      }))
  } catch (error) {
    console.error("Error getting blog slugs:", error)
    return []
  }
}

// Get all project slugs
export function getAllProjectSlugs() {
  try {
    if (!fs.existsSync(projectsDirectory)) {
      return []
    }
    const fileNames = fs.readdirSync(projectsDirectory)
    return fileNames
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .map((fileName) => ({
        slug: fileName.replace(/\.mdx?$/, ""),
      }))
  } catch (error) {
    console.error("Error getting project slugs:", error)
    return []
  }
}

// Get blog post content
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`)
    await access(fullPath)  // ファイルが存在するかチェック
    const fileContents = await readFile(fullPath, "utf8")
    const { data, content } = matter(fileContents)
    return {
      slug,
      frontmatter: data as BlogFrontmatter,
      content,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

// Get project content
export function getProject(slug: string): Project | null {
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`)
    if (!fs.existsSync(fullPath)) {
      return null
    }
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    return {
      slug,
      frontmatter: data as ProjectFrontmatter,
      content,
    }
  } catch (error) {
    console.error(`Error reading project ${slug}:`, error)
    return null
  }
}

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(blogDirectory)) {
      return []
    }

    const fileNames = fs.readdirSync(blogDirectory)
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, "")
        const fullPath = path.join(blogDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(fileContents)

        return {
          slug,
          frontmatter: data as BlogFrontmatter,
          content,
        }
      })

    // Sort by date
    return allPostsData.sort((a, b) => {
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    })
  } catch (error) {
    console.error("Error getting all blog posts:", error)
    return []
  }
}

// Get all projects
export function getAllProjects(): Project[] {
  try {
    if (!fs.existsSync(projectsDirectory)) {
      return []
    }

    const fileNames = fs.readdirSync(projectsDirectory)
    const allProjectsData = fileNames
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, "")
        const fullPath = path.join(projectsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(fileContents)

        return {
          slug,
          frontmatter: data as ProjectFrontmatter,
          content,
        }
      })

    // Sort by date (newest first)
    return allProjectsData.sort((a, b) => {
      const ad = new Date(a.frontmatter.date).getTime()
      const bd = new Date(b.frontmatter.date).getTime()
      return bd - ad
    })
  } catch (error) {
    console.error("Error getting all projects:", error)
    return []
  }
}

// Get blog posts by tag
export function getBlogPostsByTag(tag: string): BlogPost[] {
  try {
    const allPosts = getAllBlogPosts()
    return allPosts.filter((post) => post.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
  } catch (error) {
    console.error(`Error getting blog posts by tag ${tag}:`, error)
    return []
  }
}

// Get all tags
export function getAllTags(): string[] {
  try {
    const allPosts = getAllBlogPosts()
    const tagSet = new Set<string>()

    allPosts.forEach((post) => {
      post.frontmatter.tags.forEach((tag) => {
        tagSet.add(tag)
      })
    })

    return Array.from(tagSet).sort()
  } catch (error) {
    console.error("Error getting all tags:", error)
    return []
  }
}
