# dgkralupy.cz

[![Deploy to GitHub Pages](https://github.com/rjicha/dgkralupy/actions/workflows/deploy.yml/badge.svg)](https://github.com/rjicha/dgkralupy/actions/workflows/deploy.yml)

Modern static website for Gymnázium Kralupy built with Astro and deployed to GitHub Pages.

## Project Status

**Overall Progress: ~20-25%**

**Phase 0: Current Website Analysis** - ✅ ~95% Complete

- ✅ Website structure analysis (6 main sections, 35+ subsections documented)
- ✅ Content audit and inventory complete
- ✅ Component library identified and documented
- ✅ Design system documentation created
- ✅ Color scheme and typography extracted
- ⏳ Reference screenshots (optional)

**Phase 1: Project Setup & Foundation** - ✅ ~85% Complete

- ✅ Node.js project initialized with TypeScript
- ✅ Astro configured as static site generator
- ✅ TailwindCSS set up for styling
- ✅ ESLint and Prettier configured
- ✅ Initial project structure created
- ✅ GitHub Actions CI/CD configured
- ✅ Docker setup for local testing

**Phase 2: Frontend Development** - ⏳ ~30% Complete

- ✅ Homepage with featured articles and quick links
- ✅ News listing page (/aktualne) with sorting and filtering
- ✅ Article detail pages with full content and related articles
- ✅ Real images fetched from original website (6 article images)
- ✅ Responsive article cards and hero components
- ✅ Base layout with navigation and footer
- ⏳ Complete navigation menu implementation
- ⏳ Additional page templates and components

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

The site is automatically deployed to GitHub Pages on every push to the `main` branch.

- **URL**: https://rjicha.github.io/dgkralupy/
- **Deployment**: Automatic via GitHub Actions
- **Workflow**: `.github/workflows/deploy.yml`

### Content Management

Content is managed by editing Markdown files directly:
- **Articles**: `src/content/articles/*.md`
- **Pages**: `src/content/pages/*.md`
- **Settings**: `src/content/contacts/`, `src/content/navigation/`, etc.

You can edit files using:
- VS Code or any text editor locally
- GitHub's web interface (click "Edit" on any file)
- Any Git client

After committing and pushing changes, the site rebuilds automatically.

## Documentation

- [Project Brief](docs/PROJECT_BRIEF.md) - High-level overview and objectives
- [Requirements](docs/REQUIREMENTS.md) - Functional and technical requirements
- [Tech Stack](docs/TECH_STACK.md) - Technology choices and rationale
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [Workflow](docs/WORKFLOW.md) - Development process and personas
- [Phase 0 Analysis](docs/PHASE_0_ANALYSIS.md) - Current website analysis and findings
- [Design System](docs/DESIGN_SYSTEM.md) - Design system and component specifications

## Tech Stack

- **Framework**: Astro 5.x
- **Styling**: TailwindCSS 3.x
- **Language**: TypeScript 5.x
- **Content**: Markdown files with frontmatter
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Recent Updates (2025-12-02)

### Completed Features
- **News System**: Full news/articles functionality with listing and detail pages
- **Real Content**: Homepage, news listing, and 6 article detail pages with real images
- **Image Assets**: All article images fetched from original dgkralupy.cz website
- **Responsive Design**: Mobile-friendly layouts using TailwindCSS
- **Mock Data**: Comprehensive mock data structure for development

### Available Pages
- **Homepage**: `/` - Featured articles, quick links, upcoming events
- **News Listing**: `/aktualne` - All articles with sorting, tags, and pagination structure
- **Article Details**: `/aktualne/[slug]` - Individual article pages with related articles

## Next Steps

1. Implement complete navigation menu with all sections
2. Create additional page templates (About, Studies, Activities, Contacts)
3. Add search functionality
4. Implement image optimization
5. Add content editing documentation for non-technical users
