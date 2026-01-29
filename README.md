# 📊 Student Project Management System (SPMS)

A comprehensive web-based platform for managing academic projects, designed to streamline collaboration between students, faculty, and administrators.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-green?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)

## ✨ Features

### 👨‍🎓 Student Portal
- **Project Group Management** – Create/join project groups with team invitations
- **Proposal Submission** – Submit project proposals for faculty approval
- **Weekly Reports** – Track progress with weekly report submissions
- **Document Uploads** – Upload and manage project-related documents
- **Meeting Schedule** – View scheduled meetings with guides
- **Profile Management** – Update personal information and settings

### 👨‍🏫 Faculty Portal
- **Group Supervision** – Manage assigned project groups
- **Proposal Review** – Review and approve/reject project proposals
- **Meeting Management** – Schedule meetings and track attendance
- **Grading System** – Assign marks for weekly reports and final evaluation
- **Progress Tracking** – Monitor student progress and report submissions
- **Export Data** – Export group data to Excel/PDF formats

### 🔧 Admin Portal
- **User Management** – Create and manage students, faculty, and admin accounts
- **Master Configuration** – Manage Project Types, Academic Years, and Departments
- **Reports & Analytics** – View comprehensive reports across all projects
- **Data Export** – Export project data to Excel and PDF formats

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, shadcn/ui, Lucide Icons |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | NextAuth.js v5 (Auth.js) |
| **Forms** | React Hook Form, Zod validation |
| **Animations** | Framer Motion |
| **Export** | jsPDF, xlsx |

## 📁 Project Structure

```
project-tracker/
├── app/                    # Next.js App Router pages
│   ├── dashboard/
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── faculty/        # Faculty dashboard pages
│   │   └── student/        # Student dashboard pages
│   └── api/                # API routes
├── components/             # Reusable UI components
│   ├── admin/              # Admin-specific components
│   ├── faculty/            # Faculty-specific components
│   ├── shared/             # Shared components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility functions and server actions
│   ├── actions.ts          # Server actions
│   ├── admin-actions.ts    # Admin-specific actions
│   └── prisma.ts           # Prisma client
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KalpViradia/Project-AWT-SPMS.git
   cd project-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/spms"
   AUTH_SECRET="your-auth-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🗄️ Database Schema

The system uses the following main entities:

- **Users** – Students, Staff (Faculty), and Admins
- **Project Groups** – Team-based projects with members
- **Project Types** – Categories of projects (e.g., Mini Project, Major Project)
- **Weekly Reports** – Progress reports submitted by students
- **Project Meetings** – Scheduled meetings with attendance tracking
- **Project Documents** – Uploaded files and documents
- **Departments & Academic Years** – Organizational structure

## 🔐 Authentication

The system uses role-based access control with three user roles:

| Role | Access Level |
|------|--------------|
| **Student** | Personal dashboard, group management, report submission |
| **Faculty** | Group supervision, proposal review, grading |
| **Admin** | Full system access, user management, configuration |

## 📄 License

This project is developed for academic purposes as part of the Advanced Web Technology course.

---