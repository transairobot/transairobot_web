# TransAIRobot Website

A Vue.js-based web application for TransAIRobot's robot management platform. This application provides an interface for users to browse, install, and manage robot applications, as well as for developers to submit and manage their applications.

## Features

- Application store with search and filtering capabilities
- Robot management interface
- Developer portal for application submission and management
- Admin dashboard for application review and store management
- Responsive design with light and dark theme support
- Offline support with service worker

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/transairobot/website.git
   cd transairobot-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

### Available Scripts

- `npm run serve` - Start development server
- `npm run build` - Build for production
- `npm run build:staging` - Build for staging environment
- `npm run build:analyze` - Build with bundle analyzer
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run deploy:staging` - Build and deploy to staging
- `npm run deploy:prod` - Build and deploy to production

## Project Structure

```
transairobot-website/
├── .kiro/                  # Project specifications
├── docs/                   # Documentation
├── public/                 # Static assets
├── scripts/                # Deployment scripts
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── layouts/            # Layout components
│   ├── router/             # Vue Router configuration
│   ├── services/           # API services
│   ├── store/              # Vuex store
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── views/              # Page components
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── tests/                  # Test files
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── .env.staging            # Staging environment variables
├── .eslintrc.js            # ESLint configuration
├── babel.config.js         # Babel configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vue.config.js           # Vue CLI configuration
```

## Documentation

For detailed documentation, see the [docs](./docs) directory:

- [Component Usage](./docs/components.md)
- [API Integration](./docs/api-integration.md)
- [Theming Guide](./docs/theming.md)
- [Backend API Requirements](./docs/backend-api-requirements.md)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents of this project, via any medium, is strictly prohibited.
