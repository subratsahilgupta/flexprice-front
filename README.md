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
cp .env.example .env.local

# Configure these variables in .env.local:
VITE_API_URL=your-api-url
VITE_APP_ENV=development
VITE_AUTH_DOMAIN=your-auth-domain
VITE_AUTH_CLIENT_ID=your-client-id
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

## 💻 Development Tools

### Essential VS Code Extensions

Install these extensions for the best development experience:

```json
{
	"recommendations": [
		"dbaeumer.vscode-eslint",
		"esbenp.prettier-vscode",
		"bradlc.vscode-tailwindcss",
		"dsznajder.es7-react-js-snippets",
		"christian-kohler.path-intellisense"
	]
}
```

### Recommended Settings

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"typescript.tsdk": "node_modules/typescript/lib"
}
```

## 📚 Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

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

2. **Type Errors**

```bash
# Regenerate TypeScript types
npm run type-check
```

3. **Stale Development Server**

```bash
# Reset development server
npm run clean
npm run dev
```

## 📖 Additional Resources

- [Component Guidelines](docs/component-guidelines.md)
- [State Management Guide](docs/state-management.md)
- [Testing Best Practices](docs/testing.md)
- [API Integration Guide](docs/api-integration.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🆘 Need Help?

- Join our [Discord Community](https://discord.gg/flexprice)
- Email: support@flexprice.io
- Check our [FAQ](docs/FAQ.md)

## 📝 License

[MIT License](LICENSE)

---

Made with ❤️ by the FlexPrice Team
