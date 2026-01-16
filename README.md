# Show Me The Code - Developer Analyzer by Mr.Jack

Analyze GitHub developer profiles using AI to estimate seniority level and tech stack.

## Installation

```bash
# Run directly with npx
npx showmethecode <github-username>

# Or install globally
npm install -g showmethecode
showmethecode <github-username>
```

## Usage

```bash
# Basic usage
npx showmethecode octocat

# With GitHub token (for private repos & higher rate limits)
npx showmethecode ikarius6 --github-token ghp_xxxxxxxxxxxx

# With Groq API key
npx showmethecode torvalds --groq-key gsk_xxxxxxxxxxxx
```

## Options

| Option | Description |
|--------|-------------|
| `--github-token <token>` | GitHub personal access token for private repos & higher rate limits |
| `--groq-key <key>` | Groq API key (alternative to GROQ_API_KEY env var) |
| `--help` | Show usage information |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key (get it from [console.groq.com](https://console.groq.com)) |
| `GITHUB_TOKEN` | Your GitHub personal access token |

## GitHub Token Scopes

Create a token at [github.com/settings/tokens](https://github.com/settings/tokens):

| Use Case | Required Scope |
|----------|----------------|
| Public repos only (higher rate limits) | No scopes needed |
| Include private repositories | `repo` (Full control of private repositories) |

## Security & Privacy 🔒

**Your tokens are never stored.** Both your GitHub token and Groq API key are:

- ✅ Used only for the current session
- ✅ Held only in memory during execution
- ✅ Discarded immediately after the analysis completes
- ❌ Never logged, saved, or transmitted to any third party

This tool runs entirely on your machine—your credentials stay with you.

## What It Analyzes

- **Repositories**: All original (non-fork) repositories
- **Languages**: Code volume distribution across languages
- **Complexity**: Project architecture, code patterns, activity
- **Topics**: Repository topics and tags
- **Community Impact**: Stars, forks (for Superstar recognition)

## Seniority Criteria

Seniority is based on **technical skill**, not popularity. Stars/forks indicate community impact, not ability.

| Level | Indicators |
|-------|------------|
| **Junior** | 1-2 languages, simple single-purpose projects, basic patterns |
| **Mid-Level** | 3-4 languages, multi-component projects, good code organization |
| **Senior** | 5+ languages, complex architectures (microservices, monorepos), well-designed patterns |
| **Principal/Staff** | 7+ languages with depth, framework/library creation, advanced architectural patterns |
| **Superstar** ⭐ | Senior or Principal level + significant community impact (high stars/forks). Parallel recognition of popularity, not higher technical level |

## Example Output

```
╔═══════════════════════════════════════════════════════════╗
║           🔍 Show Me The Code - Developer Analyzer         ║
╚═══════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│  👤 Developer Profile                                       │
└─────────────────────────────────────────────────────────────┘

  Username:    @ikarius6
  Name:        Mr.Jack
  GitHub Age:  12 years
  Followers:   29

┌─────────────────────────────────────────────────────────────┐
│  🎯 Seniority Assessment                                    │
└─────────────────────────────────────────────────────────────┘

  Level: ★ Senior ★

  Based on diverse language usage, consistent project structure,
  and active maintenance patterns...
```

## Rate Limits

- **Without token**: 60 requests/hour
- **With GitHub token**: 5,000 requests/hour

For users with many repositories, using a GitHub token is recommended.

## AI Model

This tool uses [Groq](https://groq.com) with the `meta-llama/llama-4-scout-17b-16e-instruct` model for intelligent profile analysis.

## License

MIT
