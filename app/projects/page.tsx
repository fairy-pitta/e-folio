import { getAllProjects } from "@/lib/content"
import ProjectsClient from "@/components/projects-client"
import ScrollToTop from "@/components/scroll-to-top"

export default function ProjectsPage() {
  const projects = getAllProjects()

  return (
    <ScrollToTop>
      <ProjectsClient initialProjects={projects} />
    </ScrollToTop>
  )
}
