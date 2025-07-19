# Contributing to TransAIRobot Website

Thank you for your interest in contributing to the TransAIRobot website project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/transairobot-website.git`
3. Create a branch for your changes: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development Workflow

1. Make your changes
2. Run tests: `npm run test`
3. Ensure code passes linting: `npm run lint`
4. Commit your changes with a descriptive commit message
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a pull request to the main repository

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or tools

Example:
```
feat(store): add application filtering by category

- Added filter component
- Implemented filter logic in store
- Updated UI to show active filters

Closes #123
```

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Update the CHANGELOG.md with details of changes
3. The PR should work on the development environment
4. Ensure all tests pass and code meets linting standards
5. Request a review from at least one maintainer

## Coding Standards

- Follow the existing code style
- Write clear, commented, and testable code
- Keep components small and focused
- Use TypeScript for type safety
- Follow Vue.js best practices

## Testing

- Write unit tests for new functionality
- Ensure existing tests pass
- Test across different browsers and screen sizes

## Documentation

- Update documentation for any changed functionality
- Document new components in the component documentation
- Add JSDoc comments to functions and methods

## Reporting Bugs

When reporting bugs, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment information (browser, OS, etc.)

## Feature Requests

Feature requests are welcome! Please provide:

1. A clear and descriptive title
2. Detailed description of the proposed feature
3. Any relevant mockups or examples
4. Explanation of why this feature would be useful

## Questions?

If you have any questions, feel free to open an issue or contact the maintainers.

Thank you for contributing to TransAIRobot!
