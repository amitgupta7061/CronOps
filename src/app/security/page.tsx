"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, Server, Key, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
  },
  {
    icon: Key,
    title: "Secure Authentication",
    description: "JWT-based authentication with refresh tokens and secure password hashing using bcrypt.",
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    description: "Our infrastructure is hosted on secure, SOC 2 compliant cloud providers with regular audits.",
  },
  {
    icon: Eye,
    title: "Access Controls",
    description: "Role-based access control ensures users only see what they're authorized to access.",
  },
  {
    icon: FileCheck,
    title: "Regular Audits",
    description: "We conduct regular security audits and penetration testing to identify vulnerabilities.",
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Enterprise-grade DDoS protection ensures your services remain available.",
  },
];

export default function SecurityPage() {
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
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Security at CronOps
              </h1>
              <p className="text-xl text-muted-foreground">
                Your security is our top priority. Learn how we protect your data.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Report a Vulnerability
              </h2>
              <p className="text-muted-foreground mb-4">
                If you discover a security vulnerability, please report it responsibly to{" "}
                <a href="mailto:security@cronops.dev" className="text-primary hover:underline">
                  security@cronops.dev
                </a>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
