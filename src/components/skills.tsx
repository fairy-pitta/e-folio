"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { 
  SiPython, 
  SiJavascript, 
  SiTypescript, 
  SiR,
  SiReact, 
  SiNextdotjs, 
  SiAstro, 
  SiTailwindcss,
  SiNodedotjs, 
  SiDjango, 
  SiSupabase, 
  SiVercel,
  SiPostgresql, 
  SiGit, 
  SiDocker,
  SiPandas, 
  SiNumpy, 
  SiPlotly, 
  SiJupyter
} from 'react-icons/si';

export default function Skills() {
  const skillCategories = [
    {
      title: "Programming Languages",
      items: [
        {
          name: "Python",
          description: "Data analysis, web development",
          icon: SiPython
        },
        {
          name: "JavaScript",
          description: "Frontend and backend development",
          icon: SiJavascript
        },
        {
          name: "TypeScript",
          description: "Type-safe JavaScript development",
          icon: SiTypescript
        },
        {
          name: "R",
          description: "Statistical analysis and visualization",
          icon: SiR
        }
      ]
    },
    {
      title: "Frontend Development",
      items: [
        {
          name: "React",
          description: "Component-based UI development",
          icon: SiReact
        },
        {
          name: "Next.js",
          description: "Full-stack React framework",
          icon: SiNextdotjs
        },
        {
          name: "Astro",
          description: "Static site generation",
          icon: SiAstro
        },
        {
          name: "Tailwind CSS",
          description: "Utility-first CSS framework",
          icon: SiTailwindcss
        }
      ]
    },
    {
      title: "Backend & Cloud",
      items: [
        {
          name: "Node.js",
          description: "Server-side JavaScript runtime",
          icon: SiNodedotjs
        },
        {
          name: "Django",
          description: "Python web framework",
          icon: SiDjango
        },
        {
          name: "Supabase",
          description: "Backend as a Service",
          icon: SiSupabase
        },
        {
          name: "Vercel",
          description: "Deployment and hosting platform",
          icon: SiVercel
        }
      ]
    },
    {
      title: "Database & Tools",
      items: [
        {
          name: "PostgreSQL",
          description: "Relational database management",
          icon: SiPostgresql
        },
        {
          name: "Git",
          description: "Version control system",
          icon: SiGit
        },
        {
          name: "Docker",
          description: "Containerization platform",
          icon: SiDocker
        }
      ]
    },
    {
      title: "Data Science & Analytics",
      items: [
        {
          name: "Pandas",
          description: "Data manipulation and analysis",
          icon: SiPandas
        },
        {
          name: "NumPy",
          description: "Numerical computing",
          icon: SiNumpy
        },
        {
          name: "Plotly",
          description: "Interactive data visualization",
          icon: SiPlotly
        },
        {
          name: "Jupyter",
          description: "Interactive computing environment",
          icon: SiJupyter
        }
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
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
