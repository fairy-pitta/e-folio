"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLinkIcon, GithubIcon, EyeIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useMobile } from "@/hooks/use-mobile"

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
}

export default function Projects({ projects = [] }: ProjectsProps) {
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
          <h2 className="text-3xl font-bold mb-4 text-sky-800">Featured Projects</h2>
          <p className="text-sky-600 max-w-2xl mx-auto">
            A collection of work that demonstrates the intersection of environmental science and technology.
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProjects.map((project, index) => (
              <motion.div
                key={project.slug}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="hover-card h-full flex flex-col overflow-hidden bg-white/85 backdrop-blur-sm border-transparent">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      priority
                      src={project.frontmatter.coverImage || "/placeholder.svg"}
                      alt={project.frontmatter.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      quality={80}
                    />
                  </div>
                  <CardContent className="p-6 flex-grow">
                    <Link href={`/projects/${project.slug}`} className="hover:text-sky-600 transition-colors">
                      <h3 className="text-xl font-semibold mb-2">{project.frontmatter.title}</h3>
                    </Link>
                    <p className="text-muted-foreground mb-4">{project.frontmatter.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.frontmatter.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0 flex flex-wrap gap-2">
                    {project.frontmatter.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-sky-300 text-sky-600 hover:bg-sky-50 text-xs px-2 h-8"
                        asChild
                      >
                        <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
                          <GithubIcon className="h-3.5 w-3.5 mr-1" />
                          Code
                        </a>
                      </Button>
                    )}
                    {project.frontmatter.liveUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-sky-300 text-sky-600 hover:bg-sky-50 text-xs px-2 h-8"
                        asChild
                      >
                        <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLinkIcon className="h-3.5 w-3.5 mr-1" />
                          Demo
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-sky-500 hover:bg-sky-600 text-white ml-auto text-xs px-2 h-8"
                      asChild
                    >
                      <Link href={`/projects/${project.slug}`}>
                        <EyeIcon className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-10">
          <Button asChild className="bg-sky-500 hover:bg-sky-600">
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
