export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
}

export interface Repository {
  name: string;
  description: string | null;
  language: string | null;
  languages_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  fork: boolean;
  default_branch: string;
  has_wiki: boolean;
  has_pages: boolean;
  open_issues_count: number;
}

export interface RepositoryLanguages {
  [language: string]: number;
}

export interface AnalyzedRepository {
  name: string;
  description: string | null;
  primaryLanguage: string | null;
  languages: RepositoryLanguages;
  stars: number;
  forks: number;
  topics: string[];
  size: number;
  ageInDays: number;
  lastActivityDays: number;
  hasCI: boolean;
  openIssues: number;
}

export type SeniorityLevel = 'Junior' | 'Mid-Level' | 'Senior' | 'Principal/Staff' | 'Superstar';

export interface TechStackItem {
  name: string;
  percentage: number;
  bytesOfCode: number;
  projectCount: number;
}

export interface AnalysisResult {
  user: GitHubUser;
  seniorityLevel: SeniorityLevel;
  seniorityReasoning: string;
  primaryTechStack: TechStackItem[];
  totalRepositories: number;
  totalStars: number;
  keyInsights: string[];
  specializations: string[];
  experienceYears: number;
}

export interface CLIOptions {
  username: string;
  githubToken?: string;
  groqApiKey?: string;
}
