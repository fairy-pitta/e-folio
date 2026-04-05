import { describe, it, expect } from 'vitest'
import {
  getAllBlogPosts,
  getAllProjects,
  getBlogPost,
  getProject,
  getAllBlogSlugs,
  getAllProjectSlugs,
  getBlogPostsByTag,
  getAllTags,
} from './content'

describe('getAllBlogPosts', () => {
  it('returns_posts_sorted_by_date_descending', () => {
    const posts = getAllBlogPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (let i = 1; i < posts.length; i++) {
      const prev = new Date(posts[i - 1].frontmatter.date).getTime()
      const curr = new Date(posts[i].frontmatter.date).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('returns_posts_with_required_frontmatter_fields', () => {
    const posts = getAllBlogPosts()
    for (const post of posts) {
      expect(post.slug).toBeTruthy()
      expect(post.frontmatter.title).toBeTruthy()
      expect(post.frontmatter.date).toBeTruthy()
      expect(post.frontmatter.excerpt).toBeTruthy()
      expect(Array.isArray(post.frontmatter.tags)).toBe(true)
    }
  })
})

describe('getAllProjects', () => {
  it('returns_projects_sorted_by_date_descending', () => {
    const projects = getAllProjects()
    expect(projects.length).toBeGreaterThan(0)
    for (let i = 1; i < projects.length; i++) {
      const prev = new Date(projects[i - 1].frontmatter.date).getTime()
      const curr = new Date(projects[i].frontmatter.date).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('returns_projects_with_required_frontmatter_fields', () => {
    const projects = getAllProjects()
    for (const project of projects) {
      expect(project.slug).toBeTruthy()
      expect(project.frontmatter.title).toBeTruthy()
      expect(project.frontmatter.description).toBeTruthy()
      expect(Array.isArray(project.frontmatter.tags)).toBe(true)
    }
  })
})

describe('getBlogPost', () => {
  it('returns_post_for_valid_slug', () => {
    const posts = getAllBlogPosts()
    const slug = posts[0].slug
    const post = getBlogPost(slug)
    expect(post).not.toBeNull()
    expect(post!.slug).toBe(slug)
    expect(post!.content).toBeTruthy()
  })

  it('returns_null_for_invalid_slug', () => {
    const post = getBlogPost('nonexistent-post-slug-xyz')
    expect(post).toBeNull()
  })
})

describe('getProject', () => {
  it('returns_project_for_valid_slug', () => {
    const projects = getAllProjects()
    const slug = projects[0].slug
    const project = getProject(slug)
    expect(project).not.toBeNull()
    expect(project!.slug).toBe(slug)
  })

  it('returns_null_for_invalid_slug', () => {
    const project = getProject('nonexistent-project-slug-xyz')
    expect(project).toBeNull()
  })
})

describe('getAllBlogSlugs', () => {
  it('returns_array_of_slug_objects', () => {
    const slugs = getAllBlogSlugs()
    expect(slugs.length).toBeGreaterThan(0)
    for (const item of slugs) {
      expect(typeof item.slug).toBe('string')
      expect(item.slug.length).toBeGreaterThan(0)
    }
  })
})

describe('getAllProjectSlugs', () => {
  it('returns_array_of_slug_objects', () => {
    const slugs = getAllProjectSlugs()
    expect(slugs.length).toBeGreaterThan(0)
    for (const item of slugs) {
      expect(typeof item.slug).toBe('string')
    }
  })
})

describe('getBlogPostsByTag', () => {
  it('filters_posts_by_tag_case_insensitively', () => {
    const allPosts = getAllBlogPosts()
    if (allPosts.length === 0) return
    const tag = allPosts[0].frontmatter.tags[0]
    if (!tag) return
    const filtered = getBlogPostsByTag(tag)
    expect(filtered.length).toBeGreaterThan(0)
    for (const post of filtered) {
      const hasTag = post.frontmatter.tags.some(
        (t) => t.toLowerCase() === tag.toLowerCase(),
      )
      expect(hasTag).toBe(true)
    }
  })

  it('returns_empty_array_for_nonexistent_tag', () => {
    const filtered = getBlogPostsByTag('zzz-nonexistent-tag-zzz')
    expect(filtered).toEqual([])
  })
})

describe('getAllTags', () => {
  it('returns_sorted_unique_tags', () => {
    const tags = getAllTags()
    expect(tags.length).toBeGreaterThan(0)
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i] >= tags[i - 1]).toBe(true)
    }
    expect(new Set(tags).size).toBe(tags.length)
  })
})
