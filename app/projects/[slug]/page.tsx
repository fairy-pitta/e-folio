import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, GithubIcon, CalendarIcon, EyeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProject, getAllProjectSlugs } from "@/lib/content"
import { markdownToHtml } from "@/lib/markdown"
import ScrollToTop from "@/components/scroll-to-top"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const project = getProject(slug)

  if (!project) {
    return {
      title: "Project Not Found | SingBirds",
      description: "The project you're looking for could not be found.",
    }
  }

  return {
    title: `${project.frontmatter.title} | SingBirds`,
    description: project.frontmatter.description,
  }
}

export function generateStaticParams() {
  return getAllProjectSlugs()
}

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const { slug } = params
  const project = getProject(slug)

  if (!project) {
    return (
      <div className="pt-14 md:pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Project Not Found</h1>
            <p>The project you're looking for doesn't exist or has been moved.</p>
            <Button asChild className="mt-4">
              <Link href="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const contentHtml = await markdownToHtml(project.content)

  return (
    <ScrollToTop>
      <div className="min-h-screen bg-background">
        {/* ナビバーの高さを考慮したヘッダーセクション */}
        <div className="pt-16 md:pt-20">
          <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:20px_20px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/30"></div>

            <div className="container mx-auto px-4 py-12 relative z-10">
              <div className="max-w-4xl mx-auto">
                <Button variant="ghost" className="mb-4 text-green-100 hover:text-white hover:bg-white/10" asChild>
                  <Link href="/projects">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Projects
                  </Link>
                </Button>

                <h1 className="text-2xl md:text-3xl font-bold mb-2">{project.frontmatter.title}</h1>
                <p className="text-blue-100 max-w-xl mb-4">{project.frontmatter.description}</p>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center text-blue-100">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {project.frontmatter.date}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.frontmatter.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="border-green-300 text-green-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <img
                src={project.frontmatter.coverImage || "/placeholder.svg"}
                alt={project.frontmatter.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {(project.frontmatter.liveUrl || project.frontmatter.githubUrl) && (
              <div className="flex gap-4 mb-8">
                {project.frontmatter.liveUrl && (
                  <Button className="bg-green-500 hover:bg-green-600" asChild>
                    <a href={project.frontmatter.liveUrl} target="_blank" rel="noopener noreferrer">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.frontmatter.githubUrl && (
                  <Button variant="outline" className="border-green-300 text-green-600 hover:bg-green-50" asChild>
                    <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer">
                      <GithubIcon className="h-4 w-4 mr-1" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            )}

            <div className="prose prose-green prose-img:rounded-xl 
            prose-headings:scroll-mt-8 prose-a:text-green-600 
            max-w-none sm:prose-lg" dangerouslySetInnerHTML={{ __html: contentHtml }} />

            {project.frontmatter.gallery && project.frontmatter.gallery.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Project Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.frontmatter.gallery.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`${project.frontmatter.title} screenshot ${index + 1}`}
                      className="rounded-lg shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollToTop>
  )
}
