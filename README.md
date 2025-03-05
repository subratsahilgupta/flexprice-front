<p align="center">
  <img align="center" src="./assets/flexprice logo.svg" height="40%" width="40%"  alt="fleprice logo"/>
</p>
<h3 align="center">
<b>
⚡️ Usage metering and billing for AI companies ⚡️
</b>
</h3 >
<p align="center">
🌟 Built with developers in mind, so you don't have to create
billing and metering from scratch. 🌟
</p>

---

<h4 align="center">

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/flexpriceio)

</h4>

[Flexprice](https://flexprice.io) is a **developer first** answer to building and launching any pricing model and collecting usage data in real-time.

We have one goal - our friends should never have to write a billing system from scratch again.

## The struggle is real since AI is here

<img src="./assets/struggle.png" alt="Record Replay Testing"/>

In-house Billing Systems are a nightmare for Engineers. With rising use of AI workloads internally and building new AI features, it has become necessary to build metering and billing systems to track usage and costs.

Frequency of changes in pricing models is also increasing. These changes make it hard to manage existing subscriptions and require a lot of manual effort in terms of migrations and testing.

## The Solution: Flexprice

Usage metering, subscription management and infra cost into one stack

<img src="./assets/complex-iterations.png" alt="Record Replay Testing"/>

Developers don't need to spend **months** building internal metering and rating systems.

Flexprice offers APIs, SDKs, self serve UI widgets, internal dashboards and more to help you get started in minutes. With Flexprice, you can:

- **Evolve your pricing with flexibility**: We support Usage-based pricing, Minimum commitments, Volume discounts, Prepaid Credits, Upgrades and downgrades, etc.

- **Real-time overview AI Infrastructure Costs**: Optimize revenue operations and measure LLM Token Usage, GPU Time, Compute Hours, API Call Frequency and Duration, etc

- **Custom Invoice and Billing logic**: Raise invoices, manage billing cycles, apply discounts, taxes, grace period, payment terms, etc

<img src="./assets/open-arch.png" alt="Flexprice Dashboard"/>

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 16+
- npm/yarn
- Git

### Frontend Setup

1. **Clone & Install**

```bash
# Clone repository
git clone https://github.com/flexprice/flexprice-frontend
cd flexprice-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

2. **Configure Environment**

```bash
# Copy environment template
cp .env.example .env.local

# Update environment variables
# Get required API keys from team lead
```

3. **Install Required Extensions**

- ESLint
- Prettier
- Tailwind CSS IntelliSense

### Tech Stack

- React + TypeScript
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling

### Key Features

- Environment management
- Product catalog
- Customer management
- Subscription handling
- Usage tracking
- Invoice management

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── atoms/          # Basic components (buttons, inputs)
│   ├── molecules/      # Composite components
│   └── organisms/      # Complex components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── store/              # Global state management
├── utils/              # Helper functions
│   └── api_requests/   # API integration
├── models/             # TypeScript interfaces
└── core/               # Core application logic
```

## 📚 Development Guidelines

### Branch Management

```bash
# Create feature branch
git checkout -b feat/[feature-name]

# Create bugfix branch
git checkout -b fix/[bug-name]
```

### Best Practices

- Follow atomic design principles
- Keep components focused and single-responsibility
- Use TypeScript for type safety
- Implement proper error handling
- Write unit tests for critical logic
- Follow ESLint and Prettier rules

For detailed development guidelines, check our [Onboarding Guide](docs/onboarding.md).

## 👨🏻‍💻 Let's Build Together! 👩🏻‍💻

Whether you're a newbie coder or a wizard 🧙‍♀️, your perspective is golden. Take a peek at our:

📜 [Contribution Guidelines](CONTRIBUTING.md)

🏗️ [Local Development Setup](SETUP.md)

❤️ [Code of Conduct](CODE_OF_CONDUCT.md)

## ✨ Resources

📖 [API Docs](https://docs.flexprice.io/)

📚 [Onboarding Guide](docs/onboarding.md)

🎯 [Conventions & Best Practices](docs/conventions.md)

## 🆘 Need Help?

- Check our [Troubleshooting Guide](docs/onboarding.md#troubleshooting-common-issues)
- Join our [Discord Community](https://discord.gg/flexprice)
- Contact support@flexprice.io
