import type { GitHubUser, Repository, RepositoryLanguages, AnalyzedRepository } from './types.js';

const GITHUB_API_BASE = 'https://api.github.com';

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'showmethecode-cli'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function fetchUserProfile(username: string, token?: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
    headers: getHeaders(token)
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User '${username}' not found on GitHub`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Consider using a GitHub token with --github-token');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<GitHubUser>;
}

export async function fetchUserRepositories(username: string, token?: string): Promise<Repository[]> {
  const allRepos: Repository[] = [];
  let page = 1;
  const perPage = 100;
  
  while (true) {
    // Always use the specified username's repos endpoint
    // Token is used for authentication (rate limits & private repo access when viewing own profile)
    const endpoint = `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated&type=owner`;
    
    const response = await fetch(endpoint, { headers: getHeaders(token) });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Consider using a GitHub token with --github-token');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const repos = await response.json() as Repository[];
    
    if (repos.length === 0) break;
    
    // Filter out forks - only keep original repositories
    const nonForkRepos = repos.filter(repo => !repo.fork);
    allRepos.push(...nonForkRepos);
    
    if (repos.length < perPage) break;
    page++;
  }
  
  return allRepos;
}

export async function fetchRepositoryLanguages(languagesUrl: string, token?: string): Promise<RepositoryLanguages> {
  const response = await fetch(languagesUrl, {
    headers: getHeaders(token)
  });
  
  if (!response.ok) {
    return {};
  }
  
  return response.json() as Promise<RepositoryLanguages>;
}

export async function checkHasCI(username: string, repoName: string, defaultBranch: string, token?: string): Promise<boolean> {
  // Check for GitHub Actions
  const workflowsResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/.github/workflows`,
    { headers: getHeaders(token) }
  );
  
  if (workflowsResponse.ok) return true;
  
  // Check for common CI config files
  const ciFiles = ['.travis.yml', 'Jenkinsfile', '.circleci/config.yml', 'azure-pipelines.yml'];
  
  for (const ciFile of ciFiles) {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/${ciFile}`,
      { headers: getHeaders(token) }
    );
    if (response.ok) return true;
  }
  
  return false;
}

export async function analyzeRepositories(
  username: string,
  repos: Repository[],
  token?: string,
  onProgress?: (current: number, total: number) => void
): Promise<AnalyzedRepository[]> {
  const analyzed: AnalyzedRepository[] = [];
  const now = Date.now();
  
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    onProgress?.(i + 1, repos.length);
    
    // Fetch languages for this repo
    const languages = await fetchRepositoryLanguages(repo.languages_url, token);
    
    // Check for CI (only for repos updated in the last year to save API calls)
    const lastUpdate = new Date(repo.pushed_at).getTime();
    const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    
    let hasCI = false;
    if (daysSinceUpdate < 365) {
      hasCI = await checkHasCI(username, repo.name, repo.default_branch, token);
    }
    
    const createdAt = new Date(repo.created_at).getTime();
    const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    analyzed.push({
      name: repo.name,
      description: repo.description,
      primaryLanguage: repo.language,
      languages,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics || [],
      size: repo.size,
      ageInDays,
      lastActivityDays: daysSinceUpdate,
      hasCI,
      openIssues: repo.open_issues_count
    });
  }
  
  return analyzed;
}

export function aggregateLanguages(repos: AnalyzedRepository[]): Map<string, number> {
  const languageBytes = new Map<string, number>();
  
  for (const repo of repos) {
    for (const [lang, bytes] of Object.entries(repo.languages)) {
      languageBytes.set(lang, (languageBytes.get(lang) || 0) + bytes);
    }
  }
  
  return languageBytes;
}
