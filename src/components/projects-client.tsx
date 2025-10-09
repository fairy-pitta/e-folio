"use client"

import { useState } from "react"
import { ExternalLinkIcon, Github, EyeIcon, SearchIcon, XIcon } from "lucide-react"
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

  // すべてのタグを抽出
  const allTags = Array.from(new Set(initialProjects.flatMap((project) => project.frontmatter.tags))).sort()

  // Toggle tag selection/deselection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* ナビバーの高さを考慮したヒーローセクション */}
      <div className="pt-14 md:pt-16">
        <div className="relative overflow-hidden">
          {/* 鳥の背景画像を更新 */}
          <div className="absolute inset-0 z-0">
            <img src="/projects_hero.webp" alt="Bird on tree bark" className="w-full h-full object-cover" />
            {/* ヘッダー部分の背景グラデーションを灰色から緑色に変更 */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-800/40 via-green-700/30 to-green-600/20"></div>
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Projects</h1>
                  <p className="text-gray-100 max-w-xl">
                    A collection of work showcasing the intersection of environmental science and technology.
                  </p>
                </div>

                <div className="relative w-full md:w-64">
                  {/* 検索ボックスの色を変更 */}
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-200 h-5 w-5  z-10" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    className="pl-10 py-2 text-sm bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-green-200 rounded-md w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200 hover:text-white"
                      onClick={() => setSearchQuery("")}
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
                // タグフィルターの色を変更
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
                // クリアボタンの色を変更
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => setSelectedTags([])}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
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
                    <CardContent className="p-6 flex-grow">
                      <a href={`/projects/${project.slug}`} className="hover:text-green-600 transition-colors">
                        <h2 className="text-xl font-semibold mb-2">{project.frontmatter.title}</h2>
                      </a>
                      <p className="text-muted-foreground mb-4">{project.frontmatter.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.frontmatter.tags.map((tag) => (
                          // カードのバッジ色を変更
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "secondary"}
                            className={`${selectedTags.includes(tag) ? "bg-green-600" : "bg-green-100 text-green-800"}`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-0 flex gap-2">
                      {project.frontmatter.githubUrl && (
                        // フッターボタンの色を変更 - Codeボタン
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                          asChild
                        >
                          <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.frontmatter.liveUrl && (
                        // フッターボタンの色を変更 - Demoボタン
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                          asChild
                        >
                          <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {/* フッターボタンの色を変更 - Detailボタン */}
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white ml-auto" asChild>
                        <a href={`/projects/${project.slug}`}>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Details
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
