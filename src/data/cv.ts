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
  country: string
  degree: string
  period: string
  bullets?: string[]
}

export interface CvSkillGroup {
  label: string
  items: string[]
}

export interface CvAward {
  title: string
  period: string
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
  awards: CvAward[]
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
    "Full-stack engineer working across React, TypeScript and Python, from database design to deployment. Currently building client and internal systems at WAO Singapore.",
  experience: [
    {
      role: "Software Engineer",
      org: "WAO Singapore / WAO Tech (WAO Corporation group)",
      period: "Dec 2023 – Present",
      bullets: [
        "Lead engineer on an accounting and budgeting SaaS for an external client (Django, Vue 3, PostgreSQL, AWS) — largest contributor over 15 months. Clean Architecture / DDD backend, Feature-Sliced frontend, AWS CDK infrastructure with OIDC-based GitHub Actions deploys, Playwright E2E and visual regression tests.",
        "Sole developer of the tuition centre's operations platform (Hono, Drizzle, Cloudflare Workers / D1 / R2, React 19): member management, monthly invoicing with PDF generation, and email / WhatsApp messaging — replacing a manual spreadsheet workflow. Around 2,000 automated tests including contract and real-API E2E; halved the Worker bundle (2.6 MB → 1.2 MB).",
        "Built parts of an AI document-revision pipeline for a client: OCR (Azure Document Intelligence) and an LLM (Claude on AWS Bedrock) turn scanned rules into Word files with tracked changes. Worked on test infrastructure, the storage migration and OCR accuracy evaluation.",
        "Maintain the tuition centre's public website: custom WordPress theme with headless CMS content, SEO and performance work, and visual regression tests.",
        "Automated back-office work: scanned-document sorting, exam-paper collection, and email archiving on AWS SES / Lambda.",
        "Ran an internal session for the engineering team on agentic coding with Claude Code.",
        "Also teach maths, English, science and introductory programming one-on-one.",
      ],
    },
    {
      role: "Part-time Keeper",
      org: "Mandai Wildlife Group",
      period: "May 2022 – Apr 2023",
      bullets: [
        "Husbandry and exhibit maintenance for 3,000+ stick insects in the invertebrate section.",
        "Population estimates, behavioural management, and ex-situ conservation research on the best environmental conditions for stick insects.",
      ],
    },
    {
      role: "Administrative Assistant",
      org: "Osaka Prefectural Government",
      period: "May 2020 – Jul 2020",
      bullets: [
        "COVID-19 response support: translated official documents between Japanese and English and checked data integrity.",
      ],
    },
    {
      role: "Student Research Associate",
      org: "Yale-NUS Ecology Adaptation Lab",
      period: "Dec 2019 – Dec 2022",
      bullets: [
        "Led field research on Oriental pied hornbills: data collection, vocalisation classification, and individual identification from facial features using pattern recognition.",
        "Built a Zooniverse citizen-science workflow to test crowd-sourced identification.",
        "Maintained phasmid colonies and supported related data collection.",
      ],
    },
    {
      role: "Part-time Tutor",
      org: "WAO Singapore",
      period: "Sep 2019 – Apr 2023",
      bullets: [
        "One-on-one tutoring for Japanese students (primary to high school) in maths, English, science and basic programming.",
      ],
    },
  ],
  education: [
    {
      school: "Yale-NUS College",
      country: "Singapore",
      degree: "BSc (Hons), First Class Honours",
      period: "2019 – 2023",
      bullets: [
        "Major in Environmental Studies",
        "Minor in Mathematical, Computational & Statistical Science",
        "MOE Tuition Grant recipient",
        "Capstone study on how traffic noise along the Bukit Timah Expressway affects bird vocalisations, using autonomous recording stations in nature parks",
      ],
    },
    {
      school: "United World College Costa Rica",
      country: "Costa Rica",
      degree: "International Baccalaureate Diploma",
      period: "2017 – 2019",
    },
    {
      school: "Nishiyamato Gakuen Academy",
      country: "Japan",
      degree: "Junior and senior high school",
      period: "2013 – 2017",
    },
  ],
  certifications: [
    "AWS Certified Solutions Architect – Professional (2026)",
    "AWS Certified Generative AI Developer – Professional (2026)",
    "AWS Certified Solutions Architect – Associate (2025)",
    "IPA Database Specialist (2024)",
    "IPA Applied Information Technology Engineer (2024)",
    "IPA Fundamental Information Technology Engineer (2023)",
    "Singapore Class 3CA driving licence (2024)",
  ],
  awards: [
    { title: "CIN Outstanding Volunteer, NParks", period: "2021, 2022" },
    { title: "Singapore Bird Race — 2nd, Novice category", period: "2021" },
    { title: "Singapore Bird Race — 4th, Marathon category", period: "2023" },
    { title: "Singapore Bird Race — 3rd, Marathon category", period: "2024, 2025" },
  ],
  skills: [
    { label: "Languages", items: ["Python", "TypeScript", "R"] },
    { label: "Frameworks", items: ["React", "Next.js", "Vue", "Hono", "Django"] },
    { label: "Cloud", items: ["AWS", "Cloudflare Workers / Pages", "Vercel", "Supabase"] },
    { label: "Data", items: ["PostgreSQL", "SQLite", "SQL modelling"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)"] },
  ],
}
