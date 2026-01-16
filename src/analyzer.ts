import Groq from 'groq-sdk';
import type { GitHubUser, AnalyzedRepository, AnalysisResult, TechStackItem, SeniorityLevel } from './types.js';
import { aggregateLanguages } from './github.js';

export async function analyzeWithAI(
  user: GitHubUser,
  repos: AnalyzedRepository[],
  apiKey: string
): Promise<AnalysisResult> {
  const groq = new Groq({ apiKey });
  
  // Aggregate language statistics
  const languageBytes = aggregateLanguages(repos);
  const totalBytes = Array.from(languageBytes.values()).reduce((a, b) => a + b, 0);
  
  // Calculate language percentages
  const languageStats = Array.from(languageBytes.entries())
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: Math.round((bytes / totalBytes) * 100 * 10) / 10,
      bytesOfCode: bytes,
      projectCount: repos.filter(r => Object.keys(r.languages).includes(lang)).length
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10); // Top 10 languages
  
  // Prepare repository summary for AI (sorted by most recent activity from GitHub API)
  const repoSummary = repos.map(repo => ({
    name: repo.name,
    description: repo.description,
    primaryLanguage: repo.primaryLanguage,
    stars: repo.stars,
    forks: repo.forks,
    topics: repo.topics,
    sizeKB: repo.size,
    ageInDays: repo.ageInDays,
    lastActivityDays: repo.lastActivityDays
  }));
  
  // Calculate some metrics
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const uniqueTopics = [...new Set(repos.flatMap(r => r.topics))];
  const accountAgeYears = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
  
  const prompt = `You are an expert at analyzing developer profiles. Analyze this GitHub developer and provide a detailed assessment.

## Developer Profile
- Username: ${user.login}
- Name: ${user.name || 'Not provided'}
- Bio: ${user.bio || 'Not provided'}
- Company: ${user.company || 'Not provided'}
- Location: ${user.location || 'Not provided'}
- GitHub account age: ${accountAgeYears} years
- Followers: ${user.followers}
- Following: ${user.following}

## Repository Statistics
- Total repositories (non-fork): ${repos.length}
- Total stars received: ${totalStars}
- Total forks received: ${repos.reduce((sum, r) => sum + r.forks, 0)}
- Unique topics/tags used: ${uniqueTopics.length}

## Language Distribution (by code volume)
${languageStats.map(l => `- ${l.name}: ${l.percentage}% (${l.projectCount} projects)`).join('\n')}

## Repositories (sorted by most recent activity)
${JSON.stringify(repoSummary, null, 2)}

## Unique Topics Across All Repos
${uniqueTopics.slice(0, 50).join(', ')}

---

Based on this data, provide your analysis in the following JSON format ONLY (no other text):

{
  "seniorityLevel": "Junior" | "Mid-Level" | "Senior" | "Principal/Staff" | "Superstar",
  "seniorityReasoning": "Detailed explanation of why this seniority level was assigned, mentioning specific evidence from their profile",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "specializations": ["area1", "area2", "area3"]
}

Consider these factors for seniority (focus on TECHNICAL SKILL, not popularity - stars/forks measure impact, not ability):
- Junior: 1-2 languages, simple single-purpose projects, basic code patterns, limited documentation
- Mid-Level: 3-4 languages, multi-component projects, good code organization, README documentation
- Senior: 5+ languages, complex architectures (microservices, monorepos), well-designed patterns, meaningful topics/tags, evidence of collaboration
- Principal/Staff: 7+ languages with depth, framework/library creation, advanced architectural patterns, comprehensive documentation, mentorship evidence
- Superstar: A Senior or Principal level developer who ALSO has significant community impact (high stars, many forks, popular projects). This is a parallel recognition of popularity, not a higher technical level.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0.3,
    max_tokens: 2000
  });
  
  const responseText = completion.choices[0]?.message?.content || '{}';
  
  // Extract JSON from response
  let aiAnalysis: {
    seniorityLevel: SeniorityLevel;
    seniorityReasoning: string;
    keyInsights: string[];
    specializations: string[];
  };
  
  try {
    // Try to find JSON in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiAnalysis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch {
    // Fallback if parsing fails
    aiAnalysis = {
      seniorityLevel: 'Mid-Level',
      seniorityReasoning: 'Unable to parse AI response. Based on repository count and language diversity, estimated as Mid-Level.',
      keyInsights: ['Analysis incomplete - please try again'],
      specializations: languageStats.slice(0, 3).map(l => l.name)
    };
  }
  
  return {
    user,
    seniorityLevel: aiAnalysis.seniorityLevel,
    seniorityReasoning: aiAnalysis.seniorityReasoning,
    primaryTechStack: languageStats,
    totalRepositories: repos.length,
    totalStars,
    keyInsights: aiAnalysis.keyInsights,
    specializations: aiAnalysis.specializations,
    experienceYears: accountAgeYears
  };
}
