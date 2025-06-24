# Development Setup Guide

This guide will help you set up the KrakenGaming development environment on your local machine.

## Prerequisites

### Required Software

1. **Node.js 20+**: Download from [nodejs.org](https://nodejs.org/)
2. **npm 8+**: Comes with Node.js
3. **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
4. **Git**: Download from [git-scm.com](https://git-scm.com/)
5. **VS Code** (recommended): Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Optional Tools

- **Postman**: For API testing
- **Discord Developer Portal**: For bot development
- **Google Cloud CLI**: For cloud development

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/krakengaming/krakengaming.git
cd krakengaming
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy environment template
npm run env:local

# Edit .env.local with your configuration
code .env.local
```

### 4. Start Development Services

```bash
# Start database and dependencies
docker-compose up -d

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start all services
npm run dev
```

Your application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Database: localhost:5432

## Detailed Setup

### Database Configuration

The project uses PostgreSQL with Prisma ORM.

#### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d database

# The database will be available at:
# Host: localhost
# Port: 5432
# Database: krakengaming_dev
# Username: krakengaming
# Password: password
```

#### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org

# Create database
createdb krakengaming_dev

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/krakengaming_dev"
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://krakengaming:password@localhost:5432/krakengaming_dev"

# Discord Bot (optional for frontend development)
DISCORD_BOT_TOKEN="your-test-bot-token"
DISCORD_CLIENT_ID="your-discord-client-id"

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"

# API Configuration
API_PORT=4000
JWT_SECRET="dev-secret-not-for-production"
```

### Discord Bot Setup

1. **Create Discord Application**:
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Give it a name (e.g., "KrakenGaming Dev Bot")

2. **Create Bot**:
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy the token to your `.env.local`

3. **Invite Bot to Server**:
   - Go to "OAuth2" > "URL Generator"
   - Select "bot" and "applications.commands"
   - Select required permissions
   - Use generated URL to invite bot

### VS Code Setup

#### Recommended Extensions

Install these VS Code extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "Prisma.prisma",
    "ms-playwright.playwright",
    "GitHub.copilot",
    "ms-vscode.vscode-docker"
  ]
}
```

#### Workspace Settings

The project includes VS Code workspace settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Development Workflow

### Starting Development

```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
npm run dev:bot         # Discord bot only
```

### Making Changes

1. **Frontend Changes**: Auto-reload at http://localhost:3000
2. **Backend Changes**: Auto-restart with tsx watch
3. **Database Changes**: Use Prisma migrations

### Database Workflow

```bash
# Make schema changes in prisma/schema.prisma

# Generate migration
npx prisma migrate dev --name your-migration-name

# Generate Prisma client
npm run db:generate

# View database
npm run db:studio
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test -w @krakengaming/frontend
npm run test -w @krakengaming/backend
npm run test -w @krakengaming/discord-bot

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Linting and Formatting

```bash
# Lint all workspaces
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npx prettier --write .
```

## Project Structure

```
krakengaming/
├── apps/
│   ├── frontend/          # Next.js frontend
│   ├── backend/           # Fastify API server
│   └── discord-bot/       # Discord bot
├── packages/
│   ├── database/          # Prisma schema and migrations
│   └── tests/             # Shared test utilities
├── infrastructure/        # Cloud infrastructure configs
├── docs/                  # Documentation
├── monitoring/            # Monitoring configurations
└── .github/               # CI/CD workflows
```

### Frontend (Next.js)

```
apps/frontend/
├── src/
│   ├── app/               # App Router pages
│   ├── components/        # Reusable components
│   ├── lib/               # Utility functions
│   └── styles/            # Global styles
├── public/                # Static assets
└── package.json
```

### Backend (Fastify)

```
apps/backend/
├── src/
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── config/            # Configuration
└── package.json
```

### Discord Bot

```
apps/discord-bot/
├── src/
│   ├── commands/          # Slash commands
│   ├── events/            # Discord events
│   ├── core/              # Core functionality
│   └── utils/             # Utility functions
└── package.json
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create route file in `apps/backend/src/routes/`
2. Add schema validation with Zod
3. Register route in `src/index.ts`
4. Add tests in `src/__tests__/`
5. Update API documentation

### Adding a New Frontend Page

1. Create page in `apps/frontend/src/app/`
2. Add necessary components
3. Update navigation if needed
4. Add tests in `__tests__/`
5. Update meta tags and SEO

### Adding a Discord Command

1. Create command file in `apps/discord-bot/src/commands/`
2. Implement command logic
3. Register command in deployment script
4. Add tests
5. Deploy commands to Discord

### Database Changes

1. Update `packages/database/prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Update seed data if needed
4. Test changes with `npm run db:studio`

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find and kill process using port
npx kill-port 3000
npx kill-port 4000
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart database

# Reset database
npm run db:reset
```

#### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Prisma Issues

```bash
# Reset Prisma client
npm run db:generate

# Reset database completely
npm run db:reset
npm run db:migrate
npm run db:seed
```

### Getting Help

1. **Check the logs**: Most issues will show in terminal output
2. **Check environment variables**: Ensure all required vars are set
3. **Check dependencies**: Run `npm install` to ensure all deps are installed
4. **Check Discord**: Join our development Discord server
5. **Create an issue**: Use GitHub issues for bugs and feature requests

## Performance Tips

### Development Performance

1. **Use --turbopack**: Next.js development is faster with Turbo
2. **Limit console output**: Set LOG_LEVEL=warn in development
3. **Use specific test patterns**: Run specific tests instead of full suite
4. **Close unused applications**: Free up system resources

### Database Performance

1. **Use database connection pooling**: Configured in Prisma
2. **Monitor slow queries**: Use database query logging
3. **Use indexes**: Add indexes for frequently queried fields
4. **Optimize migrations**: Keep migrations small and focused

## Security Notes

### Development Security

1. **Never commit secrets**: Use `.env.local` for sensitive data
2. **Use test tokens**: Don't use production tokens in development
3. **Keep dependencies updated**: Regular dependency audits
4. **Use HTTPS locally**: Configure local SSL if needed

### Discord Bot Security

1. **Use test server**: Don't test on production Discord servers
2. **Limit permissions**: Only request necessary bot permissions
3. **Validate inputs**: Always validate and sanitize user inputs
4. **Rate limiting**: Implement rate limiting for commands

## Next Steps

After setup, you might want to:

1. **Read the codebase**: Explore existing code to understand patterns
2. **Run tests**: Ensure everything works correctly
3. **Make a small change**: Try adding a simple feature
4. **Join Discord**: Connect with the development team
5. **Check issues**: Look for "good first issue" labels on GitHub

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Fastify Documentation**: https://www.fastify.io/docs/
- **Discord.js Guide**: https://discordjs.guide/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
