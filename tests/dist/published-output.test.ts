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

  it('test_render_contact_page_offers_cv_on_request_and_linkedin_fallback', () => {
    const contact = page('contact/index.html')
    expect(contact).toContain('CV available on request.')
    expect(contact).toContain('data-fallback="https://www.linkedin.com/in/shunamaekawa"')
    expect(contact).not.toContain('data-email')
  })

  it('test_render_every_page_header_links_nav_and_social_profiles', () => {
    for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'blog/index.html', '404.html']) {
      const html = page(file)
      for (const href of [
        'href="/"',
        'href="/about"',
        'href="/blog"',
        'href="/contact"',
        'href="https://www.linkedin.com/in/shunamaekawa"',
        'href="https://github.com/fairy-pitta"',
      ]) {
        expect(html, `${file} ${href}`).toContain(href)
      }
    }
    expect(page('about/index.html')).toMatch(/href="\/about" aria-current="page"/)
  })

  it('test_render_home_opens_with_name_pitch_and_availability', () => {
    const home = page('index.html')
    const name = home.indexOf('Shuna Maekawa <span class="handle">')
    const pitch = home.indexOf('I design LLM agents and AWS systems')
    const availability = home.indexOf('Available from April 2027')
    const firstCard = home.indexOf('class="specimen')
    expect(name).toBeGreaterThan(-1)
    expect(pitch).toBeGreaterThan(name)
    expect(availability).toBeGreaterThan(pitch)
    expect(firstCard).toBeGreaterThan(availability)
  })

  it('test_render_home_lists_job_projects_before_personal_projects', () => {
    const home = page('index.html')
    const jobCards = home.match(/<a class="specimen specimen-job" href="\/about#[a-z0-9-]+"/g) ?? []
    expect(jobCards).toHaveLength(3)
    expect(home).toContain('>INTERNAL</span>')
    const personalCards = home.match(/<a class="specimen" href="\/projects\/[^"]+"/g) ?? []
    expect(personalCards).toHaveLength(6)
    expect(home.indexOf('>At work</h2>')).toBeLessThan(home.indexOf('>Personal projects</h2>'))
    expect(home).toContain('<dt>Stack</dt>')
    expect(home).toContain('class="specimen-note"')
  })

  it('test_render_home_lists_earlier_projects_as_rows_not_cards', () => {
    const home = page('index.html')
    const earlier = home.slice(home.indexOf('>Earlier</h2>'))
    expect(earlier).toContain('href="/projects/GameOfLife"')
    expect(earlier).toContain('href="/projects/SGBirdCall"')
    expect(earlier).toContain('href="/projects/HotspotMap"')
    expect(earlier).not.toContain('class="specimen')
  })

  it('test_render_about_gives_each_client_project_the_anchor_its_card_links_to', () => {
    const about = page('about/index.html')
    for (const id of ['finance-saas', 'document-ai', 'tuition-ops']) {
      expect(about).toMatch(new RegExp(`<details class="job experience-project" id="${id}"`))
    }
  })

  it('test_render_home_cover_videos_autoplay_muted_and_looping', () => {
    const videos = page('index.html').match(/<video[^>]*>/g) ?? []
    expect(videos.length).toBeGreaterThan(0)
    for (const video of videos) {
      for (const attr of ['autoplay', 'muted', 'loop', 'playsinline', 'poster=']) expect(video).toContain(attr)
    }
  })

  it('test_render_about_header_orders_summary_strengths_then_availability', () => {
    const about = page('about/index.html')
    const summary = about.indexOf('Software engineer and project manager in Singapore.')
    const strengths = about.indexOf('Designs LLM agents and the evaluation that keeps them reliable')
    const availability = about.indexOf('Available from April 2027')
    expect(summary).toBeGreaterThan(-1)
    expect(strengths).toBeGreaterThan(summary)
    expect(availability).toBeGreaterThan(strengths)
  })

  it('test_render_current_job_returns_three_closed_project_accordions_with_four_parts', () => {
    const about = page('about/index.html')
    const openings = about.match(/<details class="job experience-project"[^>]*>/g) ?? []
    expect(openings).toHaveLength(3)
    for (const opening of openings) expect(opening).not.toMatch(/\sopen\b/)
    for (const heading of ['Problem', 'My role', 'Key decisions', 'Outcome']) {
      const count = (about.match(new RegExp(`<dt[^>]*>${heading}</dt>`, 'g')) ?? []).length
      expect(count, heading).toBe(3)
    }
  })

  it('test_render_history_nests_client_projects_inside_current_job', () => {
    const about = page('about/index.html')
    const history = about.indexOf('>History</h2>')
    const currentJob = about.indexOf('A software company in Singapore, part of a Japanese group')
    const firstProject = about.indexOf('<details class="job experience-project"')
    const nextEntry = about.indexOf('Mandai Wildlife Group')
    expect(history).toBeGreaterThan(-1)
    expect(currentJob).toBeGreaterThan(history)
    expect(firstProject).toBeGreaterThan(currentJob)
    expect(nextEntry).toBeGreaterThan(firstProject)
    expect(about).toContain('Yale-NUS College')
  })

  it('test_render_pages_without_case_studies_section_returns_no_mention', () => {
    for (const file of ['index.html', 'about/index.html', 'llms.txt']) {
      expect(page(file).toLowerCase(), file).not.toMatch(/case[ -]stud/)
    }
  })

  it('test_render_project_page_shows_links_and_specimen_label', () => {
    const map = page('projects/SBBirdMap/index.html')
    expect(map).toContain('href="https://sgbirdsmap.fairy-pitta.net"')
    expect(map).toContain('href="https://github.com/fairy-pitta/SGBirdMap"')
    expect(map).toContain('<dt>Built</dt>')
    expect(page('projects/Portree/index.html')).toContain('href="https://qiita.com/Pitta/items/4a6537a3450aa6f8f050"')
  })

  it('test_request_old_projects_index_redirects_to_home', () => {
    expect(page('projects/index.html')).toMatch(/url=\//)
  })

  it('test_render_writing_page_lists_qiita_articles_and_no_drafts', () => {
    const writing = page('blog/index.html')
    expect(writing).toContain('Qiita ↗')
    expect(existsSync(join(DIST, 'blog', 'why-i-built-portree'))).toBe(false)
  })

  it('test_render_every_page_uses_the_same_frame_width', () => {
    for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'projects/Portree/index.html']) {
      expect(page(file), file).toContain('<div class="page">')
    }
    expect(page('index.html')).toContain('<main class="content">')
    expect(page('about/index.html')).toContain('<main class="content content-reading">')
  })

  it('test_render_tab_titles_use_the_handle', () => {
    expect(page('index.html')).toContain('<title>fairy-pitta</title>')
    expect(page('about/index.html')).toContain('<title>About — fairy-pitta</title>')
    expect(page('projects/Portree/index.html')).toContain('<title>portree — fairy-pitta</title>')
    for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'blog/index.html', '404.html']) {
      expect(page(file).match(/<title>([^<]*)<\/title>/)?.[1], file).not.toContain('Shuna Maekawa')
    }
  })

  it('test_render_contact_page_points_to_linkedin_first', () => {
    const contact = page('contact/index.html')
    expect(contact.indexOf('You can message me on')).toBeLessThan(contact.indexOf('id="contact-form"'))
  })
})
