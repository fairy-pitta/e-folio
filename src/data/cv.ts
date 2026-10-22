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

export interface CvCertification {
  name: string
  year: string
  // English explainer for the issuing body — the IPA exams in particular are
  // Japanese national qualifications that need introducing abroad.
  href: string
}

export interface CvAward {
  title: string
  period: string
}

export interface Cv {
  name: string
  handle: string
  headline: string
  location: string
  // One sentence for the places that introduce the site rather than show it:
  // the meta description, the social card and llms.txt. Kept under 155
  // characters so search results do not truncate it.
  tagline: string
  links: CvLink[]
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  certifications: CvCertification[]
  awards: CvAward[]
  skills: CvSkillGroup[]
}

// Source: career-ops/cv.md. Keep address, visa status, client names and figures,
// GPA, the employer's name, the phone number and the email address out of this
// file: the site is public, the PDF CV is not (src/lib/public-safety.ts).
export const cv: Cv = {
  name: "Shuna Maekawa",
  handle: "fairy-pitta",
  headline: "Software Engineer & Project Manager",
  location: "Singapore",
  tagline:
    "Shuna Maekawa (fairy-pitta) — software engineer and project manager in Singapore, working on software architecture, database design and cloud.",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shunamaekawa" },
    { label: "GitHub", href: "https://github.com/fairy-pitta" },
  ],
  summary:
    "I am a software engineer and project manager at a tuition centre in Singapore. I found the joy of data wrangling at university while majoring in Environmental Studies, and I have worked half as a teacher and half as an engineer ever since. Software architecture, database design and cloud infrastructure are what I care about most — the certifications below reflect that. Through this work I want to make a difference in people's lives.",
  experience: [
    {
      role: "Software Engineer & Project Manager",
      org: "A software company in Singapore, part of a Japanese group",
      period: "Dec 2023 – Present",
      bullets: [
        "About half of the role is software engineering and project management, and half is one-on-one tuition.",
        "Led engineering teams across client and internal projects, from scoping to delivery.",
        "Principal engineer and project manager on a financial management SaaS, architect and reviewer on a document-revision AI platform, and sole engineer and operator of a tuition centre's operations platform. The case studies above cover each one.",
        "Designed the engineering onboarding process, and have run training for incoming intern engineers several times.",
        "Teach mathematics, English, science and computer science one-on-one, from Grade 1 to Grade 12.",
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
    {
      name: "AWS Certified Solutions Architect – Professional",
      year: "2026",
      href: "https://aws.amazon.com/certification/certified-solutions-architect-professional/",
    },
    {
      name: "AWS Certified Generative AI Developer – Professional",
      year: "2026",
      href: "https://aws.amazon.com/certification/certified-generative-ai-developer-professional/",
    },
    {
      name: "AWS Certified Solutions Architect – Associate",
      year: "2025",
      href: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    },
    { name: "IPA Database Specialist", year: "2024", href: "https://www.ipa.go.jp/en/about/it-talents/itee.html" },
    { name: "IPA Applied Information Technology Engineer", year: "2024", href: "https://www.ipa.go.jp/en/about/it-talents/itee.html" },
    { name: "IPA Fundamental Information Technology Engineer", year: "2023", href: "https://www.ipa.go.jp/en/about/it-talents/itee.html" },
    {
      name: "Singapore Class 3CA driving licence",
      year: "2024",
      href: "https://www.police.gov.sg/Knowledge-Hub/Traffic/Traffic-Matters/Singapore-Driving-Licence",
    },
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
    { label: "Cloud", items: ["AWS", "Cloudflare", "Vercel", "Supabase"] },
    { label: "Data", items: ["PostgreSQL", "SQLite"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)"] },
  ],
}

// Throws at build time rather than rendering a dead link.
export function linkHref(label: string): string {
  const link = cv.links.find((candidate) => candidate.label === label)
  if (!link) throw new Error(`No link labelled ${label} in cv.links`)
  return link.href
}
