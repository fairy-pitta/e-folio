"use client"

import { useEffect, useRef } from 'react';

interface Skill {
  name: string
  description: string
}

interface SkillCategory {
  title: string
  items: Skill[]
}

const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    items: [
      { name: "TypeScript", description: "Type-safe JavaScript for scalable apps" },
      { name: "JavaScript", description: "Interactive frontend development" },
      { name: "Python", description: "General-purpose scripting and data tasks" },
      { name: "Go", description: "CLI tools and backend services" },
      { name: "Rust", description: "High-performance WASM and systems code" },
      { name: "R", description: "Statistical analysis and visualization" },
    ]
  },
  {
    title: "Frameworks",
    items: [
      { name: "React", description: "Component-based UI development" },
      { name: "Next.js", description: "Full-stack React framework" },
      { name: "Django", description: "Python web framework for APIs and apps" },
    ]
  },
  {
    title: "Platforms",
    items: [
      { name: "Cloudflare", description: "CDN, DNS, security and edge runtime" },
      { name: "Vercel", description: "Deployment and hosting platform" },
      { name: "Supabase", description: "Auth, DB, storage for modern apps" },
      { name: "AWS", description: "Cloud infrastructure and services" },
      { name: "GitHub", description: "Code hosting and collaboration" },
      { name: "Chrome Extensions", description: "Browser extension development" },
    ]
  },
  {
    title: "Tools",
    items: [
      { name: "SQLite", description: "" },
      { name: "Tailwind CSS", description: "" },
      { name: "Vite", description: "" },
      { name: "LaTeX", description: "" },
      { name: "Nginx", description: "" },
    ]
  },
  {
    title: "Learning",
    items: [
      { name: "Docker", description: "Containerization basics and best practices" },
      { name: "Vue.js", description: "Exploring reactive UI development" },
      { name: "Java", description: "Learning core language and ecosystem" },
    ]
  }
];

function useIntersectionObserver() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = el.querySelectorAll('[data-animate]');
    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Skills() {
  const containerRef = useIntersectionObserver();

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4" ref={containerRef}>
        <div data-animate className="mb-12 opacity-0">
          <h2 className="text-2xl font-mono-heading mb-2">Technical Skills</h2>
          <div className="w-16 h-px bg-[hsl(var(--accent))]"></div>
        </div>

        <div className="space-y-0 divide-y divide-border">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              data-animate
              className="opacity-0 py-5 first:pt-0 flex flex-col gap-2 md:grid md:grid-cols-[160px_1fr] md:gap-4 md:items-baseline"
              style={{ animationDelay: `${categoryIndex * 80}ms` }}
            >
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground pt-0.5">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {category.items.map((skill, i) => (
                  <span key={skill.name} className="text-sm group relative">
                    <span className="hover:text-[hsl(var(--accent))] transition-colors cursor-default">
                      {skill.name}
                    </span>
                    {i < category.items.length - 1 && (
                      <span className="text-muted-foreground ml-1">/</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
