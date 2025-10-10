"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { 
  SiPython,
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiR,
  SiReact,
  SiNextdotjs,
  SiDjango,
  SiSupabase,
  SiAmazon,
  SiCloudflare,
  SiGithub,
  SiVercel,
  SiSqlite,
  SiTailwindcss,
  SiVite,
  SiLatex,
  SiNginx,
  SiDocker,
  SiVuedotjs,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

export default function Skills() {
  const skillCategories = [
    {
      title: "Programming Languages",
      items: [
        { name: "Python", description: "General-purpose scripting and data tasks", icon: SiPython },
        { name: "HTML", description: "Semantic markup for the web", icon: SiHtml5 },
        { name: "CSS", description: "Responsive styling and layout", icon: SiCss3 },
        { name: "JavaScript", description: "Interactive frontend development", icon: SiJavascript },
        { name: "TypeScript", description: "Type-safe JavaScript for scalable apps", icon: SiTypescript },
        { name: "R", description: "Statistical analysis and visualization", icon: SiR },
      ]
    },
    {
      title: "Frameworks",
      items: [
        { name: "React", description: "Component-based UI development", icon: SiReact },
        { name: "Next.js", description: "Full-stack React framework", icon: SiNextdotjs },
        { name: "Django", description: "Python web framework for APIs and apps", icon: SiDjango },
      ]
    },
    {
      title: "Platforms",
      items: [
        { name: "Supabase", description: "Auth, DB, storage for modern apps", icon: SiSupabase },
        { name: "AWS", description: "Cloud infrastructure and services", icon: SiAmazon },
        { name: "Cloudflare", description: "CDN, DNS, security and edge runtime", icon: SiCloudflare },
        { name: "GitHub", description: "Code hosting and collaboration", icon: SiGithub },
        { name: "Vercel", description: "Deployment and hosting platform", icon: SiVercel },
      ]
    },
    {
      title: "Tools",
      items: [
        { name: "SQLite", description: "Lightweight relational database", icon: SiSqlite },
        { name: "Tailwind CSS", description: "Utility-first CSS framework", icon: SiTailwindcss },
        { name: "Vite", description: "Fast frontend tooling and dev server", icon: SiVite },
        { name: "LaTeX", description: "Typesetting for documents and research", icon: SiLatex },
        { name: "Nginx", description: "High-performance web server and proxy", icon: SiNginx },
      ]
    },
    {
      title: "Now Training",
      items: [
        { name: "Docker", description: "Containerization basics and best practices", icon: SiDocker },
        { name: "Vue.js", description: "Exploring reactive UI development", icon: SiVuedotjs },
        { name: "Java", description: "Learning core language and ecosystem", icon: FaJava },
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-black mb-4">Technical Skills</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise and the tools I use to build modern applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-gray-200 hover:border-gray-400 transition-colors duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-black mb-6">{category.title}</h3>
                  <div className="space-y-4">
                    {category.items.map((skill, skillIndex) => {
                      const IconComponent = skill.icon;
                      return (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: skillIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <IconComponent className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <h4 className="font-medium text-black">{skill.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
