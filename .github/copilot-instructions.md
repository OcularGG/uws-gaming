# KrakenGaming Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is the KrakenGaming cloud-native web application with the following components:

### Tech Stack
- **Frontend**: Next.js 15+ with TypeScript, Tailwind CSS, App Router
- **Backend**: Fastify API server with TypeScript
- **Discord Bot**: Discord.js with TypeScript, modular architecture
- **Database**: PostgreSQL with Prisma ORM
- **Infrastructure**: Google Cloud Platform (Cloud Run, Cloud SQL, Cloud Storage)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry for error tracking

### Domain Configuration
- **Production**: krakengaming.org
- **Preview**: preview.krakengaming.org
- **Local Development**: localhost:3000 (frontend), localhost:4000 (API), localhost:3001 (bot)

### Code Guidelines
- Use TypeScript strict mode
- Follow Next.js best practices with App Router
- Use Tailwind CSS for styling with design system approach
- Implement proper error handling and logging
- Write comprehensive tests (Jest for unit, Playwright for E2E)
- Use environment-based configuration
- Follow security best practices
- Implement proper Docker containerization

### Architecture Patterns
- Monorepo structure with separate apps (frontend, backend, discord-bot)
- Shared utilities and types in packages directory
- Environment-specific configurations
- Microservices ready with proper separation of concerns
- Cloud-native design patterns

### Environment Variables
- Use `.env.local` for local development
- Use `.env.production` for production config
- Use `.env.preview` for preview environment
- Store secrets in Google Secret Manager

When generating code, ensure it follows these patterns and integrates well with the existing cloud-native architecture.
