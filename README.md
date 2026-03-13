# Breach26 Full-Stack Template

A modern Next.js 15+ template with authentication, database ORM, and UI components.

## 🚀 Features

- **Next.js 15 (App Router)** - React framework for the web.
- **Better Auth** - Lightweight, secure, and extensible authentication.
- **Prisma** - Next-generation ORM with a custom output directory.
- **shadcn/ui** - Reusable UI components from shadcn.
- **Tailwind CSS** - Utility-first CSS framework.
- **Bun** - Fast JavaScript runtime & package manager.

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd breach26
```

### 2. Install dependencies
```bash
bun install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your_long_random_secret" # Generate one: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers (Required for Google Login)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 4. Database Setup
Register the models and generate the Prisma Client:

```bash
bunx prisma generate
bunx prisma migrate dev --name init
```

### 5. Start the development server
```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

## 🔐 Authentication Implementation

This template comes with a pre-configured auth system:
- **Client Client**: [lib/auth-client.ts](lib/auth-client.ts)
- **Server Instance**: [lib/auth.ts](lib/auth.ts)
- **API Handler**: [app/api/auth/[...better-auth]/route.ts](app/api/auth/[...better-auth]/route.ts)
- **Pages**: [app/signin/page.tsx](app/signin/page.tsx) and [app/signup/page.tsx](app/signup/page.tsx)

## 📁 Project Structure

- `app/` - Next.js App Router pages and API routes.
- `components/` - React components including UI from shadcn.
- `lib/` - Shared utilities, database client, and auth configuration.
- `prisma/` - Database schema and migrations.

