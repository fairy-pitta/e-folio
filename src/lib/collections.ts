// The only module that reads the content collections. Everything it hands out
// is built by the plain functions in ./content, which the tests run on the same
// files read from disk (./content-files).

import { getCollection } from 'astro:content'
import { jobIds } from '../data/cv'
import { toBlogPosts, toJobWork, toProjects, type BlogPost, type JobWork, type Project } from './content'

export async function getAllBlogPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Promise<BlogPost[]> {
  return toBlogPosts(await getCollection('blog'), { includeDrafts })
}

export async function getAllProjects(): Promise<Project[]> {
  return toProjects(await getCollection('work'))
}

// Projects from the job, in the order of the CV's jobs.
export async function getJobWork(): Promise<JobWork[]> {
  return toJobWork(await getCollection('work'), jobIds())
}
