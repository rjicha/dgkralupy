# dgkralupy.cz

[![Deploy to Staging](https://github.com/rjicha/dgkralupy/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/rjicha/dgkralupy/actions/workflows/deploy-staging.yml)

CMS-based website for Gymnázium Kralupy - A git-based static site solution using Astro, Decap CMS, and GitHub Pages.

## Project Status

**Phase 1: Project Setup & Foundation** - ✅ Completed

- ✅ Node.js project initialized with TypeScript
- ✅ Astro configured as static site generator
- ✅ TailwindCSS set up for styling
- ✅ ESLint and Prettier configured
- ✅ Initial project structure created
- ✅ GitHub Actions CI/CD configured

**Phase 0: Current Website Analysis** - ⏳ Blocked (awaiting website access)

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm
- Docker and Docker Compose (optional, for local testing)

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Docker (Local Testing)

Test the production build locally without deploying:

```bash
# Build and start production container
npm run docker:build
npm run docker:up

# Or run in detached mode (background)
npm run docker:up:detached

# View logs
npm run docker:logs

# Stop container
npm run docker:down

# Development mode with hot reload (optional)
npm run docker:dev

# Clean up containers and volumes
npm run docker:clean
```

The production container will be available at: **http://localhost:8080**

The development container (if using docker:dev) will be available at: **http://localhost:4321**

### Project Structure

```
dgkralupy/
├── .github/
│   └── workflows/          # GitHub Actions for deployment
├── content/                # Content files (Markdown/JSON)
│   ├── articles/          # Blog articles
│   ├── pages/             # Static pages
│   └── settings/          # Site settings
├── public/                 # Static assets
│   ├── images/
│   └── fonts/
├── src/
│   ├── components/        # Reusable components
│   ├── layouts/           # Page layouts
│   ├── pages/             # Route pages
│   └── styles/            # Global styles
├── astro.config.mjs       # Astro configuration
├── tailwind.config.mjs    # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Deployment

### Staging Environment

- **URL**: https://rjicha.github.io/dgkralupy/
- **Deployment**: Automatic on push to `main` branch
- **Purpose**: Testing and stakeholder review

### Production Environment

- **URL**: https://dgkralupy.cz
- **Deployment**: Manual workflow dispatch (requires confirmation)
- **Purpose**: Live public website

## Documentation

- [Project Brief](PROJECT_BRIEF.md) - High-level overview and objectives
- [Requirements](REQUIREMENTS.md) - Functional and technical requirements
- [Tech Stack](TECH_STACK.md) - Technology choices and rationale
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [Workflow](WORKFLOW.md) - Development process and personas
- [Design Guidelines](DESIGN_GUIDELINES.md) - Design system (TBD)

## Tech Stack

- **Framework**: Astro 4.x
- **Styling**: TailwindCSS 3.x
- **Language**: TypeScript 5.x
- **CMS**: Decap CMS (to be configured)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Next Steps

1. Complete Phase 0: Analyze current website at www.dgkralupy.cz
2. Extract and implement design system (colors, typography, components)
3. Set up Decap CMS for content management
4. Configure authentication (Netlify Identity or GitHub OAuth)
5. Implement page templates and blog functionality
