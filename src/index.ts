#!/usr/bin/env node

import 'dotenv/config';
import { fetchUserProfile, fetchUserRepositories, analyzeRepositories } from './github.js';
import { analyzeWithAI } from './analyzer.js';
import { displayHeader, displayResults, displayError, displayUsage, createSpinner } from './display.js';
import type { CLIOptions } from './types.js';

function parseArgs(args: string[]): CLIOptions | null {
  const options: CLIOptions = {
    username: '',
    githubToken: process.env.GITHUB_TOKEN,
    groqApiKey: process.env.GROQ_API_KEY
  };
  
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      return null; // Signal to show help
    } else if (arg === '--github-token' && args[i + 1]) {
      options.githubToken = args[i + 1];
      i += 2;
    } else if (arg === '--groq-key' && args[i + 1]) {
      options.groqApiKey = args[i + 1];
      i += 2;
    } else if (!arg.startsWith('--') && !options.username) {
      options.username = arg;
      i++;
    } else {
      i++;
    }
  }
  
  return options;
}

async function main(): Promise<void> {
  displayHeader();
  
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (options === null) {
    displayUsage();
    process.exit(0);
  }
  
  if (!options.username) {
    displayError('Please provide a GitHub username');
    displayUsage();
    process.exit(1);
  }
  
  if (!options.groqApiKey) {
    displayError('Groq API key is required. Set GROQ_API_KEY env var or use --groq-key <key>');
    displayUsage();
    process.exit(1);
  }
  
  let spinner = createSpinner(`Fetching profile for @${options.username}...`);
  spinner.start();
  
  try {
    // Fetch user profile
    const user = await fetchUserProfile(options.username, options.githubToken);
    spinner.succeed(`Found user: ${user.name || user.login}`);
    
    // Fetch repositories
    spinner = createSpinner('Fetching repositories (excluding forks)...');
    spinner.start();
    
    const repos = await fetchUserRepositories(options.username, options.githubToken);
    spinner.succeed(`Found ${repos.length} original repositories`);
    
    if (repos.length === 0) {
      displayError('No repositories found for this user');
      process.exit(1);
    }
    
    // Analyze repositories (with progress)
    spinner = createSpinner('Analyzing repository complexity...');
    spinner.start();
    
    const analyzedRepos = await analyzeRepositories(
      options.username,
      repos,
      options.githubToken,
      (current, total) => {
        spinner.text = `Analyzing repositories... (${current}/${total})`;
      }
    );
    spinner.succeed('Repository analysis complete');
    
    // AI Analysis
    spinner = createSpinner('Generating AI analysis with Groq...');
    spinner.start();
    
    const result = await analyzeWithAI(user, analyzedRepos, options.groqApiKey);
    spinner.succeed('AI analysis complete');
    
    // Display results
    displayResults(result);
    
  } catch (error) {
    spinner.fail('Analysis failed');
    
    if (error instanceof Error) {
      displayError(error.message);
    } else {
      displayError('An unexpected error occurred');
    }
    
    process.exit(1);
  }
}

main();
