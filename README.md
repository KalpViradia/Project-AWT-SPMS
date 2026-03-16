# 📊 Studionex: Student Project Management System

A comprehensive web-based platform for managing academic projects, designed to streamline collaboration between students, faculty, and administrators. Studionex provides a modern, real-time environment for project tracking, communication, and evaluation.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-green?logo=prisma)
![Socket.IO](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Upload-blue?logo=cloudinary)

## ✨ Key Features

### 💬 Real-Time Collaboration
- **Instant Messaging** – Group discussions with real-time message delivery.
- **Announcement Channels** – Faculty can broadcast important updates to project groups.
- **Typing Indicators** – See when team members are active in the discussion.
- **Notifications** – Desktop alerts and in-app notifications for all major activities.

### 📋 Project & Task Management
- **Kanban Boards** – Track progress with a visual task management system.
- **Milestones** – Define and monitor key project phases and deadlines.
- **Weekly Reports** – Structured progress reporting with faculty feedback loop.
- **Proposal Approval** – Streamlined workflow for project initialization.

### 📁 Advanced File Handling
- **Cloudinary Integration** – Secure and reliable image and profile picture storage.
- **Document Management** – Upload and organize project reports, PDFs, and assets.
- **Centralized Repository** – Easy access to all project-related documents.

### 👨‍🎓 Role-Based Portals
- **Student Portal** – Group management, task tracking, and report submission.
- **Faculty Portal** – Supervision, proposal review, meeting scheduling, and grading.
- **Admin Portal** – User administration, master configuration, and system-wide analytics.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Real-time** | Socket.IO |
| **Storage** | Cloudinary (Images), Local/S3 (Documents) |
| **UI Components** | Radix UI, shadcn/ui, Lucide Icons |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | NextAuth.js v5 (Auth.js) |
| **Forms** | React Hook Form, Zod validation |
| **Animations** | Framer Motion |
| **Export** | jsPDF, xlsx |

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
├── backend/                # Socket.IO real-time server
├── project-tracker/        # Main Next.js application
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Server actions and utilities
│   ├── prisma/             # Schema and migrations
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