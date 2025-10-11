"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Project } from "./projects"

interface ProjectsClientProps {
  initialProjects: Project[]
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [searchQuery] = useState("")
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Projects</h1>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map((project) => (
                  <Card key={project.slug} className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">
                        <a href={`/projects/${project.slug}`} className="hover:text-green-600" data-astro-prefetch>
                          {project.frontmatter.title}
                        </a>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {project.frontmatter.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.frontmatter.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
