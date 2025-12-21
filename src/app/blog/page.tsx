"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const blogPosts = [
  {
    title: "Getting Started with Cron Expressions",
    excerpt: "Learn the basics of cron syntax and how to schedule your first job with CronOps.",
    date: "Dec 15, 2024",
    category: "Tutorial",
    readTime: "5 min read",
  },
  {
    title: "Best Practices for Reliable Job Execution",
    excerpt: "Discover strategies for ensuring your scheduled tasks run successfully every time.",
    date: "Dec 10, 2024",
    category: "Best Practices",
    readTime: "8 min read",
  },
  {
    title: "Introducing Webhook Integrations",
    excerpt: "Connect CronOps with your favorite tools using our new webhook integration feature.",
    date: "Dec 5, 2024",
    category: "Product Update",
    readTime: "4 min read",
  },
  {
    title: "Scaling Your Background Jobs",
    excerpt: "Tips and techniques for managing hundreds of cron jobs efficiently.",
    date: "Nov 28, 2024",
    category: "Engineering",
    readTime: "10 min read",
  },
  {
    title: "CronOps vs Traditional Crontab",
    excerpt: "Why modern teams are switching from server-based cron to managed scheduling platforms.",
    date: "Nov 20, 2024",
    category: "Comparison",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
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
              <Newspaper className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Blog
              </h1>
              <p className="text-xl text-muted-foreground">
                Insights, tutorials, and updates from the CronOps team
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground flex-1 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {post.date}
                        </div>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
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
