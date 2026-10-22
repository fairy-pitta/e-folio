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

export interface CvCaseStudy {
  title: string
  // One line for the closed accordion.
  summary: string
  tags: string[]
  problem: string
  role: string
  // The body of the case study: what was decided, and why.
  decisions: string[]
  outcome: string
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
  // Three short lines under the name: what to hire for, in the reader's terms.
  strengths: string[]
  availability: string
  // Industry only: no client names, screenshots or code (see the design doc).
  caseStudies: CvCaseStudy[]
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
    "Solutions architect and software engineer in Singapore. As lead engineer and project manager, I work on data modelling, cloud architecture and LLM agent design, and take systems through to delivery. I also lead and mentor the engineers who build them.",
  strengths: [
    "Designs LLM agents and the evaluation that keeps them reliable",
    "Designs AWS systems from the data model to deployment",
    "Works with clients to turn requirements into features, and leads the team that builds them",
  ],
  availability: "Available from April 2027",
  caseStudies: [
    {
      title: "LLM agent for a financial management SaaS",
      summary: "A tool-calling agent that answers finance questions over customer accounting data.",
      tags: ["Vue", "Django", "PostgreSQL", "AWS"],
      problem:
        "A client-commissioned reporting platform turns annual P&L statements into information a business can act on. It needed an agent that answers finance questions over each customer's accounting data. An agent that calls tools to fetch data will still write a confident answer when a tool returns nothing, or returns the wrong thing.",
      role:
        "Principal engineer and project manager. I led a team of nine engineers, was the client's direct technical contact, designed the architecture and owned code review.",
      decisions: [
        "Every tool has a typed output contract with three outcomes: valid, empty or invalid. The agent answers only from a valid result. An empty or invalid result is handled as such, instead of being passed to the model as if it were data.",
        "A golden-set harness runs a fixed set of questions with known answers against every prompt or model change, so a change that makes the answers worse is caught before release.",
      ],
      outcome: "The agent is in development. Its production launch is planned for April 2027.",
    },
    {
      title: "Document AI for revising condominium bylaws",
      summary: "OCR and an LLM turn scanned bylaws into a revised draft in Word.",
      tags: ["Next.js", "Python", "GCP", "Azure"],
      problem:
        "A Japanese property-management group revises condominium management bylaws against the standard bylaws. The bylaws it starts from are scanned paper documents.",
      role: "Architect, and reviewer of the code that the delivery engineers write.",
      decisions: [
        "The work has three steps: OCR of the scanned bylaws, comparison with the standard bylaws by an LLM, and export to Word. Each step is slow and fails in its own way, so I split them into three services (OCR, revision and export) joined by a file-handoff contract. A step that fails can be retried on its own, without running the steps before it again.",
        "OCR and LLM output will sometimes be partly wrong. I designed how those outputs are handled so that a person can check them before they are used.",
      ],
      outcome:
        "The system takes a scanned set of bylaws to a revised draft in Word, which a person checks before use. I continue to review the delivery engineers' implementations.",
    },
    {
      title: "Operations platform for a tuition centre",
      summary: "Member records, monthly invoices and messaging in one system, replacing invoicing in Excel.",
      tags: ["Cloudflare", "Hono"],
      problem:
        "The centre produced its monthly invoices from Excel by hand. The work took hours every month, and roughly one invoice in ten had an error.",
      role: "Sole engineer and operator. I built the system and I still run it.",
      decisions: [
        "Member records, invoices and messages live in one system, so each invoice is generated from the same member record that the message goes to, instead of being copied between spreadsheets.",
        "Messages go out over email, WhatsApp and SMS from the same place, so a family is reached on the channel it uses.",
      ],
      outcome:
        "The system sends around 100 invoices a month. It saves about five hours of manual work every month, and invoicing errors went from roughly 10% to near zero. It is in production use across the centre's operations.",
    },
  ],
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
      degree: "BSc (Honours), First Class",
      period: "Aug 2019 – May 2023",
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
      period: "Aug 2017 – May 2019",
    },
    {
      school: "Nishiyamato Gakuen",
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
  ],
  awards: [
    { title: "CIN Outstanding Volunteer, NParks", period: "2021, 2022" },
    { title: "Singapore Bird Race — 2nd, Novice category", period: "2021" },
    { title: "Singapore Bird Race — 4th, Marathon category", period: "2023" },
    { title: "Singapore Bird Race — 3rd, Marathon category", period: "2024, 2025" },
  ],
  skills: [
    { label: "Languages", items: ["Python", "TypeScript", "R"] },
    { label: "Frameworks", items: ["Django", "React", "Hono"] },
    { label: "Cloud", items: ["AWS", "Cloudflare", "Vercel", "Supabase"] },
    { label: "Data", items: ["PostgreSQL", "SQLite"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)", "Spanish (beginner)"] },
    { label: "Licence", items: ["Singapore Class 3CA driving licence (2024)"] },
  ],
}

// Throws at build time rather than rendering a dead link.
export function linkHref(label: string): string {
  const link = cv.links.find((candidate) => candidate.label === label)
  if (!link) throw new Error(`No link labelled ${label} in cv.links`)
  return link.href
}
