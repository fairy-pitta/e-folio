import Hero from "@/components/hero"
import Skills from "@/components/skills"
import Projects from "@/components/projects"
import Blog from "@/components/blog"
import Contact from "@/components/contact"
import BirdAnimation from "@/components/bird-animation"
import ScrollIndicator from "@/components/scroll-indicator"
import ParallaxBackground from "@/components/parallax-background"
import { getAllProjects, getAllBlogPosts } from "@/lib/content"

export default function Home() {
  // サーバーコンポーネントでデータを取得
  const projects = getAllProjects()
  const posts = getAllBlogPosts().slice(0, 12) // 最新12記事を表���

  return (
    <main className="relative overflow-hidden">
      <ParallaxBackground />
      <BirdAnimation />
      <ScrollIndicator />

      {/* Hero Section */}
      <section id="about" className="snap-section min-h-screen relative">
        <Hero />
      </section>

      {/* Skills Section */}
      <section id="skills" className="snap-section min-h-screen relative">
        <Skills />
      </section>

      {/* Projects Section */}
      <section id="projects" className="snap-section min-h-screen relative">
        <Projects projects={projects} />
      </section>

      {/* Blog Section */}
      <section id="blog" className="snap-section min-h-screen relative">
        <Blog posts={posts} />
      </section>

      {/* Contact Section */}
      <section id="contact" className="snap-section min-h-screen relative">
        <Contact />
      </section>
    </main>
  )
}
