# Shadow Support System 🌙

Shadow Support System is an AI-powered, real-time crisis intervention platform designed to proactively protect youth mental health. By providing an anonymous "Safe Chat" interface backed by AI triage, the system acts as an early-warning network that seamlessly escalates high-risk cases to human NGO volunteers in real-time.

---

## ✨ Key Features

- **🛡️ Safe Chat (AI Triage):** An anonymous, compassionate chat interface powered by Google Gemini that analyzes conversational sentiment and determines the user's risk level (low, medium, high).
- **⚡ Real-Time Human Interventions:** Built-in Socket.io integration alerts human volunteers instantly when an at-risk youth requires immediate assistance. Volunteers can take over the chat seamlessly.
- **📊 Admin & Volunteer Observatories:** Comprehensive dashboards displaying longitudinal insights, demographic breakdowns, active case backlogs, and real-time alerts.
- **🧘‍♀️ Guided Micro-Exercises:** Interactive mental health coping tools integrated directly into the platform based on real-time chat analysis (e.g., Box Breathing, 5-4-3-2-1 Grounding, Cognitive Reframing).
- **🔒 High Privacy & Data Security:** Complete migration to serverless **Neon PostgreSQL** via **Prisma ORM**, ensuring all sensitive intake and diagnostic information is strictly secured without relying on legacy platforms.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Custom "Haven Sanctuary" Design System
- **Icons & Data-Vis:** Lucide React, Recharts

### Backend API
- **Framework:** Express / Node.js (via `tsx`)
- **Real-Time Engine:** Socket.io
- **Authentication:** Custom encrypted JWT strategy via BcryptJS

### Database & AI
- **Database:** Neon Serverless PostgreSQL
- **ORM:** Prisma Client
- **AI Analytics:** `@google/generative-ai` (Gemini API) and Groq integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Neon PostgreSQL](https://neon.tech/) database instance
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rachith27/shadow-support-system.git
   cd shadow-support-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(Note: The custom `postinstall` script will automatically generate the Prisma Client).*

3. **Set up Environment Variables:**
   Create a `.env` and `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@your-neon-host/neondb?sslmode=require"
   JWT_SECRET="your-secure-jwt-secret"
   GEMINI_API_KEY="your-gemini-key"
   GROK_AI_API="your-groq-key"
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Initialize the Database:**
   Push the Prisma schema to your target database.
   ```bash
   npm run db:push
   ```

5. **Start the Development Environments:**
   Run both the Express backend and the Next.js frontend concurrently:
   ```bash
   npm run dev:all
   ```

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

---

## 🌐 Deployment Notes

- **Frontend (Vercel):** Connect the repository to Vercel and set `NEXT_PUBLIC_API_URL` if routing logic requires it. Next.js will automatically handle static page generation.
- **Backend (Render):** Deploy the project as a Web Service. Ensure the start command is set to `npm run server:prod` and that all Environment Variables (especially `DATABASE_URL`) are configured.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!  
Feel free to check our issues page to see where help is needed.

## 📄 License
This project is open-source and available under the MIT License.
