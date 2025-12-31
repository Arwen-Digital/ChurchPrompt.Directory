# 🙏 Church Prompt Directory

A community-driven AI prompt directory built for churches, church leaders, and ministry staff. Discover, share, and run AI prompts tailored for sermon preparation, pastoral care, administration, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-ff5d01.svg)](https://astro.build)
[![Powered by Convex](https://img.shields.io/badge/Powered%20by-Convex-f9a825.svg)](https://convex.dev)

## ✨ Features

- **Browse & Search** — Explore prompts organized by category: Sermon Preparation, Pastoral Care, Administrative Tasks, Social Media, Event Planning, and Teaching
- **Copy to Clipboard** — One-click copy for any prompt with usage tracking
- **Run Prompts with AI** — Execute prompts directly in-app using Perplexity Sonar via OpenRouter (subscription required)
- **Community Contributions** — Submit your own prompts for admin review and approval
- **User Profiles** — Track your submissions, favorites, and execution history
- **Admin Dashboard** — Moderation queue for reviewing and approving submitted prompts
- **Anonymous Access** — Browse up to 10 prompts before creating a free account

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Astro](https://astro.build) (Hybrid SSR + Static) |
| UI Components | [React](https://react.dev) (islands architecture) |
| Styling | [TailwindCSS](https://tailwindcss.com) |
| Backend & Database | [Convex](https://convex.dev) |
| Authentication | [Clerk](https://clerk.com) |
| AI Provider | [OpenRouter](https://openrouter.ai) (Perplexity Sonar) |
| Payments | [Polar](https://polar.sh) (subscription management) |

## 📋 Prerequisites

- **Node.js** ≥ 18.20.8
- **npm** or **yarn**
- A **Convex** account — [Sign up free](https://convex.dev)
- A **Clerk** account — [Sign up free](https://clerk.com)
- An **OpenRouter** API key — [Get one here](https://openrouter.ai) (for AI execution features)
- *(Optional)* A **Polar** account for subscription/payment features

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/church-prompt-directory.git
cd church-prompt-directory
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Convex

```bash
npx convex dev
```

This will prompt you to log in and create a new Convex project. Follow the instructions to initialize your deployment.

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud
CONVEX_URL=https://<your-convex-deployment>.convex.cloud

# Clerk Authentication
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenRouter (for AI execution)
OPENROUTER_API_KEY=sk-or-...
```

### 5. Set Convex Environment Variables

```bash
# Clerk webhook secret (for user sync)
npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."

# OpenRouter API key
npx convex env set OPENROUTER_API_KEY "sk-or-..."
```

### 6. Configure Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Add your publishable and secret keys to `.env.local`
3. Create a **JWT Template** named `convex`:
   - **Audience** (`aud`): `convex`
   - **Issuer** (`iss`): Your Clerk domain (e.g., `https://example.clerk.accounts.dev`)
4. Configure the webhook:
   - **URL**: `https://<your-convex-deployment>.convex.cloud/clerk/webhook`
   - **Events**: `user.created`, `user.updated`, `user.deleted`

### 7. Run Development Server

```bash
# Start Astro dev server
npm run dev

# In a separate terminal, start Convex dev
npm run convex:dev
```

Visit [http://localhost:4321](http://localhost:4321) to see the app.

## 📁 Project Structure

```text
.
├── src/
│   ├── pages/          # Astro route files
│   ├── components/     # React components
│   ├── layouts/        # Astro layouts
│   └── lib/            # Utility functions
├── convex/             # Convex backend (schema, queries, mutations, webhooks)
├── public/             # Static assets
├── scripts/            # Migration and utility scripts
├── tests/              # Test files
└── docs/               # Documentation
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚢 Deployment

### Convex

Deploy your Convex functions to production:

```bash
npx convex deploy
```

### Frontend

The Astro app can be deployed to any Node.js-compatible hosting platform:

- **Vercel** — `npm run build && vercel deploy`
- **Netlify** — Connect your repo and set build command to `npm run build`
- **Railway/Render** — Use the included `Dockerfile`
- **Self-hosted** — Use `docker-compose.yml` for containerized deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📖 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Astro development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run convex:dev` | Start Convex development server |
| `npm run convex:deploy` | Deploy Convex functions to production |
| `npm test` | Run test suite |
| `npm run migrate:seed` | Run data migration scripts |

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please read our contributing guidelines and ensure your code follows the existing style.

### Ideas for Contributions

- 🌍 Multi-language support
- ⭐ Prompt ratings and reviews
- 📊 Advanced analytics dashboard
- 🔗 API access for integrations
- 📚 Prompt collections/bundles

## 🐛 Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `identity: null` in Convex logs | Missing JWT template | Create `convex` template in Clerk with `aud` claim |
| Webhook 400 invalid signature | Wrong Svix secret | Reset via `npx convex env set CLERK_WEBHOOK_SECRET` |
| Admin UI missing | Role not set | Update user record with `role: 'admin'` in Convex |
| AI execution not working | Missing API key | Set `OPENROUTER_API_KEY` in Convex environment |

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgments

- Built with ❤️ for the church community
- Powered by [Convex](https://convex.dev), [Clerk](https://clerk.com), and [OpenRouter](https://openrouter.ai)

---

**Questions or feedback?** Open an issue or start a discussion!
