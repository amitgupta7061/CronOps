"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Code, Terminal, Globe, Clock, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const docSections = [
  {
    icon: Clock,
    title: "Getting Started",
    description: "Learn the basics of CronOps and create your first scheduled job.",
    links: [
      { title: "Quick Start Guide", href: "#" },
      { title: "Creating Your First Job", href: "#" },
      { title: "Understanding Cron Expressions", href: "#" },
    ],
  },
  {
    icon: Globe,
    title: "HTTP Jobs",
    description: "Configure HTTP endpoint jobs with custom headers and payloads.",
    links: [
      { title: "HTTP Methods", href: "#" },
      { title: "Custom Headers", href: "#" },
      { title: "Request Body", href: "#" },
    ],
  },
  {
    icon: Terminal,
    title: "Script Jobs",
    description: "Run scripts and commands on a schedule.",
    links: [
      { title: "Script Configuration", href: "#" },
      { title: "Environment Variables", href: "#" },
      { title: "Output Handling", href: "#" },
    ],
  },
  {
    icon: Settings,
    title: "Advanced Configuration",
    description: "Customize retries, timeouts, and notifications.",
    links: [
      { title: "Retry Policies", href: "#" },
      { title: "Timeout Settings", href: "#" },
      { title: "Timezone Configuration", href: "#" },
    ],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Complete API documentation for programmatic access.",
    links: [
      { title: "Authentication", href: "#" },
      { title: "Jobs API", href: "#" },
      { title: "Logs API", href: "#" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Documentation
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about using CronOps effectively.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.links.map((link) => (
                          <li key={link.title}>
                            <Link
                              href={link.href}
                              className="text-sm text-primary hover:underline"
                            >
                              {link.title} →
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 p-8 rounded-2xl bg-card border border-border text-center"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Contact Support →
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
