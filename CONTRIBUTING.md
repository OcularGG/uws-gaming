# Contributing to KrakenGaming

Thank you for your interest in contributing to KrakenGaming! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots or logs when applicable

### Suggesting Features

1. **Check the roadmap** to see if your feature is already planned
2. **Open a feature request** using the appropriate template
3. **Explain the use case** and potential implementation
4. **Be open to discussion** and feedback

### Code Contributions

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** and existing patterns
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+ LTS
- npm (comes with Node.js)
- Git
- Docker (for local development)
- Google Cloud SDK (for deployment testing)

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/krakengaming.git
   cd krakengaming
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/krakengaming/platform.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 📋 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** - we use strict TypeScript configuration
- **Prefer explicit types** over `any`
- **Use meaningful names** for variables, functions, and classes

### Code Style

- **Use Prettier** for code formatting (configured in the project)
- **Follow ESLint rules** (configured in the project)
- **Use camelCase** for variables and functions
- **Use PascalCase** for classes and components
- **Use kebab-case** for file names

### React/Next.js

- **Use functional components** with hooks
- **Follow Next.js App Router** conventions
- **Use TypeScript interfaces** for props
- **Implement proper error boundaries**
- **Optimize for performance** (use React.memo, useMemo, etc.)

### Backend

- **Use Fastify plugins** for modularity
- **Implement proper error handling**
- **Use Zod schemas** for validation
- **Add comprehensive API documentation**
- **Follow REST conventions**

### Database

- **Use Prisma migrations** for schema changes
- **Add proper indexes** for performance
- **Use transactions** for data consistency
- **Follow database naming conventions**

## 🧪 Testing

### Test Requirements

- **Write tests** for new features
- **Maintain test coverage** above 80%
- **Test edge cases** and error conditions
- **Use appropriate test types**:
  - Unit tests for individual functions
  - Integration tests for API endpoints
  - E2E tests for critical user flows

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test -w @krakengaming/backend

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Documentation

### Code Documentation

- **Add JSDoc comments** for public APIs
- **Include examples** in documentation
- **Document complex logic** with inline comments
- **Keep README files** up to date

### API Documentation

- **Use OpenAPI/Swagger** for API documentation
- **Include request/response examples**
- **Document error responses**
- **Add authentication requirements**

## 🔍 Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

### Pull Request Guidelines

1. **Create a descriptive title** that summarizes the changes
2. **Fill out the PR template** completely
3. **Link related issues** using keywords (fixes #123)
4. **Add screenshots** for UI changes
5. **Request reviews** from relevant team members

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 🎯 Issue Labels

### Type Labels
- `bug` - Something isn't working
- `feature` - New feature request
- `enhancement` - Improvement to existing feature
- `documentation` - Documentation changes
- `refactor` - Code refactoring

### Priority Labels
- `priority/critical` - Critical issues
- `priority/high` - High priority
- `priority/medium` - Medium priority
- `priority/low` - Low priority

### Status Labels
- `status/needs-review` - Needs code review
- `status/in-progress` - Work in progress
- `status/blocked` - Blocked by dependencies
- `status/ready` - Ready for implementation

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Workflow

1. **Update version** in package.json files
2. **Update CHANGELOG.md** with release notes
3. **Create release branch** (`release/v1.2.3`)
4. **Run final tests** and quality checks
5. **Merge to main** and tag release
6. **Deploy to production** via GitHub Actions

## 🌟 Recognition

### Contributors

Contributors are recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Monthly highlights** in community updates

### Contribution Types

We recognize various types of contributions:
- 💻 **Code** - Bug fixes, features, improvements
- 📖 **Documentation** - Docs, tutorials, examples
- 🐛 **Bug Reports** - Issue identification and reporting
- 💬 **Community** - Helping others, discussions
- 🎨 **Design** - UI/UX improvements
- 🔧 **Infrastructure** - CI/CD, deployment, tooling

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and community support
- **Email** - Direct contact for sensitive issues

### Mentorship

- **First-time contributors** are welcome and supported
- **Mentorship available** for complex contributions
- **Pair programming sessions** for learning opportunities

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at conduct@krakengaming.org. All complaints will be reviewed and investigated promptly and fairly.

## 📄 License

By contributing to KrakenGaming, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to KrakenGaming! 🚀
