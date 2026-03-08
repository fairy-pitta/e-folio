"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Github, ExternalLinkIcon } from "lucide-react"
import type { Project } from "./projects"

interface ProjectsClientProps {
  initialProjects: Project[]
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 8

  const allTags = Array.from(new Set(initialProjects.flatMap((project) => project.frontmatter.tags))).sort()

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
    setCurrentPage(1)
  }

  const filteredProjects = initialProjects.filter((project) => {
    return selectedTags.length === 0 || selectedTags.every((tag) => project.frontmatter.tags.includes(tag))
  })

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const currentProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-mono-heading mb-2">Projects</h1>
          <div className="w-16 h-px bg-[hsl(var(--accent))] mb-8"></div>

          {/* Tag filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs font-mono px-2 py-1 border rounded-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  onClick={() => {
                    setSelectedTags([])
                    setCurrentPage(1)
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="py-12">
              <p className="text-sm text-muted-foreground">No projects found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {currentProjects.map((project) => (
                  <article key={project.slug} className="py-6 first:pt-0 group">
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {project.frontmatter.date}
                      </span>
                      <h3 className="text-base font-medium">
                        <a
                          href={`/projects/${project.slug}`}
                          className="group-hover:text-[hsl(var(--accent))] transition-colors"
                          data-astro-prefetch
                        >
                          {project.frontmatter.title}
                        </a>
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 max-w-2xl line-clamp-2">
                      {project.frontmatter.description}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {project.frontmatter.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-xs font-mono text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                      <div className="flex items-center gap-2 ml-auto">
                        {project.frontmatter.githubUrl && (
                          <a
                            href={project.frontmatter.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {project.frontmatter.liveUrl && (
                          <a
                            href={project.frontmatter.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLinkIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>

                  <div className="flex gap-1 mx-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`text-xs font-mono w-7 h-7 transition-colors ${
                          currentPage === page
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
