"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const openPositions = [
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build and scale our core scheduling infrastructure using Node.js, PostgreSQL, and Redis.",
  },
  {
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Create beautiful, responsive user interfaces with React, Next.js, and TypeScript.",
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description: "Manage our cloud infrastructure, CI/CD pipelines, and ensure 99.99% uptime.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive experiences that developers love to use every day.",
  },
];

const benefits = [
  "Competitive salary & equity",
  "100% remote work",
  "Unlimited PTO",
  "Health, dental & vision",
  "Learning budget",
  "Home office stipend",
];

export default function CareersPage() {
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
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Join Our Team
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Help us build the future of job scheduling. We're looking for talented 
                individuals who are passionate about developer tools.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 p-8 rounded-2xl bg-primary/5 border border-primary/20"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Why Work With Us?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {benefit}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Open Positions */}
            <h2 className="text-2xl font-bold text-foreground mb-8">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {position.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">{position.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{position.department}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {position.location}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {position.type}
                            </Badge>
                          </div>
                        </div>
                        <Button className="shrink-0">
                          Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center text-muted-foreground"
            >
              Don't see a role that fits?{" "}
              <a href="mailto:careers@cronops.dev" className="text-primary hover:underline">
                Send us your resume
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
