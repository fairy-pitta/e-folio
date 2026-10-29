export interface CvLink {
  label: string
  href: string
}

export interface CvExperience {
  role: string
  org: string
  period: string
  bullets: string[]
  // Shown under the role as nested accordions. Industry only: no client names,
  // screenshots or code (see the design doc).
  projects?: CvProject[]
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

export interface CvProject {
  // Anchor on the About page, which the Work page's job cards link to.
  id: string
  title: string
  // One line for the closed accordion.
  summary: string
  tags: string[]
  // Built for the employer itself rather than for a client.
  internal?: boolean
  // The short forms on the Work page's job cards.
  roleLabel: string
  highlight: string
  problem: string
  role: string
  // The body of the project: what was decided, and why.
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
  // One sentence at the top of the Work page: what to hire for.
  pitch: string
  // Three short lines under the name: what to hire for, in the reader's terms.
  strengths: string[]
  availability: string
  experience: CvExperience[]
  education: CvEducation[]
  certifications: CvCertification[]
  awards: CvAward[]
  skills: CvSkillGroup[]
}

// Source: the CV. Keep address, visa status, client names and figures,
// grades, the employer's name, the phone number and the email address out of this
// file: the site is public, the PDF CV is not (src/lib/public-safety.ts; the
// specific terms live in the gitignored .private-terms.txt).
export const cv: Cv = {
  name: "Shuna Maekawa",
  handle: "fairy-pitta",
  headline: "Software Engineer & Project Manager",
  location: "Singapore",
  tagline:
    "Shuna Maekawa (fairy-pitta), software engineer and project manager in Singapore. I design systems from the data model to deployment and build them.",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shunamaekawa" },
    { label: "GitHub", href: "https://github.com/fairy-pitta" },
  ],
  summary:
    "Software engineer and project manager in Singapore. I design systems from the data model to deployment and build them. Most recently, that was a financial reporting SaaS with an LLM agent, which I designed from scratch and built with a team of engineers. I studied ecology at Yale-NUS, and hence my personal projects often involve birds and sound.",
  pitch:
    "I design LLM agents and AWS systems, from the data model to delivery, and lead the teams that build them.",
  strengths: [
    "Designs LLM agents and the evaluation that keeps them reliable",
    "Designs AWS systems from the data model to deployment",
    "Works with clients to turn requirements into features, and leads the team that builds them",
  ],
  availability: "Available from April 2027",
  experience: [
    {
      role: "Lead Engineer & Project Manager",
      org: "A software company in Singapore, part of a Japanese group",
      period: "Dec 2023 – Present",
      bullets: [
        "Led engineering teams across client and internal projects, from scoping to delivery.",
        "Designed the engineering onboarding process, and have run training for incoming intern engineers several times.",
        "Part of the role is one-on-one tuition in mathematics, English, science and computer science.",
      ],
      projects: [
        {
          id: "finance-saas",
          title: "Financial reporting SaaS with an LLM agent",
          summary: "A reporting platform I designed and built from scratch, with an agent that answers finance questions.",
          tags: ["Vue", "Django", "PostgreSQL", "AWS"],
          roleLabel: "Designed and built it from scratch; led a team of 9",
          highlight: "Platform and agent designed from the data model up",
          problem:
            "A client asked for a reporting platform that turns yearly P&L statements into figures a business can act on. It also needed an agent that answers finance questions from each customer's accounting data. The agent calls tools to fetch that data. When a tool returns nothing, or the wrong thing, a model will still write an answer that sounds sure.",
          role:
            "Lead engineer and project manager. I designed the platform from scratch and built it, including the agent. I led a team of nine engineers, answered the client's technical questions directly and reviewed the team's code.",
          decisions: [
            "Each tool returns one of three results: valid, empty or invalid. The agent answers only from a valid result. When a result is empty or invalid, the agent says so instead of treating it as data.",
            "A fixed set of questions with known answers is run after every change to a prompt or model. If the answers get worse, we see it before release.",
          ],
          outcome: "The platform, including the agent, is in development. Its launch is planned for April 2027.",
        },
        {
          id: "document-ai",
          title: "Document AI for revising condominium bylaws",
          summary: "OCR and an LLM turn scanned bylaws into a revised draft in Word.",
          tags: ["Next.js", "Python", "GCP", "Azure"],
          roleLabel: "Architect & code reviewer",
          highlight: "OCR, revision and export run as three services that can be retried separately",
          problem:
            "A Japanese property-management group updates condominium bylaws so that they follow the standard bylaws. The bylaws it starts from are scans of paper documents.",
          role: "Architect. I also review the code that the delivery engineers write.",
          decisions: [
            "The work has three steps: read the scans with OCR, compare the text with the standard bylaws using an LLM, and export the result to Word. Each step is slow and fails in its own way, so each runs as a separate service, and the services pass files to each other in an agreed format. When one step fails, it can be run again without repeating the steps before it.",
            "OCR and LLM output is sometimes partly wrong, so I designed the flow so that a person checks it before it is used.",
          ],
          outcome:
            "The system is in use. It turns a scanned set of bylaws into a revised draft in Word, which a person checks before use. I still review the delivery engineers' code.",
        },
        {
          id: "tuition-ops",
          title: "Operations platform for a tuition centre",
          summary: "Member records, monthly invoices and messaging in one system, replacing invoicing in Excel.",
          tags: ["Cloudflare", "Hono"],
          internal: true,
          roleLabel: "Sole engineer & operator",
          highlight: "About 100 invoices a month, with errors down from 10% to almost none",
          problem:
            "The company runs a tuition centre, which made its monthly invoices by hand in Excel. This took hours every month, and about one invoice in ten had a mistake.",
          role: "I am the only engineer. I built the system and still run it.",
          decisions: [
            "Member records, invoices and messages are kept in one system. Each invoice is made from the same member record that the message is sent to, so nothing is copied between spreadsheets.",
            "Email, WhatsApp and SMS are sent from the same place, so each family gets messages on the channel it uses.",
          ],
          outcome:
            "The system sends around 100 invoices a month. It saves about five hours of manual work each month, and invoice errors went from roughly 10% to near zero. The centre uses it for its day-to-day work.",
        },
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
    { title: "Singapore Bird Race — 3rd in the Marathon category (2024, 2025), 4th (2023), 2nd in Novice (2021)", period: "2021 – 2025" },
  ],
  skills: [
    { label: "Languages", items: ["Python", "TypeScript", "R"] },
    { label: "Frameworks", items: ["Django", "React", "Next.js", "Hono"] },
    { label: "Cloud", items: ["AWS (EC2, S3, Bedrock, Amplify)", "Cloudflare", "Vercel", "Supabase"] },
    { label: "Tools", items: ["Docker"] },
    { label: "Data", items: ["PostgreSQL", "SQLite"] },
    { label: "Spoken", items: ["Japanese (native)", "English (fluent)", "Spanish (beginner)"] },
  ],
}

// Throws at build time rather than rendering a dead link.
export function linkHref(label: string): string {
  const link = cv.links.find((candidate) => candidate.label === label)
  if (!link) throw new Error(`No link labelled ${label} in cv.links`)
  return link.href
}
