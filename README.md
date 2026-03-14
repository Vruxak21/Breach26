# Breach26 – Full Stack AI Application Template

A modern **production-ready full-stack template** built with **Next.js 15+, Bun, Prisma, Better Auth, and shadcn/ui**, designed for building scalable AI-powered web applications.

This template is optimized for **hackathons, rapid prototyping, and production systems**, and supports **AI features such as Retrieval-Augmented Generation (RAG), recommendation systems, and vector search pipelines**.

---

# Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Database Setup](#database-setup)
* [Authentication System](#authentication-system)
* [RAG (Retrieval Augmented Generation) Pipeline](#rag-retrieval-augmented-generation-pipeline)
* [Future AI Modules](#future-ai-modules)
* [Research & References](#research--references)
* [Development Workflow](#development-workflow)
* [Contribution Guide](#contribution-guide)
* [License](#license)

---

# Overview

**Breach26** is a full-stack web application template built to accelerate development of **AI-powered applications**.

The architecture integrates:

* **Next.js App Router**
* **Secure authentication**
* **PostgreSQL database with Prisma**
* **Modern UI system**
* **Vector embeddings and RAG pipelines**

The goal of this template is to provide a **scalable base architecture** for applications involving:

* AI assistants
* intelligent search
* recommendation systems
* semantic retrieval
* data-driven personalization

---

# Features

### Core Web Stack

* **Next.js 15 (App Router)** – Modern React framework with server components.
* **Bun Runtime** – Faster dependency installation and runtime performance.
* **Prisma ORM** – Type-safe database access with migrations.
* **PostgreSQL** – Reliable relational database.
* **TailwindCSS** – Utility-first CSS framework.
* **shadcn/ui** – Beautiful and accessible UI components.

### Authentication

* **Better Auth** – Lightweight authentication framework.
* Google OAuth login support.
* Secure session handling.
* Extensible provider architecture.

### AI Infrastructure

* Retrieval-Augmented Generation (RAG)
* Embedding pipelines
* Vector search support
* AI powered recommendations

---

# Technology Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | Next.js 15                          |
| Backend        | Next.js API Routes                  |
| Runtime        | Bun                                 |
| Database       | PostgreSQL                          |
| ORM            | Prisma                              |
| Authentication | Better Auth                         |
| UI             | shadcn/ui + TailwindCSS             |
| AI             | LangChain / HuggingFace / Vector DB |

---

# Project Structure

```
breach26/
│
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   ├── signin/              # Login page
│   ├── signup/              # Signup page
│
├── components/              # Reusable UI components
│
├── lib/
│   ├── auth.ts              # Server authentication config
│   ├── auth-client.ts       # Client authentication utilities
│   ├── db.ts                # Prisma database client
│   └── rag/                 # RAG pipeline modules
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
└── README.md
```

---

# Getting Started

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd breach26
```

---

## 2. Install Dependencies

This project uses **Bun** as the runtime and package manager.

```bash
bun install
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Better Auth
BETTER_AUTH_SECRET="your_long_random_secret"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Provider
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# AI Services
HUGGINGFACE_API_KEY="your_huggingface_key"
OPENAI_API_KEY="your_openai_key"
```

Generate a secure auth secret:

```bash
openssl rand -base64 32
```

---

# Database Setup

Generate Prisma Client and run migrations.

```bash
bunx prisma generate
bunx prisma migrate dev --name init
```

You can inspect the database using:

```bash
bunx prisma studio
```

---

# Authentication System

Authentication is implemented using **Better Auth** with OAuth providers.

### Server Configuration

```
lib/auth.ts
```

### Client Authentication Utilities

```
lib/auth-client.ts
```

### API Handler

```
app/api/auth/[...better-auth]/route.ts
```

### Authentication Pages

```
app/signin/page.tsx
app/signup/page.tsx
```

Supported authentication features:

* Google OAuth
* Session based authentication
* Extensible provider support

---

# RAG (Retrieval Augmented Generation) Pipeline

The project supports **Retrieval-Augmented Generation (RAG)** to enable AI assistants to respond using external knowledge sources.

## RAG Architecture

```
User Query
     │
     ▼
Embedding Model
     │
     ▼
Vector Database
     │
     ▼
Relevant Documents Retrieved
     │
     ▼
LLM Generation
     │
     ▼
Final AI Response
```

## Pipeline Components

### 1. Embedding Generation

Text queries and documents are converted into embeddings using models such as:

* HuggingFace Instructor Models
* OpenAI Embeddings

Example:

```ts
const embeddings = new HuggingFaceInferenceEmbeddings({
  model: "hkunlp/instructor-base",
  apiKey: process.env.HUGGINGFACE_API_KEY
})
```

---

### 2. Vector Storage

Embeddings are stored in a vector database such as:

* Pinecone
* Redis Vector Store
* Weaviate
* PostgreSQL + pgvector

---

### 3. Retrieval

Relevant documents are retrieved using **semantic similarity search**.

```
Top-k Similar Documents
```

---

### 4. LLM Generation

The retrieved context is sent to the LLM to generate grounded responses.

```
Prompt = Query + Retrieved Context
```

---

# Future AI Modules

Planned AI capabilities:

* Personalized recommendation engine
* Travel itinerary generation
* Semantic search
* AI chatbot assistant
* User behavior analytics
* Hybrid recommendation systems

---

# Research & References

This document summarizes five research papers related to **hybrid recommendation systems**, which form the conceptual foundation for the recommendation and retrieval components of our AI-powered travel planning system.

The review focuses on:
- Key contributions
- Challenges addressed
- Mathematical techniques used
- Rationale for adoption in our system

---

## 1. Development of a Hybrid Recommendation System Using Collaborative Filtering and Content-Based Filtering

Paper Link  
https://ieeexplore.ieee.org/document/1708607

### Key Aspects
- Combines **Collaborative Filtering (CF)** and **Content-Based Filtering (CBF)**.
- Uses a **weighted hybrid recommendation model**.
- Improves recommendation accuracy by leveraging both user interactions and item features.

**Hybrid Formula**

$\hat{R}_{ui} = \alpha R_{ui}^{CF} + (1-\alpha) R_{ui}^{CB}$

Where:

- $R_{ui}^{CF}$ = collaborative filtering prediction  
- $R_{ui}^{CB}$ = content-based prediction  
- $\alpha$ = weighting factor controlling contribution

### Challenges Addressed
- Cold start problem
- Data sparsity
- Low recommendation accuracy

### Mathematical Components
- Cosine similarity
- Pearson correlation
- Weighted score aggregation

### Rationale
This paper validates the **core hybrid recommendation strategy** used in our system to combine user behavior and travel metadata.

---

## 2. Hybrid Recommender Systems: A Systematic Literature Review

Paper Link  
https://arxiv.org/abs/1901.03888

### Key Aspects
- Comprehensive survey of **hybrid recommendation architectures**.
- Analysis of **76 recommender system studies**.
- Identifies best-performing hybrid strategies.

Hybrid system categories identified:

1. Weighted hybrid
2. Switching hybrid
3. Cascade hybrid
4. Feature combination
5. Feature augmentation
6. Meta-level hybrid
7. Mixed hybrid

### Challenges Addressed
- Data sparsity
- Cold-start problems
- Scalability of recommendation engines

### Mathematical Components
Common ML techniques used in surveyed systems:

- KNN similarity
- Matrix factorization
- Clustering
- Association rule mining

Example similarity metric:
$\displaystyle
sim(i,j)=\frac{\sum r_{ui}r_{uj}}{\sqrt{\sum r_{ui}^2}\sqrt{\sum r_{uj}^2}}
$

### Rationale
This paper provides the **taxonomy and justification for selecting hybrid architectures** for large-scale recommendation systems like our travel platform.

---

## 3. Hybrid Recommender Systems: Survey and Experiments

Paper Link  
https://link.springer.com/article/10.1023/A:1021240730564

Author: **Robin Burke**

### Key Aspects
Introduces a taxonomy of hybrid recommenders and demonstrates the **EntreeC system**.

Six hybrid architectures:

- Weighted
- Switching
- Mixed
- Cascade
- Feature combination
- Meta-level

Example architecture (Cascade):

```
Knowledge-based filtering
↓
Collaborative filtering
↓
Final recommendation
```

### Challenges Addressed
- Ramp-up problem
- Limited user data
- Recommendation accuracy

### Mathematical Components

**Cosine similarity**

$\displaystyle
sim(i,j)=\frac{i \cdot j}{||i||\,||j||}
$

**Prediction formula**

$\displaystyle
\hat{r}_{ui}=\frac{\sum sim(i,j)\,r_{uj}}{\sum |sim(i,j)|}
$

### Rationale
Provides a **framework for designing modular hybrid recommendation architectures**, which informs the system design of our AI travel recommender.

---

## 4. Hybrid Recommendation System Combining Collaborative Filtering and Content-Based Recommendation with Keyword Extraction

Paper Link  
https://arxiv.org/abs/2005.08148

### Key Aspects
- Hybrid recommendation combining:
  - Item-based collaborative filtering
  - Content-based filtering
  - Keyword extraction

Keywords extracted using:

- TF-IDF
- RAKE algorithm

Item representation:
$\displaystyle
w_i = tf_i \cdot \log\left(\frac{N}{df_i}\right)
$
### Challenges Addressed
- Sparse user ratings
- Lack of structured item features
- Low recommendation diversity

### Mathematical Components

**Cosine similarity**

$\displaystyle
sim(D,P)=\frac{D \cdot P}{||D||\,||P||}
$

**Collaborative filtering prediction**

$\displaystyle
P_{u,i}=\frac{\sum sim(i,N)R_{u,N}}{\sum |sim(i,N)|}
$

### Rationale
Important for systems like ours where **travel reviews, descriptions, and tags must be converted into structured recommendation features**.

---

## 5. A Hybrid Approach to Enhance Pure Collaborative Filtering Based on Content Feature Relationship

Paper Link  
https://arxiv.org/abs/2005.08148

### Key Aspects
Introduces **RELFsim**, a feature relationship similarity model using **Word2Vec embeddings**.

Approach:

1. Extract content features
2. Train Word2Vec embeddings
3. Compute feature similarity
4. Integrate into collaborative filtering

**Feature embedding representation**

$\displaystyle
v_{item}=\frac{1}{n}\sum_{i=1}^{n} v_{feature_i}
$

### Challenges Addressed
- Cold-start problem
- Limited rating data
- Item similarity detection

### Mathematical Components

**Word2Vec Skip-gram**

$\displaystyle
P(w_o|w_i)=
\frac{\exp(v_{w_o} \cdot v_{w_i})}
{\sum_{w \in V}\exp(v_w \cdot v_{w_i})}
$

**Similarity**

$\displaystyle
sim(i,j)=\cos(v_i,v_j)
$
### Rationale
This paper supports using **embedding-based semantic similarity**, which directly aligns with our **vector database + RAG architecture**.

---

## Key Takeaways Across All Papers

Common insights across the literature:

1. Hybrid systems outperform single-method recommenders.
2. Cold-start and data sparsity are major challenges.
3. Embedding-based approaches improve semantic similarity.
4. Combining user behavior and content features leads to higher accuracy.

---

## Relevance to Our System

Our AI travel planner integrates concepts from these papers:

Hybrid Recommendation Layer

```
User Preferences
+
Destination Metadata
+
Review Embeddings
↓
Hybrid Recommendation Engine
```

RAG Retrieval Layer

```
Travel Documents
↓
Embedding Model
↓
Vector Database (Pinecone)
↓
Similarity Search
↓
LLM Recommendation
```

---

## Conclusion

The reviewed literature strongly supports the use of **hybrid recommendation architectures combined with embedding-based retrieval techniques**.

This foundation enables the development of scalable AI systems capable of delivering **accurate, context-aware travel recommendations**.

---

# Development Workflow

Typical development cycle:

1. Implement feature
2. Create API route
3. Connect database models
4. Build UI components
5. Add AI modules if required
6. Commit and push changes

Example:

```bash
git add .
git commit -m "feat: add RAG retrieval pipeline"
git push origin main
```

---

# Contribution Guide

1. Fork the repository
2. Create a feature branch

```
git checkout -b feature/my-feature
```

3. Commit your changes

```
git commit -m "feat: implement recommendation engine"
```

4. Push and open a pull request.

---

# License

This project is open-source and available under the **MIT License**.

---

If you find this project useful, consider giving it a star!
