# TravelMind ✈️

> The easiest way to plan your next unforgettable journey. 

TravelMind is an AI-powered travel planning SaaS web application designed to help real people plan real trips. Drawing inspiration from modern, aspirational travel platforms, TravelMind features a warm, trustworthy, and premium interface that makes users excited about travel and confident in their plans.

## 🌟 Key Features

- **AI-Powered Itinerary Generation**: Tell our AI where you want to go, when, and your preferences (e.g., "5 days in Bali with beaches and temples") and get a fully personalized, day-by-day itinerary in under 2 minutes.
- **Discover & Explore**: Browse trending and curated popular destinations with rich images, localized pricing, and integrated weather insights.
- **Smart Dashboard**: A sleek, user-centric dashboard to manage your active trips, upcoming events, and travel history.
- **Integrated Weather & Maps**: Contextual weather forecasts and interactive Leaflet maps baked directly into your trip proposals.
- **Interactive Planner**: A finely-tuned onboarding flow to gather trip details—budget, travel style, interests, and dates—to feed into the RAG-enhanced generation model.
- **Secure Authentication**: Passwordless or social logins powered by `better-auth`.
- **Premium UI/UX**: A responsive, meticulously crafted "white-first" aesthetic utilizing *Playfair Display* for beautiful, editorial typography and *DM Sans* for crisp UI elements.

---

## 🏗️ Architecture & Tech Stack

TravelMind is built on a modern, robust, and scalable full-stack TypeScript architecture:

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend & Database
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Validation**: [Zod](https://zod.dev/) & React Hook Form

### AI & Retrieval-Augmented Generation (RAG)
- **Orchestration**: [LangChain](https://js.langchain.com/)
- **LLM**: Google Gemini (`@langchain/google-genai`)
- **Vector Database**: [Pinecone](https://www.pinecone.io/)
- **Embeddings capability**: `pgvector` supported

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18 or newer
- **Bun**: v1 or newer (recommended package manager)
- **PostgreSQL**: A running instance (local or hosted like Supabase / Neon)
- **API Keys**: Access to Google Gemini AI and Pinecone (if using RAG features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/travelmind.git
   cd travelmind
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```
   *(Note: The project uses `bun.lock`, so `bun` is preferred over `npm` or `yarn`)*

3. **Set up environment variables**
   Copy the `env.example` file to create your local `.env` configuration.
   ```bash
   cp .env.example .env
   ```
   Populate the `.env` file with your database connection strings and required API keys.

   **Required Variables:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/travelmind"
   GOOGLE_GENAI_API_KEY="your_gemini_api_key_here"
   PINECONE_API_KEY="your_pinecone_api_key"
   BETTER_AUTH_SECRET="your_auth_secret_string"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the Database**
   Push the Prisma schema to your PostgreSQL database and generate the client:
   ```bash
   bunx prisma db push
   bunx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   bun run dev
   ```
   The application will be running at `http://localhost:3000`.

---

## 📂 Project Structure

```text
travelmind/
├── app/                  # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── (dashboard)/      # Protected application routes (planner, wishlist)
│   ├── api/              # Backend API routes (REST endpoints)
│   └── globals.css       # Global design tokens and Tailwind config
├── components/           # Reusable React components
│   ├── layout/           # Sidebar, Navigation, Wrappers
│   ├── map/              # Leaflet Map integration components
│   └── ui/               # shadcn/ui primitives
├── lib/                  # Utility functions, stores, and integrations
│   ├── generated/        # Generated Prisma client
│   ├── stores/           # Zustand state management
│   └── db.ts             # Prisma singleton client
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma data models
└── public/               # Static assets (fonts, images)
```

---

## 📜 Available Scripts

In the project directory, you can run:

- `bun run dev` - Runs the app in the development mode.
- `bun run build` - Builds the app for production to the `.next` folder.
- `bun run start` - Starts the production server.
- `bun run lint` - Lints the codebase using ESLint.
- `bun run ingest:rag` - Runs the script to ingest destination data into the Pinecone vector database.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing a bug, adding a new feature, or improving documentation, your help is appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code adheres to standard linting rules (`bun run lint`) and passes standard TypeScript checks. 

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact & Support

**TravelMind Team**  
For support, email us at support@travelmind.example.com or open an issue on GitHub.

*Plan smarter. Travel better. 🌍*
