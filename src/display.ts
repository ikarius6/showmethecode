import chalk from 'chalk';
import ora, { Ora } from 'ora';
import type { AnalysisResult } from './types.js';

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots'
  });
}

export function displayHeader(): void {
  console.log();
  console.log(chalk.bold.cyan('╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('           🔍 Show Me The Code - Developer Analyzer         ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝'));
  console.log();
}

export function displayResults(result: AnalysisResult): void {
  const { user, seniorityLevel, seniorityReasoning, primaryTechStack, totalRepositories, totalStars, keyInsights, specializations, experienceYears } = result;
  
  // User Profile Section
  console.log();
  console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│') + chalk.bold.white('  👤 Developer Profile                                       ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘'));
  console.log();
  
  console.log(chalk.white('  Username:    ') + chalk.bold.green(`@${user.login}`));
  if (user.name) console.log(chalk.white('  Name:        ') + chalk.yellow(user.name));
  if (user.bio) console.log(chalk.white('  Bio:         ') + chalk.gray(user.bio));
  if (user.company) console.log(chalk.white('  Company:     ') + chalk.magenta(user.company));
  if (user.location) console.log(chalk.white('  Location:    ') + chalk.blue(user.location));
  console.log(chalk.white('  GitHub Age:  ') + chalk.cyan(`${experienceYears} years`));
  console.log(chalk.white('  Followers:   ') + chalk.yellow(user.followers.toLocaleString()));
  console.log();
  
  // Stats Section
  console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│') + chalk.bold.white('  📊 Repository Statistics                                   ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘'));
  console.log();
  
  console.log(chalk.white('  Total Repos: ') + chalk.bold.green(totalRepositories.toString()));
  console.log(chalk.white('  Total Stars: ') + chalk.bold.yellow(`⭐ ${totalStars.toLocaleString()}`));
  console.log();
  
  // Seniority Section
  console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│') + chalk.bold.white('  🎯 Seniority Assessment                                    ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘'));
  console.log();
  
  const seniorityColors: Record<string, (text: string) => string> = {
    'Junior': chalk.green,
    'Mid-Level': chalk.yellow,
    'Senior': chalk.magenta,
    'Principal/Staff': chalk.red,
    'Superstar': chalk.cyan
  };
  
  const colorFn = seniorityColors[seniorityLevel] || chalk.white;
  console.log(chalk.white('  Level: ') + chalk.bold(colorFn(`★ ${seniorityLevel} ★`)));
  console.log();
  
  // Word wrap the reasoning
  const words = seniorityReasoning.split(' ');
  let line = '  ';
  const maxWidth = 58;
  
  for (const word of words) {
    if (line.length + word.length + 1 > maxWidth) {
      console.log(chalk.gray(line));
      line = '  ' + word;
    } else {
      line += (line.length > 2 ? ' ' : '') + word;
    }
  }
  if (line.length > 2) console.log(chalk.gray(line));
  console.log();
  
  // Tech Stack Section
  console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│') + chalk.bold.white('  💻 Tech Stack                                              ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘'));
  console.log();
  
  const maxBarWidth = 30;
  const maxPercentage = Math.max(...primaryTechStack.map(t => t.percentage));
  
  for (const tech of primaryTechStack.slice(0, 8)) {
    const barWidth = Math.round((tech.percentage / maxPercentage) * maxBarWidth);
    const bar = '█'.repeat(barWidth) + '░'.repeat(maxBarWidth - barWidth);
    const langName = tech.name.padEnd(15);
    const percentage = `${tech.percentage}%`.padStart(6);
    const projects = `(${tech.projectCount} repos)`.padStart(12);
    
    console.log(chalk.white(`  ${langName}`) + chalk.cyan(bar) + chalk.yellow(percentage) + chalk.gray(projects));
  }
  console.log();
  
  // Specializations Section
  if (specializations.length > 0) {
    console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────────┐'));
    console.log(chalk.bold.cyan('│') + chalk.bold.white('  🎓 Specializations                                         ') + chalk.bold.cyan('│'));
    console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘'));
    console.log();
    
    for (const spec of specializations) {
      console.log(chalk.white('  • ') + chalk.green(spec));
    }
    console.log();
  }
  
  // Key Insights Section
  if (keyInsights.length > 0) {
    console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────────────────┐'));
    console.log(chalk.bold.cyan('│') + chalk.bold.white('  💡 Key Insights                                            ') + chalk.bold.cyan('│'));
    console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘'));
    console.log();
    
    for (const insight of keyInsights) {
      // Word wrap insights
      const insightWords = insight.split(' ');
      let insightLine = '  → ';
      
      for (const word of insightWords) {
        if (insightLine.length + word.length + 1 > maxWidth) {
          console.log(chalk.white(insightLine));
          insightLine = '    ' + word;
        } else {
          insightLine += (insightLine.length > 4 ? ' ' : '') + word;
        }
      }
      if (insightLine.length > 4) console.log(chalk.white(insightLine));
    }
    console.log();
  }
  
  // Footer
  console.log(chalk.gray('─'.repeat(63)));
  console.log(chalk.gray(`  Analysis powered by Groq AI (llama-4-scout-17b-16e-instruct)`));
  console.log(chalk.gray(`  Profile: https://github.com/${user.login}`));
  console.log();
}

export function displayError(message: string): void {
  console.log();
  console.log(chalk.bold.red('❌ Error: ') + chalk.red(message));
  console.log();
}

export function displayUsage(): void {
  console.log();
  console.log(chalk.bold.cyan('Usage:'));
  console.log(chalk.white('  npx showmethecode <github-username> [options]'));
  console.log();
  console.log(chalk.bold.cyan('Options:'));
  console.log(chalk.white('  --github-token <token>  ') + chalk.gray('GitHub token for private repos & higher rate limits'));
  console.log(chalk.white('  --groq-key <key>        ') + chalk.gray('Groq API key (or set GROQ_API_KEY env var)'));
  console.log(chalk.white('  --help                  ') + chalk.gray('Show this help message'));
  console.log();
  console.log(chalk.bold.cyan('Examples:'));
  console.log(chalk.gray('  npx showmethecode octocat'));
  console.log(chalk.gray('  npx showmethecode sindresorhus --github-token ghp_xxxx'));
  console.log(chalk.gray('  npx showmethecode torvalds --groq-key gsk_xxxx'));
  console.log();
  console.log(chalk.bold.cyan('Environment Variables:'));
  console.log(chalk.white('  GROQ_API_KEY      ') + chalk.gray('Your Groq API key'));
  console.log(chalk.white('  GITHUB_TOKEN      ') + chalk.gray('Your GitHub personal access token'));
  console.log();
}
