"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLinkIcon } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { Github } from "lucide-react"

// 型定義を追加
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

export interface Project {
  slug: string
  frontmatter: ProjectFrontmatter
  content: string
}

interface ProjectsProps {
  projects: Project[]
  showTags?: boolean
}

export default function Projects({ projects = [], showTags = true }: ProjectsProps) {
  const isMobile = useMobile()

  // モバイル表示用に表示するプロジェクト数を制限
  const displayedProjects = isMobile ? projects.slice(0, 3) : projects.slice(0, 6)

  return (
    <div className="min-h-screen py-20 relative overflow-hidden flex items-center">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Featured Projects</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A collection of software engineering projects and technical implementations.
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedProjects.map((project) => (
              <motion.div
                key={project.slug}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{project.frontmatter.date}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 hover:text-sky-600 transition-colors font-source-sans">
                      <a href={`/projects/${project.slug}`} data-astro-prefetch>
                        {project.frontmatter.title}
                      </a>
                    </h3>
                    
-                    <p className="text-gray-700 mb-4 line-clamp-3">{project.frontmatter.description}</p>
-                    
-                    {showTags && (
-                      <div className="flex flex-wrap gap-2 mb-4">
-                        {project.frontmatter.tags.slice(0, 5).map((tag) => (
-                          <Badge key={tag} variant="outline" className="text-xs">
-                            {tag}
-                          </Badge>
-                        ))}
-                        {project.frontmatter.tags.length > 5 && (
-                          <Badge variant="outline" className="text-xs">
-                            +{project.frontmatter.tags.length - 5}
-                          </Badge>
-                        )}
-                      </div>
-                    )}
-                    
-                    <div className="flex gap-2">
-                      <Button asChild size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
-                        <a href={`/projects/${project.slug}`} data-astro-prefetch>
-                          View Details
-                        </a>
-                      </Button>
-                      {project.frontmatter.githubUrl && (
-                        <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
-                          <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
-                            <Github className="h-3.5 w-3.5 mr-1" />
-                            Code
-                          </a>
-                        </Button>
-                      )}
-                      {project.frontmatter.liveUrl && (
-                        <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
-                          <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
-                            <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
-                            Live
-                          </a>
-                        </Button>
-                      )}
-                    </div>
+                    <div className="md:flex md:items-start md:justify-between gap-6">
+                      <div className="flex-1">
+                        <p className="text-gray-700 mb-3 md:mb-2 line-clamp-3">{project.frontmatter.description}</p>
+                        {showTags && (
+                          <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
+                            {project.frontmatter.tags.slice(0, 5).map((tag) => (
+                              <Badge key={tag} variant="outline" className="text-xs">
+                                {tag}
+                              </Badge>
+                            ))}
+                            {project.frontmatter.tags.length > 5 && (
+                              <Badge variant="outline" className="text-xs">
+                                +{project.frontmatter.tags.length - 5}
+                              </Badge>
+                            )}
+                          </div>
+                        )}
+                      </div>
+                      <div className="mt-2 md:mt-0 flex gap-2 md:flex-col md:items-end md:gap-2 shrink-0">
+                        <Button asChild size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
+                          <a href={`/projects/${project.slug}`} data-astro-prefetch>
+                            View Details
+                          </a>
+                        </Button>
+                        {project.frontmatter.githubUrl && (
+                          <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
+                            <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
+                              <Github className="h-3.5 w-3.5 mr-1" />
+                              Code
+                            </a>
+                          </Button>
+                        )}
+                        {project.frontmatter.liveUrl && (
+                          <Button asChild variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
+                            <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
+                              <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
+                              Live
+                            </a>
+                          </Button>
+                        )}
+                      </div>
+                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <a href="/projects" data-astro-prefetch>
              View All Projects
              <ExternalLinkIcon className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
