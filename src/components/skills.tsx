"use client"

import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";

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
    title: "Programming Languages",
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
    title: "Now Training",
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
    <section id="skills" className="py-20 bg-white">
      <div className="container mx-auto px-4" ref={containerRef}>
        <div data-animate className="text-center mb-16 opacity-0">
          <h2 className="text-4xl font-bold text-black mb-4">Technical Skills</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise and the tools I use to build modern applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              data-animate
              className="opacity-0"
              style={{ animationDelay: `${categoryIndex * 100}ms` }}
            >
              <Card className="h-full border-gray-200 hover:border-gray-400 transition-colors duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-black mb-6">{category.title}</h3>
                  <div className="space-y-4">
                    {category.items.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div>
                          <h4 className="font-medium text-black">{skill.name}</h4>
                          {skill.description && (
                            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
