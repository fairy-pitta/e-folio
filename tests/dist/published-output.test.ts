import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'
import { findForbidden } from '../../src/lib/public-safety'
import { QIITA_UNAVAILABLE } from '../../src/lib/qiita'

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

// Pages are parsed once and checked with selectors, so the checks follow the
// structure rather than the exact bytes (attribute order, whitespace).
const parsed = new Map<string, HTMLElement>()
function dom(path: string): HTMLElement {
  let root = parsed.get(path)
  if (!root) {
    root = parse(page(path))
    parsed.set(path, root)
  }
  return root
}

function one(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector(selector)
  if (!found) throw new Error(`no match for ${selector}`)
  return found
}

function hrefs(root: HTMLElement, selector = 'a'): string[] {
  return root.querySelectorAll(selector).map((a) => a.getAttribute('href') ?? '')
}

// True when the elements appear in this order in the document.
function inOrder(root: HTMLElement, ...elements: HTMLElement[]): boolean {
  const all = root.querySelectorAll('*')
  const positions = elements.map((element) => all.indexOf(element))
  return positions.every((position, i) => position > -1 && (i === 0 || position > positions[i - 1]))
}

// The first element matching the selector whose text contains the given text.
function withText(root: HTMLElement, selector: string, text: string): HTMLElement {
  const found = root.querySelectorAll(selector).find((element) => element.text.includes(text))
  if (!found) throw new Error(`no ${selector} containing ${JSON.stringify(text)}`)
  return found
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
    const contact = dom('contact/index.html')
    expect(one(contact, '.contact-note').text).toBe('CV available on request.')
    const form = one(contact, 'form#contact-form')
    expect(form.getAttribute('data-fallback')).toBe('https://www.linkedin.com/in/shunamaekawa')
    expect(contact.querySelectorAll('[data-email]')).toHaveLength(0)
  })

  it('test_render_every_page_header_links_nav_and_social_profiles', () => {
    for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'blog/index.html', '404.html']) {
      const links = hrefs(one(dom(file), 'header.site-header'))
      for (const href of [
        '/',
        '/about',
        '/blog',
        '/contact',
        'https://www.linkedin.com/in/shunamaekawa',
        'https://github.com/fairy-pitta',
      ]) {
        expect(links, `${file} ${href}`).toContain(href)
      }
    }
    expect(hrefs(dom('about/index.html'), '.site-nav a[aria-current="page"]')).toEqual(['/about'])
  })

  it('test_render_home_hero_shows_role_proof_and_contact_before_any_card', () => {
    const home = dom('index.html')
    const kicker = one(home, '.hero .hero-kicker')
    expect(kicker.text).toContain('Shuna Maekawa')
    expect(one(kicker, '.handle').text).toBe('fairy-pitta')
    const title = one(home, 'h1')
    expect(title.text).toBe('Lead engineer and project manager. From the data model to delivery.')
    // Two-tone: the second sentence is the grey half.
    expect(one(title, '.hero-title-rest').text).toBe('From the data model to delivery.')
    const sub = withText(home, '.hero p', 'I turn client requirements into features, design the system, and review the team')
    const cert = withText(home, '.hero-cert', 'AWS Certified Solutions Architect – Professional')
    const role = withText(home, '.hero-facts li', 'Lead Engineer & Project Manager')
    const availability = withText(home, '.hero-facts li', 'Available from April 2027')
    const contact = one(home, '.hero .actions a.action-primary')
    expect(contact.getAttribute('href')).toBe('/contact')
    expect(hrefs(home, '.hero .actions a')).toEqual(['/contact', '#selected-work', 'https://www.linkedin.com/in/shunamaekawa'])
    const proof = one(home, 'section.proof')
    expect(proof.querySelectorAll('.tile-kicker').map((label) => label.text)).toEqual(['Led', 'Delivered', 'Certified'])
    expect(hrefs(proof)).toEqual(['/work/finance-saas', '/work/tuition-ops', '/about#certifications'])
    for (const tile of proof.querySelectorAll('a.tile')) expect(one(tile, '.link-more').text).toBe('Learn more')
    expect(proof.text).toContain('team of 9 engineers')
    expect(proof.text).toContain('about 10% to near zero')
    expect(proof.text).toContain('Solutions Architect – Professional and Generative AI Developer – Professional, 2026')
    const firstTile = one(home, '.tile-work')
    expect(inOrder(home, kicker, title, sub, cert, role, availability, contact, proof, firstTile)).toBe(true)
  })

  it('test_render_home_has_no_file_tree_and_no_text_scramble', () => {
    const home = dom('index.html')
    expect(home.querySelectorAll('nav.tree')).toHaveLength(0)
    expect(home.querySelectorAll('[data-scramble]')).toHaveLength(0)
    // The bird call now sits beside the personal projects' heading, not in the hero.
    expect(home.querySelectorAll('.hero .call')).toHaveLength(0)
    expect(one(home, '#personal-projects .section-head .call')).toBeTruthy()
  })

  it('test_render_home_lists_selected_work_before_personal_projects', () => {
    const home = dom('index.html')
    const jobTiles = home.querySelectorAll('a.tile-work')
    expect(hrefs(home, 'a.tile-work')).toEqual(['/work/finance-saas', '/work/document-ai', '/work/tuition-ops'])
    expect(jobTiles).toHaveLength(3)
    // One wide tile, then two halves.
    expect(jobTiles.map((tile) => tile.classList.contains('tile-wide'))).toEqual([true, false, false])
    expect(jobTiles.map((tile) => one(tile, '.tile-kicker').text)).toContain('Internal project')
    for (const tile of jobTiles) {
      expect(one(tile, '.tile-note').text.trim()).not.toBe('')
      expect(one(tile, '.link-more').text).toBe('Read the case study')
    }
    // The five strongest personal projects, newest first; the rest are under Earlier.
    expect(hrefs(home, 'a.tile-project')).toEqual([
      '/projects/CCAccountSwitcher',
      '/projects/Portree',
      '/projects/PrintableSpectrogram',
      '/projects/PseudocodeConverter',
      '/projects/SBBirdMap',
    ])
    expect(inOrder(home, one(home, 'h2#selected-work-title'), one(home, 'h2#personal-projects-title'))).toBe(true)
    for (const tile of home.querySelectorAll('a.tile-project')) {
      expect(tile.querySelectorAll('.screen')).toHaveLength(1)
      expect(one(tile, '.tile-status').text).toMatch(/^(Live|Open source|Archived)$/)
      expect(one(tile, '.link-more').text).toBe('Learn more')
    }
    expect(home.querySelectorAll('a[href^="/about#"]').map((a) => a.getAttribute('href'))).toEqual(['/about#certifications', '/about#certifications'])
  })

  it('test_render_home_lists_earlier_projects_as_rows_not_cards', () => {
    const earlier = one(dom('index.html'), 'section#earlier')
    expect(hrefs(earlier, '.link-list a.link-row')).toEqual(
      expect.arrayContaining(['/projects/CodeAnnotator', '/projects/GameOfLife', '/projects/SGBirdCall', '/projects/HotspotMap']),
    )
    for (const row of earlier.querySelectorAll('a.link-row')) {
      expect(one(row, '.link-row-title').text.trim()).not.toBe('')
      expect(one(row, '.link-row-meta').text).toMatch(/^No\. \d{3} · \d{4}$/)
    }
    expect(one(earlier, 'h2#earlier-title').text).toBe('Earlier')
    expect(earlier.querySelectorAll('.tile')).toHaveLength(0)
  })

  it('test_render_home_ends_with_a_short_about', () => {
    const about = one(dom('index.html'), 'section.about')
    expect(one(about, '.about-text').text).toContain('I studied ecology at Yale-NUS')
    expect(hrefs(about, '.actions a')).toEqual(['/about', '/contact'])
  })

  it('test_render_home_cover_videos_autoplay_muted_and_looping', () => {
    const videos = dom('index.html').querySelectorAll('video')
    expect(videos.length).toBeGreaterThan(0)
    for (const video of videos) {
      for (const attr of ['autoplay', 'muted', 'loop', 'playsinline', 'poster']) expect(video.hasAttribute(attr), attr).toBe(true)
    }
  })

  it('test_render_about_header_orders_summary_strengths_then_availability', () => {
    const about = dom('about/index.html')
    const head = one(about, '.page-head')
    const summary = withText(head, '.lead', 'Software engineer and project manager in Singapore.')
    const strengths = withText(head, '.strengths li', 'Designs LLM agents and the evaluation that keeps them reliable')
    const availability = withText(head, 'dd', 'Available from April 2027')
    expect(inOrder(about, summary, strengths, availability)).toBe(true)
  })

  it('test_render_about_sections_in_hiring_order_and_ends_with_contact', () => {
    const about = dom('about/index.html')
    const titles = about.querySelectorAll('main h2.section-title').map((h2) => h2.text)
    expect(titles).toEqual(['Certifications', 'Skills', 'History', 'Education', 'Awards'])
    const close = one(about, '.about-close')
    expect(close.text).toContain('CV available on request.')
    expect(hrefs(close, 'a.action')).toEqual(['/contact'])
    expect(about.querySelector('section#certifications')).not.toBeNull()
  })

  it('test_render_history_lists_the_current_jobs_projects_as_links_to_their_pages', () => {
    const history = one(dom('about/index.html'), '#history')
    const entries = history.querySelectorAll('.history-entry')
    expect(entries[0].text).toContain('A software company in Singapore, part of a Japanese group')
    expect(one(entries[0], 'details.job').hasAttribute('open')).toBe(true)
    expect(entries.slice(1).every((entry) => !one(entry, 'details.job').hasAttribute('open'))).toBe(true)
    expect(hrefs(entries[0], '.job-work a')).toEqual(['/work/finance-saas', '/work/document-ai', '/work/tuition-ops'])
    expect(history.querySelectorAll('details details')).toHaveLength(0)
    expect(history.text).not.toContain('Yale-NUS College')
    expect(one(dom('about/index.html'), '#education').text).toContain('Yale-NUS College')
  })

  it('test_render_about_keeps_the_old_project_anchors_next_to_links_to_the_new_pages', () => {
    const about = dom('about/index.html')
    for (const id of ['finance-saas', 'document-ai', 'tuition-ops']) {
      const target = one(about, `#${id}`)
      expect(hrefs(target), id).toEqual([`/work/${id}`])
    }
  })

  it('test_render_work_pages_tell_each_project_as_a_case_study', () => {
    for (const id of ['finance-saas', 'document-ai', 'tuition-ops']) {
      const work = dom(`work/${id}/index.html`)
      expect(one(work, '.page-head .page-kicker').text, id).toMatch(/^(Client|Internal) project$/)
      const labels = work.querySelectorAll('.page-head .label-list dt').map((dt) => dt.text)
      expect(labels, id).toEqual(expect.arrayContaining(['Role', 'Stack', 'When']))
      expect(work.querySelectorAll('dl.case > div > dt').map((dt) => dt.text), id).toEqual([
        'Problem',
        'My role',
        'Key decisions',
        'Outcome',
      ])
      // Industry only: nothing to show and nowhere to link but the contact page.
      const main = one(work, 'main')
      expect(main.querySelectorAll('img, video, .screen'), id).toHaveLength(0)
      expect(hrefs(main, '.page-head .actions a'), id).toEqual(['/contact', 'https://www.linkedin.com/in/shunamaekawa'])
      expect(one(work, 'title').text).toMatch(/ — fairy-pitta$/)
      expect(one(work, 'meta[property="og:image"]').getAttribute('content')).toBe(`https://fairy-pitta.net/og/work-${id}.png`)
      expect(existsSync(join(DIST, 'og', `work-${id}.png`)), id).toBe(true)
      // The neighbouring pages, as two tiles: a small grey label and the title.
      const pager = one(work, 'nav.pager')
      const links = pager.querySelectorAll('a.pager-link')
      expect(links.length, id).toBeGreaterThan(0)
      // Previous comes first (left), Next last (right); a lone Next sits in the right column.
      const order = links.map((link) => one(link, '.pager-label').text.split(' · ')[0])
      expect([['Previous', 'Next'], ['Previous'], ['Next']], id).toContainEqual(order)
      for (const item of pager.querySelectorAll('li')) {
        const label = one(item, '.pager-label').text.split(' · ')[0]
        expect(item.getAttribute('class'), id).toBe(label === 'Previous' ? 'pager-prev' : 'pager-next')
      }
      for (const link of links) {
        expect(link.getAttribute('href'), id).toMatch(/^\/work\/(?!${id}$)[a-z-]+$/)
        expect(one(link, '.pager-label').text, id).toMatch(/^(Next|Previous) · /)
        expect(one(link, '.pager-title').text.trim(), id).not.toBe('')
      }
    }
    const finance = dom('work/finance-saas/index.html')
    expect(finance.querySelectorAll('.page-head .label-list dt').map((dt) => dt.text)).toEqual(['Role', 'Team', 'Stack', 'When', 'Status'])
    expect(withText(finance, '.page-head dd', 'Current job, since Dec 2023')).toBeTruthy()
    expect(withText(finance, '.page-head dd', '9 engineers')).toBeTruthy()
  })

  // The phrase "case study" was banned while the job's projects were nested
  // accordions on the About page, which were not case studies in any useful
  // sense. Each project from the job now has its own page with a Problem,
  // My role, Key decisions and Outcome, so the phrase is allowed and is used
  // where those pages are introduced. The check now runs the other way.
  it('test_render_pages_that_introduce_the_work_pages_call_them_case_studies', () => {
    expect(one(dom('index.html'), '#selected-work .section-note').text.toLowerCase()).toContain('case study')
    expect(one(dom('work/finance-saas/index.html'), 'h2#case-title').text).toBe('Case study')
    expect(page('llms.txt').toLowerCase()).toContain('case studies')
  })

  it('test_list_work_pages_in_sitemap_and_llms_txt', () => {
    for (const id of ['finance-saas', 'document-ai', 'tuition-ops']) {
      expect(page('sitemap.xml'), id).toContain(`<loc>https://fairy-pitta.net/work/${id}/</loc>`)
      expect(page('llms.txt'), id).toContain(`(https://fairy-pitta.net/work/${id}/)`)
    }
    expect(page('llms.txt')).toMatch(/## Work\n/)
  })

  it('test_render_project_page_shows_links_and_facts', () => {
    const map = dom('projects/SBBirdMap/index.html')
    const actions = hrefs(map, '.page-head .actions a')
    expect(actions).toContain('https://sgbirdsmap.fairy-pitta.net')
    expect(actions).toContain('https://github.com/fairy-pitta/SGBirdMap')
    expect(map.querySelectorAll('.label-list dt').map((dt) => dt.text)).toEqual(expect.arrayContaining(['No.', 'When', 'Stack']))
    expect(one(map, '.page-kicker').text).toContain('Personal project')
    expect(one(map, '.page-kicker .stamp').text).toBe('Live')
    expect(map.querySelectorAll('dl.case')).toHaveLength(0)
    expect(hrefs(dom('projects/Portree/index.html'), '.page-head .actions a')).toContain(
      'https://qiita.com/Pitta/items/4a6537a3450aa6f8f050',
    )
  })

  it('test_request_old_projects_index_redirects_to_home', () => {
    const refresh = one(dom('projects/index.html'), 'meta[http-equiv="refresh"]')
    expect(refresh.getAttribute('content')).toMatch(/url=\/$/)
  })

  it('test_request_work_index_redirects_to_the_selected_work_section', () => {
    const refresh = one(dom('work/index.html'), 'meta[http-equiv="refresh"]')
    expect(refresh.getAttribute('content')).toMatch(/url=\/#selected-work$/)
  })

  it('test_render_writing_page_lists_qiita_articles_and_no_drafts', (context) => {
    expect(existsSync(join(DIST, 'blog', 'why-i-built-portree'))).toBe(false)
    const writing = dom('blog/index.html')
    // A Qiita outage at build time is not a bug in the site: the page marks it, and this check stands down.
    if (writing.querySelector(`[data-qiita="${QIITA_UNAVAILABLE}"]`)) {
      context.skip()
      return
    }
    expect(writing.querySelectorAll('.list .row a[lang="ja"]').length).toBeGreaterThan(0)
    expect(writing.querySelectorAll('.list .muted').map((label) => label.text)).toContain(' Qiita ↗')
  })

  it('test_render_every_page_uses_the_same_frame_width', () => {
    for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'projects/Portree/index.html', 'work/finance-saas/index.html']) {
      expect(dom(file).querySelectorAll('body > div.page'), file).toHaveLength(1)
    }
    expect(one(dom('index.html'), 'main').classList.value).toEqual(['content'])
    expect(one(dom('about/index.html'), 'main').classList.value).toEqual(['content', 'content-reading'])
  })

  it('test_render_tab_titles_use_the_handle', () => {
    expect(one(dom('index.html'), 'title').text).toBe('fairy-pitta')
    expect(one(dom('about/index.html'), 'title').text).toBe('About — fairy-pitta')
    expect(one(dom('projects/Portree/index.html'), 'title').text).toBe('portree — fairy-pitta')
    for (const file of ['index.html', 'about/index.html', 'contact/index.html', 'blog/index.html', '404.html']) {
      expect(one(dom(file), 'title').text, file).not.toContain('Shuna Maekawa')
    }
  })

  it('test_render_contact_page_states_availability_and_what_to_get_in_touch_about', () => {
    const contact = dom('contact/index.html')
    const availability = withText(contact, '.page-head dd', 'Available from April 2027')
    const topics = one(contact, '.contact-topics')
    expect(topics.querySelectorAll('li').map((li) => li.text)[0]).toBe('A lead engineer & project manager role, from April 2027')
    expect(topics.querySelectorAll('li')).toHaveLength(4)
    expect(inOrder(contact, availability, topics, one(contact, '#contact-form'))).toBe(true)
  })

  // apple.com-style labels: sentence case everywhere. Spaced capitals and
  // monospace labels are gone; Geist Mono is left for code and the monitor's title bar.
  it('test_render_site_styles_have_no_uppercase_labels', () => {
    const css = walk(DIST).filter((file) => extname(file) === '.css').map((file) => readFileSync(file, 'utf8')).join('\n')
    expect(css).not.toMatch(/text-transform:\s*uppercase/)
    for (const file of ['index.html', 'about/index.html', 'work/finance-saas/index.html', 'projects/Portree/index.html']) {
      expect(dom(file).querySelectorAll('.eyebrow, .eyebrow-path, .label-grid'), file).toHaveLength(0)
    }
  })

  it('test_render_contact_page_points_to_linkedin_first', () => {
    const contact = dom('contact/index.html')
    const lead = withText(contact, '.page-head .lead', 'You can message me on')
    expect(hrefs(lead)).toEqual(['https://www.linkedin.com/in/shunamaekawa'])
    expect(inOrder(contact, lead, one(contact, '#contact-form'))).toBe(true)
  })
})
