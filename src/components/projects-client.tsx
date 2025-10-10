"use client"

import { useState } from "react"
import { ExternalLinkIcon, Github, EyeIcon, SearchIcon, XIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-14 md:pt-16">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/projects_hero.webp" alt="Bird on tree bark" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-800/40 via-green-700/30 to-green-600/20"></div>
          </div>

          <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Projects</h1>
                  <p className="text-gray-100 max-w-xl">
                    A collection of work showcasing the intersection of environmental science and technology.
                  </p>
                </div>

                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-200 h-5 w-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    className="pl-10 py-2 text-sm bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-green-200 rounded-md w-full"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200 hover:text-white"
                      onClick={() => {
                        setSearchQuery("")
                        setCurrentPage(1)
                      }}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium py-1">Filter by technologies:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map((project, index) => (
                  <motion.div
                    key={project.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.frontmatter.coverImage || "/placeholder.svg"}
                          alt={project.frontmatter.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <a href={`/projects/${project.slug}`} className="hover:text-green-600 transition-colors">
                          <h2 className="text-lg font-semibold mb-2">{project.frontmatter.title}</h2>
                        </a>
                        <p className="text-muted-foreground mb-3 text-sm">{project.frontmatter.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.frontmatter.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {project.frontmatter.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{project.frontmatter.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0 flex gap-2">
                        {project.frontmatter.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-600 hover:bg-green-50 text-xs"
                            asChild
                          >
                            <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-3 w-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.frontmatter.liveUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-600 hover:bg-green-50 text-xs"
                            asChild
                          >
                            <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLinkIcon className="h-3 w-3 mr-1" />
                              Demo
                            </a>
                          </Button>
                        )}
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white ml-auto text-xs" asChild>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-green-300 text-green-600 hover:bg-green-50 disabled:opacity-50"
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
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-green-300 text-green-600 hover:bg-green-50"
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
                    className="border-green-300 text-green-600 hover:bg-green-50 disabled:opacity-50"
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
