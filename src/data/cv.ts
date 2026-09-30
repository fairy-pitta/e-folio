export interface CvLink {
  label: string
  href: string
}

export interface CvExperience {
  role: string
  org: string
  period: string
  bullets: string[]
}

export interface CvEducation {
  school: string
  degree: string
  period: string
  note?: string
}

export interface CvSkillGroup {
  label: string
  items: string[]
}

export interface Cv {
  name: string
  handle: string
  headline: string
  email: string
  links: CvLink[]
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  certifications: string[]
  skills: CvSkillGroup[]
}

// Source: career-ops/cv.md. Keep address, visa status, client figures and GPA out of this file.
export const cv: Cv = {
  name: "Shuna Maekawa",
  handle: "fairy-pitta",
  headline: "Software Engineer · Singapore",
  email: "shuna120700@gmail.com",
  links: [
    { label: "Email", href: "mailto:shuna120700@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shunamaekawa" },
    { label: "GitHub", href: "https://github.com/fairy-pitta" },
    { label: "Qiita", href: "https://qiita.com/Pitta" },
  ],
  summary:
    "Full-stack engineer working across React, TypeScript, Python and Go, from database design to deployment. Currently leading engineering on client-facing systems at WAO Singapore.",
  experience: [
    {
      role: "Software Engineer",
      org: "WAO Singapore",
      period: "Dec 2023 – Present",
      bullets: [
        "Led a team of 3 building an invoicing and customer-communication platform on React and Hono (Cloudflare Workers), replacing a manual spreadsheet workflow.",
        "Project manager and lead engineer for a financial system built for an external client: architecture, client communication and task allocation.",
        "Also teach maths, English, science and introductory programming one-on-one.",
      ],
    },
    {
      role: "Part-time Keeper",
      org: "Mandai Wildlife Group",
      period: "May 2022 – Apr 2023",
      bullets: [],
    },
    {
      role: "Administrative Assistant",
      org: "Osaka Prefectural Government",
      period: "May 2020 – Jul 2020",
      bullets: [],
    },
    {
      role: "Student Research Associate",
      org: "Yale-NUS Ecology Adaptation Lab",
      period: "Dec 2019 – Dec 2022",
      bullets: [
        "Classified hornbill vocalisations and identified individuals from acoustic features.",
        "Built a Zooniverse citizen-science workflow to test crowd-sourced identification.",
      ],
    },
    {
      role: "Part-time Tutor",
      org: "WAO Singapore",
      period: "Sep 2019 – Apr 2023",
      bullets: [],
    },
  ],
  education: [
    {
      school: "Yale-NUS College",
      degree: "BSc (Hons) Environmental Studies, First Class Honours",
      period: "2019 – 2023",
      note: "Minor in Mathematical, Computational & Statistical Science",
    },
    {
      school: "United World College Costa Rica",
      degree: "International Baccalaureate Diploma",
      period: "2017 – 2019",
    },
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "IPA Database Specialist",
    "IPA Applied Information Technology Engineer",
    "IPA Fundamental Information Technology Engineer",
  ],
  skills: [
    { label: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "Rust", "R"] },
    { label: "Frameworks", items: ["React", "Next.js", "Vue", "Hono", "Django"] },
    { label: "Cloud", items: ["AWS", "Cloudflare Workers / Pages", "Vercel", "Supabase"] },
    { label: "Data", items: ["PostgreSQL", "SQLite", "SQL modelling"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)"] },
  ],
}
