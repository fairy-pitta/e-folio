"use client"

import { useState } from "react"
import { ExternalLinkIcon, GithubIcon, EyeIcon, SearchIcon, XIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../src/components/ui/button"
import { Card, CardContent, CardFooter } from "../src/components/ui/card"
import { Badge } from "../src/components/ui/badge"
import { Input } from "../src/components/ui/input"
import { motion } from "framer-motion"
import type { Project } from "./projects"

interface ProjectsClientProps {
  initialProjects: Project[]
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 6

  // すべてのタグを抽出
  const allTags = Array.from(new Set(initialProjects.flatMap((project) => project.frontmatter.tags))).sort()

  // Toggle tag selection/deselection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Filter projects by search query and tags
  const filteredProjects = initialProjects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.frontmatter.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => project.frontmatter.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const endIndex = startIndex + projectsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-background">
      {/* シンプルなヒーローセクション */}
      <div className="pt-14 md:pt-16">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Projects</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              A collection of work showcasing the intersection of environmental science and technology.
            </p>

            {/* 検索ボックス */}
            <div className="relative max-w-md mx-auto mb-6">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-10 py-2 text-sm border-border bg-background"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* タグフィルター */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedTags([])
                    setCurrentPage(1)
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* プロジェクトグリッド */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map((project, index) => (
                  <motion.div
                    key={project.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden border-border hover:shadow-md transition-all duration-300 group bg-card">
                      <div className="aspect-[16/10] overflow-hidden bg-muted/50">
                        <img
                          src={project.frontmatter.coverImage || "/placeholder.svg"}
                          alt={project.frontmatter.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-6 flex-grow">
                        <a href={`/projects/${project.slug}`} className="group">
                          <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {project.frontmatter.title}
                          </h2>
                        </a>
                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm line-clamp-3">
                          {project.frontmatter.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.frontmatter.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-primary/10 transition-colors px-2 py-1"
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                          {project.frontmatter.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              +{project.frontmatter.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0 flex gap-2 flex-wrap">
                        {project.frontmatter.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 hover:bg-primary/5 transition-colors flex-1 min-w-0"
                            asChild
                          >
                            <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
                              <GithubIcon className="h-3 w-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.frontmatter.liveUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 hover:bg-primary/5 transition-colors flex-1 min-w-0"
                            asChild
                          >
                            <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLinkIcon className="h-3 w-3 mr-1" />
                              Demo
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="text-xs h-8 bg-primary hover:bg-primary/90 transition-colors flex-1 min-w-0" 
                          asChild
                        >
                          <a href={`/projects/${project.slug}`}>
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Details
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="hover:bg-primary/5 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-primary hover:bg-primary/90"
                          : "hover:bg-primary/5 transition-colors"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="hover:bg-primary/5 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
