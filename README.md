# 📊 Studionex: Student Project Management System

A comprehensive web-based platform for managing academic projects, designed to streamline collaboration between students, faculty, and administrators. Studionex provides a modern, real-time environment for project tracking, communication, and evaluation with **3 role-based portals**, **17 database models**, and **12 major feature modules**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-green?logo=prisma)
![Socket.IO](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Upload-blue?logo=cloudinary)

## 📊 Project Metrics

| Metric | Value |
|---|---|
| User Roles | 3 (Student, Faculty, Admin) |
| Database Models | 17 |
| Server Actions | 58 |
| Real-Time Socket Events | 7 |
| Notification Workflows | 16 |
| Feature Modules | 12 |
| Upload Workflows | 4 |
| Export Formats | 2 (PDF, Excel) |

## ✨ Key Features

### 💬 Real-Time Collaboration
- **Instant Messaging** – Dual-channel group discussions (discussion + announcements) with real-time message delivery, replies, and emoji reactions.
- **Announcement Channels** – Faculty can broadcast important updates to project groups via a dedicated channel.
- **Typing Indicators** – See when team members are active in the discussion with debounced live updates.
- **Notifications** – Real-time bell notifications powered by **16 automated trigger workflows** across all platform activities, with keyboard shortcut support (Alt+N).

### 📋 Project & Task Management
- **Kanban Boards** – 4-column task board (To Do → In Progress → Review → Done) with priority levels and assignee tracking.
- **Gantt Chart Timeline** – Interactive milestone visualization with progress bars, today marker, and color-coded phases.
- **Weekly Reports** – Structured progress reporting with per-week grading (0–100) and faculty feedback loop.
- **Proposal Approval** – Multi-criteria rubric review system (clarity, methodology, feasibility, innovation) with faculty scoring.

### 📁 Advanced File Handling
- **Cloudinary Integration** – 4 upload workflows (proposals, avatars, documents, chat) supporting 13 file types with server-side size validation.
- **Document Management** – Upload and organize project reports, PDFs, and assets with faculty review workflow (submitted → approved/revision needed).
- **Chat Attachments** – Share images and files directly in discussions with inline preview and download.
- **PDF & Excel Export** – Generate styled reports in PDF (jsPDF) and Excel (xlsx) formats with auto-sized columns.

### 👨‍🎓 Role-Based Portals — 3 user roles across 33 pages
- **Student Portal** (9 pages) – Group management, task tracking, milestone timeline, report submission, document uploads, and project discussions.
- **Faculty Portal** (7 pages) – Proposal review with rubric scoring, report grading, meeting scheduling with attendance tracking, and student skill search.
- **Admin Portal** (7 pages) – User CRUD, department/project type management, system-wide analytics with custom SVG/CSS charts, and password reset generation.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Real-time** | Socket.IO |
| **Storage** | Cloudinary CDN (4 upload workflows) |
| **UI Components** | Radix UI (12 primitives), shadcn/ui, Lucide Icons |
| **Database** | PostgreSQL (Neon) with Prisma 7 ORM (17 models) |
| **Authentication** | NextAuth.js v5 (Auth.js) — JWT + Edge Middleware RBAC |
| **Forms** | React Hook Form, Zod validation (25 schemas) |
| **Animations** | Framer Motion |
| **Export** | jsPDF, xlsx |

## 🏗️ System Architecture

```
┌─────────────────────┐       HTTP /emit       ┌──────────────────────────┐
│   Next.js Frontend   │ ────────────────────▶  │  Socket.IO Server (Node) │
│   (Vercel — SSR)     │  secret-authenticated  │  (Render — standalone)   │
└──────────┬──────────┘                         └──────────────────────────┘
           │                                              │
     Server Actions (58)                         WebSocket ↕ connections
           │                                              │
     ┌─────▼────────┐                            ┌────────┴────────┐
     │  PostgreSQL   │                            │  Browser Clients │
     │  (Neon)       │                            └─────────────────┘
     └──────────────┘
           │
     ┌─────▼────────┐
     │  Cloudinary   │
     │  CDN Storage  │
     └──────────────┘
```

| Service | Platform | Purpose |
|---|---|---|
| Frontend + Server Actions | **Vercel** | Next.js 16 SSR, 58 server actions, edge middleware auth |
| Database | **Neon PostgreSQL** | 17 relational models, serverless Postgres with SSL |
| WebSocket Server | **Render** | Socket.IO microservice, 7 event types, 2 room types |
| File Storage | **Cloudinary** | CDN-backed uploads for documents, avatars, chat attachments |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary Account (for file uploads)
- Socket.IO server (running in `/backend`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KalpViradia/Project-AWT-SPMS.git
   cd SPMS
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd project-tracker
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in `project-tracker/`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/spms"
   AUTH_SECRET="your-auth-secret"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
   ```

4. **Set up the database**
   ```bash
   cd project-tracker
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. **Start the application**
   ```bash
   # Start the backend (from /backend)
   npm start

   # Start the frontend (from /project-tracker)
   npm run dev
   ```

## 📁 Project Structure

```
SPMS/
├── backend/                # Socket.IO real-time server (standalone microservice)
├── project-tracker/        # Main Next.js application (164 source files)
│   ├── app/                # Next.js App Router — 33 pages + 2 API routes
│   │   ├── dashboard/
│   │   │   ├── student/    # 9 student pages
│   │   │   ├── faculty/    # 7 faculty pages
│   │   │   └── admin/      # 7 admin pages
│   │   └── api/            # chat-upload + NextAuth routes
│   ├── components/         # 75 reusable UI components
│   │   ├── ui/             # 27 base components (shadcn/ui + custom)
│   │   ├── shared/         # 11 shared components (chat, kanban, gantt)
│   │   ├── admin/          # 5 admin-specific components
│   │   ├── faculty/        # 9 faculty-specific components
│   │   └── student/        # 9 student-specific components
│   ├── lib/                # 58 server actions across 9 action files
│   ├── prisma/             # Schema (17 models) + seed scripts
│   └── public/             # Static assets
└── Docs/                   # Project documentation and resources
```

## 📝 Available Scripts (Frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 📄 License

This project is developed for academic purposes as part of the Advanced Web Technology course.

---