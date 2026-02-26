"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Users,
  FileText,
  CalendarDays,
  BookCheck,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/* ─────────── animation helpers ─────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

/* ─────────── data ─────────── */
const features = [
  {
    icon: Users,
    title: "Project Groups",
    desc: "Create or join project groups, invite team members, and collaborate with your peers seamlessly.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: FileText,
    title: "Weekly Reports",
    desc: "Submit weekly progress reports, get feedback from faculty guides, and track your marks over time.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: CalendarDays,
    title: "Meeting Scheduling",
    desc: "Schedule project meetings with your guide, track attendance, and keep detailed meeting notes.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: BookCheck,
    title: "Faculty Reviews",
    desc: "Faculty can review proposals, provide feedback on reports, and grade project milestones.",
    color: "from-amber-500 to-orange-500",
  },
];

const steps = [
  {
    num: "01",
    title: "Create an Account",
    desc: "Sign up as a student to get started with the platform.",
  },
  {
    num: "02",
    title: "Form or Join a Group",
    desc: "Create a new project group or accept an invitation from your peers.",
  },
  {
    num: "03",
    title: "Track Your Progress",
    desc: "Submit weekly reports, attend meetings, and upload documents.",
  },
  {
    num: "04",
    title: "Get Evaluated",
    desc: "Faculty reviews your work and provides marks and feedback.",
  },
];

/* ─────────── main component ─────────── */
export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══════ NAV BAR ═══════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SPMS</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              className="rounded-full"
            >
              {themeIcon()}
            </Button>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full px-5 shadow-lg shadow-primary/20">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* decorative blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Student Project Management System
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Manage Your
            <br />
            <span className="text-gradient">Academic Projects</span>
            <br />
            Effortlessly
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            A unified platform for students and faculty to organize project
            groups, submit weekly reports, schedule meetings, and track
            progress — all in one place.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Link href="/signup">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base"
            >
              <Link href="/login">Login to Dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FEATURES SECTION ═══════ */}
      <section className="py-20 md:py-28 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools designed for academic project management, built for
              students and faculty.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="group relative rounded-2xl border border-border bg-card p-6 hover-lift cursor-default"
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Get started in four simple steps and take control of your project
              journey.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="relative"
              >
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-border" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary font-bold text-xl mb-4 border border-primary/20">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ROLES SECTION ═══════ */}
      <section className="py-20 md:py-28 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Built for Every Role
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Tailored dashboards and tools for students, faculty, and
              administrators.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: "Students",
                icon: Users,
                items: [
                  "Create or join project groups",
                  "Submit weekly reports",
                  "View meeting schedules",
                  "Upload project documents",
                ],
                gradient: "from-indigo-500 to-blue-600",
              },
              {
                role: "Faculty",
                icon: BookCheck,
                items: [
                  "Guide multiple project groups",
                  "Review & grade reports",
                  "Schedule meetings",
                  "Approve project proposals",
                ],
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                role: "Administrators",
                icon: GraduationCap,
                items: [
                  "Manage users & roles",
                  "Configure departments & years",
                  "Assign faculty guides",
                  "Generate system reports",
                ],
                gradient: "from-amber-500 to-orange-600",
              },
            ].map((r, i) => (
              <motion.div
                key={r.role}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="rounded-2xl border border-border bg-card p-7 hover-lift"
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <r.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{r.role}</h3>
                <ul className="space-y-3">
                  {r.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA BANNER ═══════ */}
      <section className="py-20 md:py-28 px-6">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={0}
          className="max-w-4xl mx-auto text-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-12 md:p-16 shadow-2xl shadow-indigo-500/20 relative overflow-hidden"
        >
          {/* decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto relative z-10">
            Join your peers and start managing your academic projects more
            effectively today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full px-8 text-base font-semibold shadow-xl"
            >
              <Link href="/signup">
                Create Free Account <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full px-8 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Login Instead</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">SPMS</span>
            <span className="text-muted-foreground text-sm ml-2">
              Student Project Management System
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
