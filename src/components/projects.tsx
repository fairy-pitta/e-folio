"use client"

import { ExternalLinkIcon, Github } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import type { Project } from "@/lib/content"

export type { Project }

interface ProjectsProps {
  projects: Project[]
  showTags?: boolean
}

export default function Projects({ projects = [], showTags = true }: ProjectsProps) {
  const isMobile = useMobile()
  const displayedProjects = isMobile ? projects.slice(0, 3) : projects.slice(0, 6)

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-2xl font-mono-heading mb-2">Projects</h2>
          <div className="w-16 h-px bg-[hsl(var(--accent))]"></div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-sm">Loading projects...</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedProjects.map((project) => (
              <article key={project.slug} className="py-6 first:pt-0 group">
                <div className="mb-2">
                  <span className="text-xs font-mono text-muted-foreground block mb-1 md:hidden">
                    {project.frontmatter.date}
                  </span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs font-mono text-muted-foreground shrink-0 hidden md:inline">
                      {project.frontmatter.date}
                    </span>
                    <h3 className="text-lg font-medium font-source-sans">
                      <a
                        href={`/projects/${project.slug}`}
                        className="group-hover:text-[hsl(var(--accent))] transition-colors"
                        data-astro-prefetch
                      >
                        {project.frontmatter.title}
                      </a>
                    </h3>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-3 max-w-2xl line-clamp-2">
                  {project.frontmatter.description}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  {showTags && project.frontmatter.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs font-mono text-muted-foreground">
                      {tag}
                    </span>
                  ))}

                  <div className="flex items-center gap-2 ml-auto">
                    <a
                      href={`/projects/${project.slug}`}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                      data-astro-prefetch
                    >
                      Details
                    </a>
                    {project.frontmatter.githubUrl && (
                      <a
                        href={project.frontmatter.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Source code"
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
                        aria-label="Live site"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t">
          <a
            href="/projects"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
            data-astro-prefetch
          >
            All projects &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
