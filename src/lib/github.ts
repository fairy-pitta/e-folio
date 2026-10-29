// Star counts are fetched at build time, so they are as fresh as the last deploy.

export function repoFromUrl(url: string | undefined): string | null {
  const match = url?.trim().match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/)
  return match ? `${match[1]}/${match[2]}` : null
}

const cache = new Map<string, Promise<number | null>>()

// Never throws: a GitHub outage or rate limit must not break the site build,
// it only drops the count from the page.
async function request(repo: string, fetchImpl: typeof fetch, token: string | undefined): Promise<number | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" }
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetchImpl(`https://api.github.com/repos/${repo}`, { headers })
    if (!response.ok) {
      console.warn(`[github] ${repo} skipped: HTTP ${response.status}`)
      return null
    }
    const body = (await response.json()) as { stargazers_count?: unknown }
    return typeof body.stargazers_count === "number" ? body.stargazers_count : null
  } catch (error) {
    console.warn(`[github] ${repo} skipped:`, error)
    return null
  }
}

export function fetchStars(
  repo: string,
  fetchImpl: typeof fetch = fetch,
  token: string | undefined = process.env.GITHUB_TOKEN,
): Promise<number | null> {
  // Each repo is asked for once per build, however many pages show it.
  if (fetchImpl !== fetch) return request(repo, fetchImpl, token)
  const hit = cache.get(repo)
  if (hit) return hit
  const pending = request(repo, fetchImpl, token)
  cache.set(repo, pending)
  return pending
}

// Below this a count reads as a weakness rather than a signal, so it is not shown.
export const MIN_STARS_SHOWN = 10

export function starsLabel(stars: number | null): string | null {
  if (stars === null || stars < MIN_STARS_SHOWN) return null
  return `${stars} on GitHub`
}

// The "Stars" line for a project, or null when there is no repo or too few stars.
export async function projectStars(githubUrl: string | undefined): Promise<string | null> {
  const repo = repoFromUrl(githubUrl)
  return repo ? starsLabel(await fetchStars(repo)) : null
}
