import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { findForbidden } from '../../src/lib/public-safety'

const DIST = resolve(__dirname, '../../dist')

// Everything a reader, crawler or agent can read as text. Images and video are
// left out: the only generated images are the OG cards, drawn from page titles
// that the HTML carries too. Files with no extension (such as _headers) are
// read as text as well.
const TEXT_EXTENSIONS = new Set(['.html', '.txt', '.xml', '.js', '.mjs', '.css', '.json', '.svg', '.map', '.webmanifest'])

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function page(path: string): string {
  return readFileSync(join(DIST, path), 'utf8')
}

describe('built site', () => {
  it('test_read_dist_after_build_contains_home_page', () => {
    expect(existsSync(join(DIST, 'index.html')), 'run `pnpm build` first').toBe(true)
  })

  it('test_scan_text_files_in_dist_returns_no_forbidden_strings', () => {
    const leaks = walk(DIST)
      .filter((file) => (extname(file) === '' || TEXT_EXTENSIONS.has(extname(file))))
      .flatMap((file) =>
        findForbidden(readFileSync(file, 'utf8')).map((label) => `${relative(DIST, file)}: ${label}`),
      )
    expect(leaks).toEqual([])
  })

  it('test_list_project_routes_in_dist_excludes_ocr_vfs', () => {
    expect(existsSync(join(DIST, 'projects', 'OcrVfs'))).toBe(false)
    expect(existsSync(join(DIST, 'og', 'project-OcrVfs.png'))).toBe(false)
  })

  // Page-structure checks are added by later tasks below this line.

  it('test_render_contact_section_offers_cv_on_request_and_linkedin_fallback', () => {
    const home = page('index.html')
    expect(home).toContain('CV available on request.')
    expect(home).toContain('data-fallback="https://www.linkedin.com/in/shunamaekawa"')
    expect(home).not.toContain('data-email')
  })

  it('test_render_home_header_orders_strengths_availability_then_summary', () => {
    const home = page('index.html')
    const strengths = home.indexOf('Designs LLM agents and the evaluation that keeps them reliable')
    const availability = home.indexOf('Available from April 2027')
    const summary = home.indexOf('Solutions architect and software engineer in Singapore.')
    expect(strengths).toBeGreaterThan(-1)
    expect(availability).toBeGreaterThan(strengths)
    expect(summary).toBeGreaterThan(availability)
  })

  it('test_render_current_job_returns_three_closed_project_accordions_with_four_parts', () => {
    const home = page('index.html')
    const openings = home.match(/<details class="job experience-project"[^>]*>/g) ?? []
    expect(openings).toHaveLength(3)
    for (const opening of openings) expect(opening).not.toMatch(/\sopen\b/)
    for (const heading of ['Problem', 'My role', 'Key decisions', 'Outcome']) {
      const count = (home.match(new RegExp(`<dt[^>]*>${heading}</dt>`, 'g')) ?? []).length
      expect(count, heading).toBe(3)
    }
  })

  it('test_render_projects_nests_them_inside_current_job_in_experience', () => {
    const home = page('index.html')
    const experience = home.indexOf('>Experience</h2>')
    const currentJob = home.indexOf('A software company in Singapore, part of a Japanese group')
    const firstProject = home.indexOf('<details class="job experience-project"')
    const nextJob = home.indexOf('Mandai Wildlife Group')
    expect(experience).toBeGreaterThan(-1)
    expect(currentJob).toBeGreaterThan(experience)
    expect(firstProject).toBeGreaterThan(currentJob)
    expect(nextJob).toBeGreaterThan(firstProject)
  })

  it('test_render_home_without_case_studies_section_returns_no_mention', () => {
    for (const file of ['index.html', 'llms.txt']) {
      expect(page(file).toLowerCase(), file).not.toMatch(/case[ -]stud/)
    }
  })

  it('test_render_side_projects_returns_five_closed_accordions_with_links', () => {
    const home = page('index.html')
    const openings = home.match(/<details class="job side-project"[^>]*>/g) ?? []
    expect(openings).toHaveLength(5)
    for (const opening of openings) expect(opening).not.toMatch(/\sopen\b/)
    expect(home).toContain('href="https://sgbirdsmap.fairy-pitta.net"')
    expect(home).toContain('href="https://github.com/fairy-pitta/SGBirdMap"')
    expect(home).toContain('href="https://qiita.com/Pitta/items/4a6537a3450aa6f8f050"')
    expect(home).toContain('href="https://github.com/fairy-pitta/code-annotator"')
    expect(home).toContain('>Side projects</h2>')
  })

  it('test_render_home_and_404_without_blog_link_keeps_blog_page_built', () => {
    for (const file of ['index.html', '404.html']) {
      expect(page(file), file).not.toMatch(/href="\/blog/)
    }
    expect(page('index.html')).not.toContain('>Writing</h2>')
    expect(existsSync(join(DIST, 'blog', 'index.html'))).toBe(true)
  })
})
