"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { History, Sparkles, Bug, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const changelog = [
  {
    version: "2.1.0",
    date: "December 20, 2024",
    type: "feature",
    changes: [
      "Added analytics dashboard with execution trends",
      "Introduced subscription plans (Free, Premium, Pro)",
      "Admin dashboard for system-wide management",
      "Password reset functionality via email",
    ],
  },
  {
    version: "2.0.0",
    date: "December 15, 2024",
    type: "major",
    changes: [
      "Complete UI redesign with dark mode support",
      "Real-time job execution monitoring",
      "Improved cron expression validation",
      "New job detail page with execution history",
    ],
  },
  {
    version: "1.5.0",
    date: "November 30, 2024",
    type: "feature",
    changes: [
      "Email notifications for job failures",
      "Webhook support for job events",
      "Improved logging with response body capture",
      "Bulk job actions (pause/resume)",
    ],
  },
  {
    version: "1.4.2",
    date: "November 15, 2024",
    type: "bugfix",
    changes: [
      "Fixed timezone handling for DST transitions",
      "Resolved memory leak in worker process",
      "Improved error messages for invalid cron expressions",
    ],
  },
  {
    version: "1.4.0",
    date: "October 28, 2024",
    type: "feature",
    changes: [
      "Added retry configuration per job",
      "Custom timeout settings",
      "Job tagging and filtering",
      "Export execution logs to CSV",
    ],
  },
  {
    version: "1.3.0",
    date: "October 10, 2024",
    type: "feature",
    changes: [
      "Script job support (run shell commands)",
      "Job cloning functionality",
      "Improved dashboard statistics",
    ],
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "major":
      return <Sparkles className="h-4 w-4" />;
    case "feature":
      return <Zap className="h-4 w-4" />;
    case "bugfix":
      return <Bug className="h-4 w-4" />;
    default:
      return <History className="h-4 w-4" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "major":
      return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Major Release</Badge>;
    case "feature":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">New Features</Badge>;
    case "bugfix":
      return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Bug Fixes</Badge>;
    default:
      return <Badge variant="secondary">Update</Badge>;
  }
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <History className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Changelog
              </h1>
              <p className="text-xl text-muted-foreground">
                See what's new in CronOps
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />

              {changelog.map((release, index) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative mb-12 ${
                    index % 2 === 0 ? "md:pr-1/2 md:text-right" : "md:pl-1/2 md:ml-auto"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                  <div className={`ml-8 md:ml-0 ${index % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                    <div className={`p-6 rounded-2xl bg-card border border-border ${index % 2 === 0 ? "md:text-left" : ""}`}>
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-2xl font-bold text-foreground">v{release.version}</span>
                        {getTypeBadge(release.type)}
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                      </div>
                      <ul className="space-y-2">
                        {release.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
