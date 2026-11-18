// The shape of every content file, shared by the content collections
// (src/content.config.ts) and the tests that read the same files from disk
// (src/lib/content-files.ts), so a typo in front matter fails both.

import { existsSync } from "node:fs"
import path from "node:path"
import { z } from "astro/zod"
import { cv } from "../data/cv"
import { parseContentDate } from "./content"

const PUBLIC_DIR = path.join(process.cwd(), "public")

// Front matter dates come in several formats ("April 5, 2026", "13 Jan, 2026",
// "2025-05-18", or a Date from unquoted YAML). Anything unreadable is passed on
// unchanged so z.date() reports it.
const contentDate = z.preprocess((value) => {
  try {
    return parseContentDate(value, "front matter")
  } catch {
    return value
  }
}, z.date())

const text = z.string().trim().min(1)

// A site-absolute path must point at a file that scripts/optimize-media.mjs
// wrote into public/; a full URL is taken as it is.
const mediaPath = text.refine(
  (src) => /^https?:\/\//.test(src) || (src.startsWith("/") && existsSync(path.join(PUBLIC_DIR, path.normalize(src)))),
  (src) => ({ message: `No such file under public/: ${src}` }),
)

const url = z.string().trim().url()

export const caseStudySchema = z
  .object({
    problem: text,
    role: text,
    // What was decided, and why.
    decisions: z.array(text).min(1),
    outcome: text,
  })
  .strict()

const shared = {
  title: text,
  // One line under the title, on the card and the project page.
  summary: text,
  // One line on the card: an outcome where there is one, otherwise the engineering choice.
  highlight: text.max(80),
  tags: z.array(text).default([]),
  // What it runs on, for the specimen label: "Browser · Rust/WASM".
  stack: text.optional(),
  // Older or retired work, listed briefly below the main grid.
  earlier: z.boolean().optional(),
}

export const personalWorkSchema = z
  .object({
    kind: z.literal("personal"),
    ...shared,
    case: caseStudySchema.optional(),
    date: contentDate,
    media: z
      .object({
        cover: mediaPath.optional(),
        gallery: z.array(mediaPath).default([]),
      })
      .strict()
      .default({}),
    links: z
      .object({
        // A demo to try: the only link that earns a LIVE stamp.
        live: url.optional(),
        code: url.optional(),
        // Where it is distributed, such as npm.
        package: url.optional(),
        // A write-up hosted elsewhere, such as a Qiita article.
        article: z.object({ url, label: text }).strict().optional(),
      })
      .strict()
      .default({}),
  })
  .strict()

// Work from the job. Industry only: no client names, screenshots or code, so
// there is nothing to link to and nothing to show.
function jobWorkSchema<K extends "client" | "internal">(kind: K) {
  return z
    .object({
      kind: z.literal(kind),
      ...shared,
      case: caseStudySchema,
      // The id of the cv.ts experience entry this was done in.
      job: text.refine((id) => cv.experience.some((job) => job.id === id), (id) => ({
        message: `No cv.experience entry with id ${id}`,
      })),
      // The short form of the role on the card.
      roleLabel: text,
      // Who built it, for the Team row of the project's page. Only when the
      // case study states it.
      team: text.optional(),
      // Where it stands now, for the Status row, as the outcome states it.
      status: text.optional(),
      // Position among the job's projects, lowest first.
      order: z.number().int(),
      media: z.never().optional(),
      links: z.never().optional(),
    })
    .strict()
}

export const clientWorkSchema = jobWorkSchema("client")
export const internalWorkSchema = jobWorkSchema("internal")

export const workSchema = z.discriminatedUnion("kind", [personalWorkSchema, clientWorkSchema, internalWorkSchema])

export const blogSchema = z
  .object({
    title: text,
    date: contentDate,
    excerpt: text,
    // May point at a generated /og/ card, which is not in public/.
    coverImage: text.optional(),
    readTime: text.optional(),
    tags: z.array(text).default([]),
    // Drafts stay in the repo but are not built into any page, feed or image.
    draft: z.boolean().optional(),
  })
  .strict()

export type CaseStudy = z.infer<typeof caseStudySchema>
export type WorkData = z.infer<typeof workSchema>
export type PersonalWorkData = z.infer<typeof personalWorkSchema>
export type JobWorkData = z.infer<typeof clientWorkSchema> | z.infer<typeof internalWorkSchema>
export type BlogData = z.infer<typeof blogSchema>
