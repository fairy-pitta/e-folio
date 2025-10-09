"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Code2Icon, BarChartIcon, GlobeIcon, LeafIcon, CloudIcon, LayoutIcon, ServerIcon } from "lucide-react"
import { useState } from "react"

export default function Skills() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const skills = [
    {
      category: "Programming Languages",
      icon: <Code2Icon className="h-8 w-8 text-blue-500" />,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-500",
      borderColor: "border-blue-300",
      hoverBg: "group-hover:bg-blue-50",
      items: [
        {
          name: "Python",
          description: "Data processing, Web development (Django)",
          simpleIconSlug: "python",
          color: "#3776AB",
        },
        {
          name: "R",
          description: "Statistical analysis, visualization, research",
          simpleIconSlug: "r",
          color: "#276DC3",
        },
        {
          name: "JavaScript",
          description: "Interactive web development",
          simpleIconSlug: "javascript",
          color: "#F7DF1E",
        },
        {
          name: "HTML/CSS",
          description: "Frontend fundamentals",
          simpleIconSlug: "html5",
          color: "#E34F26",
        },
      ],
    },
    {
      category: "Frameworks & Libraries",
      icon: <LayoutIcon className="h-8 w-8 text-purple-500" />,
      color: "from-purple-500 to-pink-600",
      textColor: "text-purple-500",
      borderColor: "border-purple-300",
      hoverBg: "group-hover:bg-purple-50",
      items: [
        {
          name: "React",
          description: "Component-based frontend development",
          simpleIconSlug: "react",
          color: "#61DAFB",
        },
        {
          name: "Next.js",
          description: "Full-stack React framework with routing & SSR/ISR",
          simpleIconSlug: "nextdotjs",
          color: "#000000",
        },
        {
          name: "Tailwind CSS",
          description: "Utility-first CSS framework for responsive design",
          simpleIconSlug: "tailwindcss",
          color: "#06B6D4",
        },
        {
          name: "Django",
          description: "Web apps & API development",
          simpleIconSlug: "django",
          color: "#092E20",
        },
      ],
    },
    {
      category: "Backend / Cloud Services",
      icon: <CloudIcon className="h-8 w-8 text-cyan-500" />,
      color: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-500",
      borderColor: "border-cyan-300",
      hoverBg: "group-hover:bg-cyan-50",
      items: [
        {
          name: "Supabase",
          description: "Backend-as-a-Service: authentication, database, storage",
          simpleIconSlug: "supabase",
          color: "#3ECF8E",
        },
        {
          name: "AWS",
          description: "Cloud infrastructure setup, server deployment, and scaling",
          customIcon: <ServerIcon className="h-5 w-5 text-orange-500" />,
        },
        {
          name: "Vercel",
          description: "Frontend hosting and CI/CD for React & Next.js",
          simpleIconSlug: "vercel",
          color: "#000000",
        },
        {
          name: "Cloudflare",
          description: "Global CDN, DNS, security, and hosting",
          simpleIconSlug: "cloudflare",
          color: "#F38020",
        },
      ],
    },
    {
      category: "Data Analysis",
      icon: <BarChartIcon className="h-8 w-8 text-green-500" />,
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-500",
      borderColor: "border-green-300",
      hoverBg: "group-hover:bg-green-50",
      items: [
        {
          name: "Python",
          description: "Experienced in data cleaning, analysis, and basic machine learning using Python",
          simpleIconSlug: "python",
          color: "#150458",
        },
        {
          name: "RStudio",
          description: "Skilled in statistical analysis and data visualization using R",
          simpleIconSlug: "r",
          color: "#276DC3",
        },
        {
          name: "Data Visualization",
          description: "Creating insightful visualizations with various libraries",
          simpleIconSlug: "plotly",
          color: "#3F4F75",
        },
      ],
    },
    {
      category: "Languages",
      icon: <GlobeIcon className="h-8 w-8 text-amber-500" />,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-500",
      borderColor: "border-amber-300",
      hoverBg: "group-hover:bg-amber-50",
      items: [
        {
          name: "English",
          description: "Fluent",
          customIcon: (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-600"
            >
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M3.5 12H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 3.5V20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18.5 7L5.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18.5 17L5.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          name: "Japanese",
          description: "Native",
          customIcon: (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "Environmental Science",
      icon: <LeafIcon className="h-8 w-8 text-emerald-500" />,
      color: "from-emerald-500 to-green-600",
      textColor: "text-emerald-500",
      borderColor: "border-emerald-300",
      hoverBg: "group-hover:bg-emerald-50",
      items: [
        {
          name: "Avian Ethology",
          description: "Research and observation of bird behavior",
          customIcon: (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-emerald-600"
            >
              <path
                d="M12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10C8 7.79086 9.79086 6 12 6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 15C16 16.6569 14.2091 18 12 18C9.79086 18 8 16.6569 8 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10.5C3 9.67157 3.67157 9 4.5 9C5.32843 9 6 9.67157 6 10.5C6 11.3284 5.32843 12 4.5 12C3.67157 12 3 11.3284 3 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M18 10.5C18 9.67157 18.6716 9 19.5 9C20.3284 9 21 9.67157 21 10.5C21 11.3284 20.3284 12 19.5 12C18.6716 12 18 11.3284 18 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M6 10L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M16 10L18 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 3L14 5L12 6L10 5L12 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
        {
          name: "Ecology",
          description: "Environmental systems analysis and monitoring",
          customIcon: (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-emerald-600"
            >
              <path
                d="M9 20H7C5.89543 20 5 19.1046 5 18V15M9 20H15M9 20V15M15 20H17C18.1046 20 19 19.1046 19 18V15M15 20V15M5 15H9M5 15V9C5 7.89543 5.89543 7 7 7H9M19 15H15M19 15V9C19 7.89543 18.1046 7 17 7H15M9 15V7M9 7H15M15 7V15M15 15H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 7V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        },
        {
          name: "Bioacoustics",
          description: "Acoustic monitoring of animal behavior",
          customIcon: (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-emerald-600"
            >
              <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 16V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 16V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M3 10L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 18L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M21 10L19 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 14L19 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 18L19 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen py-20 relative overflow-hidden flex items-center">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-sky-800">Skills & Expertise</h2>
          <p className="text-muted-foreground text-sky-600 max-w-2xl mx-auto">
            If you think my skills might be helpful for your work, feel free to reach out. I'm always open to bird-related ideas,
            projects, or collaborations — happy to connect anytime!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                className={`h-full relative overflow-hidden transition-all duration-300 transform ${
                  hoveredCard === index ? "scale-105 shadow-xl" : "hover:shadow-lg"
                } border-transparent`}
              >
                {/* 背景グラデーション */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                {/* 装飾的な要素 */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-white/20 blur-xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-white/5 to-white/10 blur-xl"></div>

                <CardContent className="p-6 relative z-10">
                  <div
                    className={`flex items-center gap-4 mb-6 pb-4 border-b ${skill.borderColor} transition-colors duration-300`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${skill.hoverBg} bg-white/80 transition-colors duration-300`}
                    >
                      {skill.icon}
                    </div>
                    <h3 className={`text-xl font-bold ${skill.textColor}`}>{skill.category}</h3>
                  </div>

                  <ul className="space-y-5">
                    {skill.items.map((item) => (
                      <motion.li
                        key={item.name}
                        className="flex items-start gap-3 group/item"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {item.customIcon ? (
                            <div className="w-8 h-8 flex items-center justify-center bg-white/80 rounded-md shadow-sm group-hover/item:shadow-md transition-all duration-300">
                              {item.customIcon}
                            </div>
                          ) : item.simpleIconSlug ? (
                            <div className="w-8 h-8 flex items-center justify-center bg-white/80 rounded-md shadow-sm group-hover/item:shadow-md transition-all duration-300">
                              <img
                                src={`https://cdn.simpleicons.org/${item.simpleIconSlug}/${item.color.replace("#", "")}`}
                                alt={item.name}
                                className="w-5 h-5 group-hover/item:scale-110 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mt-2"></div>
                          )}
                        </div>
                        <div>
                          <span className={`font-semibold ${skill.textColor}`}>{item.name}</span>
                          {item.description && (
                            <p className="text-sm text-muted-foreground group-hover/item:text-gray-700 dark:group-hover/item:text-gray-300 transition-colors duration-300">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>

                  {/* 装飾的なアクセント */}
                  <div
                    className={`absolute bottom-3 right-3 w-16 h-16 rounded-full bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 transition-all duration-500 transform group-hover:scale-150`}
                  ></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
