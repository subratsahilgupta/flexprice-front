<p align="center">
  <img align="center" src="./assets/flexprice logo.svg" height="40%" width="40%"  alt="fleprice logo"/>
</p>
<h3 align="center">
<b>
⚡️ FlexPrice Frontend - Modern UI for Usage Metering and Billing ⚡️
</b>
</h3>
<p align="center">
🌟 A powerful React-based dashboard for managing AI company billing and usage metrics 🌟
</p>

---

<h4 align="center">

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/flexpriceio)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</h4>

## 🎯 Features

- **💫 Modern React Dashboard**: Built with React 18, TypeScript, and Vite for optimal performance
- **🎨 Beautiful UI Components**: Utilizing Shadcn UI and Tailwind CSS for a sleek design
- **📊 Real-time Analytics**: Live usage metrics and billing information
- **🔐 Secure Authentication**: Built-in auth system with role-based access
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Setup (One-Click Development)

### Prerequisites

- Node.js 16+ and npm/yarn
- Git
- VS Code (recommended)

### One-Click Setup Script

```bash
# Clone the flexprice front repo
git clone https://github.com/flexprice/flexprice-front
cd flexprice-front
./setup

```

The setup script will:

1. Set up environment variables
2. Install dependencies
3. Build Docker Image
4. Start the development server

## 🛠 Manual Development Setup

1. **Clone & Install**

```bash
git clone https://github.com/flexprice/flexprice-front
cd flexprice-front
npm install
```

2. **Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Configure these variables in .env.local:
VITE_SUPABASE_URL=your-supabase-utl

VITE_SUPABASE_ANON_KEY=your-supabse-anon-key

VITE_API_URL=http://localhost:8080/v1 or <your-backend-url>

VITE_ENVIRONMENT=development

```

3. **Start Development**

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app running!

## 🏗 Project Structure

```
src/
├── components/          # UI Components
│   ├── atoms/          # Basic UI elements
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Card/
│   ├── molecules/      # Composite components
│   │   ├── Forms/
│   │   ├── Charts/
│   │   └── Tables/
│   └── organisms/      # Complex UI sections
│       ├── Dashboard/
│       ├── Billing/
│       └── Analytics/
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── store/              # State management
├── utils/              # Helper functions
├── models/             # TypeScript types
└── core/              # Core business logic
```

## 🌐 Self-Hosting Guide

### Docker Deployment

1. **Build the Docker image**

```bash
docker build -t flexprice-frontend .
```

2. **Run the container**

```bash
docker run -p 80:80 \
  -e VITE_API_URL=your-api-url \
  -e VITE_AUTH_DOMAIN=your-auth-domain \
  flexprice-frontend
```

### Manual Deployment

1. **Build the application**

```bash
npm run build
```

2. **Serve the static files**

```bash
# Using nginx
cp nginx.conf /etc/nginx/conf.d/flexprice.conf
nginx -s reload

# Or using serve
npx serve -s dist
```

## 📚 Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors
npm run format      # Format with Prettier
```

## 🔧 Common Development Tasks

### Adding New Features

1. Create a feature branch:

```bash
git checkout -b feat/new-feature
```

2. Create component structure:

```bash
mkdir -p src/components/organisms/NewFeature
touch src/components/organisms/NewFeature/index.tsx
touch src/components/organisms/NewFeature/NewFeature.test.tsx
```

3. Add route (if needed):

```tsx
// src/core/routes/Routes.tsx
import NewFeature from '@/components/organisms/NewFeature'

// Add to routes array
{
  path: '/new-feature',
  element: <NewFeature />
}
```

### Styling Components

We use Tailwind CSS with custom configurations:

```tsx
// Example component with Tailwind
const Button = ({ children }) => <button className='px-4 py-2 bg-primary hover:bg-primary-dark rounded-md'>{children}</button>;
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**

```bash
# Clear dependencies and cache
rm -rf node_modules
rm -rf .vite
npm install
```

2. **Stale Development Server**

```bash
# Reset development server
rm -rf node_modules
rm -rf .vite
npm install
npm run dev
```

## 📚 Documentation

Our comprehensive documentation covers all aspects of the FlexPrice frontend:

### Getting Started

- [Getting Started Guide](docs/getting-started.md) - Quick setup and first steps
- [Project Structure](docs/project-structure.md) - Understanding the codebase organization
- [Conventions](docs/conventions.md) - Coding standards and best practices

### Development Guides

- [Component Guidelines](docs/component-guidelines.md) - Building and maintaining UI components
- [State Management](docs/state-management.md) - Managing application state with Zustand and Context
- [API Integration](docs/api-integration.md) - Working with the backend API
- [Onboarding Guide](docs/onboarding.md) - New developer onboarding process

### Additional Resources

<!-- - [FAQ](docs/FAQ.md) - Common questions and answers -->

- [Flexprice Docs](https://docs.flexprice.io/introduction) - Documenttation for Flexprice sdk and Apis
- [Contributing Guide](docs/getting-started.md) - How to contribute to the project

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please read our [Contributing Guide](docs/getting-started.md) for details.

## 🆘 Need Help?

<!-- - Join our [Discord Community](https://discord.gg/flexprice) -->

- Email: ola@flexprice.io
<!-- - Check our [FAQ](docs/FAQ.md) -->

## 📝 License

[MIT License](LICENSE)

---

Made with ❤️ by the FlexPrice Team
