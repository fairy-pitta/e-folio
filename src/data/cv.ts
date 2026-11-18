export interface CvLink {
  label: string
  href: string
}

export interface CvExperience {
  // Referenced by the `job` of the projects in content/work done in this job,
  // which the About page shows under it.
  id?: string
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
  // The home page's heading: the role and its reach, in two short sentences.
  statement: string
  // One sentence under the home page's heading: what the role involves.
  pitch: string
  // Three short lines under the name: what to hire for, in the reader's terms.
  strengths: string[]
  availability: string
  // The contact page's list of what to get in touch about: the strengths,
  // written as things a reader might bring.
  contactTopics: string[]
  experience: CvExperience[]
  education: CvEducation[]
  certifications: CvCertification[]
  awards: CvAward[]
  skills: CvSkillGroup[]
}

// Source: the CV. The projects from the job are in content/work, under the same
// rules. Keep address, visa status, client names and figures,
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
  statement: "Lead engineer and project manager. From the data model to delivery.",
  pitch: "I turn client requirements into features, design the system, and review the team's code.",
  strengths: [
    "Designs LLM agents and the evaluation that keeps them reliable",
    "Designs AWS systems from the data model to deployment",
    "Works with clients to turn requirements into features, and leads the team that builds them",
  ],
  availability: "Available from April 2027",
  contactTopics: [
    "Designing an LLM agent, and the evaluation that keeps it reliable",
    "Designing an AWS system, from the data model to deployment",
    "Turning a client's requirements into features, and leading the team that builds them",
  ],
  experience: [
    {
      id: "lead-engineer",
      role: "Lead Engineer & Project Manager",
      org: "A software company in Singapore, part of a Japanese group",
      period: "Dec 2023 – Present",
      bullets: [
        "Led engineering teams across client and internal projects, from scoping to delivery.",
        "Designed the engineering onboarding process, and have run training for incoming intern engineers several times.",
        "Part of the role is one-on-one tuition in mathematics, English, science and computer science.",
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

// The job held now: the first entry, whose period runs to the present.
export function currentJob(): CvExperience {
  const job = cv.experience[0]
  if (!job || !/present/i.test(job.period)) throw new Error("cv.experience[0] is not a current job")
  return job
}

// Throws at build time rather than showing a certification the CV does not list.
export function certification(name: string): CvCertification {
  const found = cv.certifications.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`No certification named ${name} in cv.certifications`)
  return found
}

// The jobs that projects in content/work can name as their `job`, in CV order.
export function jobIds(): string[] {
  return cv.experience.flatMap((job) => (job.id ? [job.id] : []))
}
