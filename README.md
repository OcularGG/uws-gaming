# KrakenGaming - Cloud-Native Gaming Platform

[![CI/CD Pipeline](https://github.com/krakengaming/platform/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/krakengaming/platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

A production-grade, cloud-native gaming platform built with modern web technologies and deployed on Google Cloud Platform.

## 🌟 Features

- **🚀 Next.js 15+ Frontend** - Modern React application with TypeScript and Tailwind CSS
- **⚡ Fastify Backend API** - High-performance Node.js API with comprehensive documentation
- **🤖 Discord Bot Integration** - Multipurpose Discord bot with modular architecture
- **🐘 PostgreSQL Database** - Robust data persistence with Prisma ORM
- **☁️ Cloud-Native Architecture** - Deployed on Google Cloud Platform with auto-scaling
- **🔒 Security First** - Comprehensive security measures and best practices
- **📊 Monitoring & Observability** - Integrated logging, monitoring, and error tracking
- **🔄 CI/CD Pipeline** - Automated testing, building, and deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Discord Bot    │
│   (Next.js)     │    │   (Fastify)     │    │   (Discord.js)  │
│                 │    │                 │    │                 │
│ • Home Page     │◄──►│ • Health Checks │    │ • Commands      │
│ • Legal Pages   │    │ • Maintenance   │    │ • Events        │
│ • Error Pages   │    │ • OpenAPI Docs  │    │ • Modular       │
│ • Maintenance   │    │ • Rate Limiting │    │ • Scalable      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │  (PostgreSQL)   │
                    │                 │
                    │ • Prisma ORM    │
                    │ • Migrations    │
                    │ • Backups       │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- npm or yarn
- Docker (optional, for containerization)
- Google Cloud SDK (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/krakengaming/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Start all services
   npm run dev

   # Or start individual services
   npm run dev:frontend  # Frontend at http://localhost:3000
   npm run dev:backend   # Backend at http://localhost:4000
   npm run dev:bot       # Discord bot
   ```

### Using Docker Compose

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
krakengaming/
├── apps/
│   ├── frontend/          # Next.js application
│   ├── backend/           # Fastify API server
│   └── discord-bot/       # Discord bot
├── packages/
│   ├── database/          # Prisma schema and utilities
│   └── shared/            # Shared utilities and types
├── infrastructure/        # Google Cloud setup scripts
├── .github/
│   └── workflows/         # CI/CD pipeline
├── docs/                  # Additional documentation
└── docker-compose.yml     # Local development setup
```

## 🛠️ Development

### Available Scripts

#### Root Level
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications
- `npm run lint` - Lint all code
- `npm run test` - Run all tests
- `npm run clean` - Clean all build artifacts

#### Frontend (`apps/frontend`)
- `npm run dev -w @krakengaming/frontend` - Start development server
- `npm run build -w @krakengaming/frontend` - Build for production
- `npm run start -w @krakengaming/frontend` - Start production server
- `npm run lint -w @krakengaming/frontend` - Lint code

#### Backend (`apps/backend`)
- `npm run dev -w @krakengaming/backend` - Start development server
- `npm run build -w @krakengaming/backend` - Build for production
- `npm run start -w @krakengaming/backend` - Start production server
- `npm run test -w @krakengaming/backend` - Run tests

#### Discord Bot (`apps/discord-bot`)
- `npm run dev -w @krakengaming/discord-bot` - Start development bot
- `npm run build -w @krakengaming/discord-bot` - Build for production
- `npm run deploy:commands -w @krakengaming/discord-bot` - Deploy slash commands

#### Database (`packages/database`)
- `npm run generate -w @krakengaming/database` - Generate Prisma client
- `npm run migrate -w @krakengaming/database` - Run migrations
- `npm run studio -w @krakengaming/database` - Open Prisma Studio

### Adding New Features

1. **Frontend Pages**: Add new pages in `apps/frontend/src/app/`
2. **API Endpoints**: Add routes in `apps/backend/src/routes/`
3. **Discord Commands**: Add commands in `apps/discord-bot/src/commands/`
4. **Database Models**: Update schema in `packages/database/prisma/schema.prisma`

## 🌐 Deployment

### Google Cloud Platform

The application is designed to run on Google Cloud Platform with the following services:

- **Cloud Run** - Frontend, Backend, and Discord Bot
- **Cloud SQL** - PostgreSQL database
- **Cloud Storage** - Static assets and file storage
- **Secret Manager** - Secure configuration management
- **Cloud Monitoring** - Observability and alerting

### Infrastructure Setup

1. **Run the setup script**
   ```bash
   chmod +x infrastructure/setup.sh
   ./infrastructure/setup.sh
   ```

2. **Configure GitHub Actions secrets**
   - `GCP_PROJECT_ID` - Your Google Cloud project ID
   - `GCP_SA_KEY` - Service account JSON key

3. **Update Discord secrets**
   ```bash
   # Update with your actual Discord bot credentials
   echo "your_discord_bot_token" | gcloud secrets versions add discord-bot-token-prod --data-file=-
   echo "your_discord_client_id" | gcloud secrets versions add discord-client-id-prod --data-file=-
   echo "your_discord_client_secret" | gcloud secrets versions add discord-client-secret-prod --data-file=-
   ```

4. **Deploy via GitHub Actions**
   - Push to `main` branch for production deployment
   - Push to `preview` branch for preview deployment
   - Pull requests automatically create ephemeral preview environments

### Manual Deployment

```bash
# Build and deploy frontend
npm run build -w @krakengaming/frontend
gcloud run deploy krakengaming-frontend \
  --source=apps/frontend \
  --platform=managed \
  --region=us-central1

# Build and deploy backend
npm run build -w @krakengaming/backend
gcloud run deploy krakengaming-backend \
  --source=apps/backend \
  --platform=managed \
  --region=us-central1

# Build and deploy Discord bot
npm run build -w @krakengaming/discord-bot
gcloud run deploy krakengaming-discord-bot \
  --source=apps/discord-bot \
  --platform=managed \
  --region=us-central1
```

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
```

#### Backend (`.env.local`)
```env
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@localhost:5432/krakengaming
JWT_SECRET=your-jwt-secret
SENTRY_DSN=your-sentry-dsn
CORS_ALLOWED_ORIGINS=http://localhost:3000
MAINTENANCE_MODE=false
```

#### Discord Bot (`.env.local`)
```env
NODE_ENV=development
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
API_BASE_URL=http://localhost:4000
LOG_LEVEL=debug
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test -w @krakengaming/backend

# Run tests in watch mode
npm run test:watch -w @krakengaming/frontend

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests** - Individual function and component testing
- **Integration Tests** - API endpoint and database testing
- **E2E Tests** - Full application flow testing with Playwright

## 📊 Monitoring & Observability

### Logging

- **Structured Logging** - JSON formatted logs with correlation IDs
- **Cloud Logging** - Centralized log aggregation in Google Cloud
- **Log Levels** - Configurable log levels for different environments

### Monitoring

- **Cloud Monitoring** - Infrastructure and application metrics
- **Uptime Checks** - Automated health monitoring
- **Custom Metrics** - Application-specific metrics and dashboards

### Error Tracking

- **Sentry Integration** - Real-time error tracking and alerting
- **Performance Monitoring** - Application performance insights
- **Error Aggregation** - Intelligent error grouping and notification

## 🔒 Security

### Security Features

- **HTTPS Everywhere** - TLS encryption for all communications
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Configuration** - Proper cross-origin resource sharing
- **Security Headers** - Comprehensive security headers via Helmet.js
- **Input Validation** - Request validation with Zod schemas
- **Secret Management** - Secure storage in Google Secret Manager

### Security Best Practices

- Regular dependency updates with Dependabot
- Vulnerability scanning with Trivy
- Least privilege IAM roles
- VPC connectors for database access
- Non-root container images

## 💰 Cost Estimation

### Monthly Cost Breakdown (Production + Preview)

| Service | Production | Preview | Total |
|---------|------------|---------|-------|
| Cloud Run (Frontend + API) | $5 | $5 | $10 |
| Cloud Run (Discord Bot) | $2 | $2 | $4 |
| Cloud SQL (PostgreSQL) | $7 | $7 | $14 |
| Cloud Storage (10GB) | $0.26 | $0.26 | $0.52 |
| Secret Manager | $0.36 | $0.36 | $0.72 |
| Monitoring/Logging | Free Tier | Free Tier | $0 |
| Domain/CDN/SSL | $1 | $0 | $1 |
| **Total Estimated** | **$15.62** | **$14.62** | **$30.24** |

*Note: Costs scale with usage. Free tier limits apply.*

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code style and conventions
- Add JSDoc comments for public APIs
- Ensure all tests pass and coverage is maintained

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - [docs.krakengaming.org](https://docs.krakengaming.org)
- **Discord** - [Join our Discord](https://discord.gg/krakengaming)
- **Issues** - [GitHub Issues](https://github.com/krakengaming/platform/issues)
- **Email** - support@krakengaming.org

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Fastify](https://www.fastify.io/)
- Database management with [Prisma](https://www.prisma.io/)
- Discord integration via [Discord.js](https://discord.js.org/)
- Deployed on [Google Cloud Platform](https://cloud.google.com/)

---

<div align="center">
  <p>Made with ❤️ by the KrakenGaming team</p>
  <p>
    <a href="https://krakengaming.org">Website</a> •
    <a href="https://docs.krakengaming.org">Documentation</a> •
    <a href="https://discord.gg/krakengaming">Discord</a> •
    <a href="https://twitter.com/krakengaming">Twitter</a>
  </p>
</div>
