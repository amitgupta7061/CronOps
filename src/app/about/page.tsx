"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { Target, Heart, Award, Github, Linkedin, Globe } from "lucide-react";
import Image from "next/image";

const values = [
  {
    icon: Target,
    title: "Reliability First",
    description: "We build systems that work 24/7, because your jobs never sleep.",
  },
  {
    icon: Heart,
    title: "Developer Love",
    description: "Everything we build is designed with developers in mind.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every line of code we write.",
  },
];

const socialLinks = [
  { name: "GitHub", href: "https://github.com/amitgupta7061", icon: Github },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/amit-kumar-gupta-96649729a/", icon: Linkedin },
  { name: "Portfolio", href: "https://www.ammit.me/", icon: Globe },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                About CronOps
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We're on a mission to make scheduled task management simple, reliable, 
                and accessible to developers everywhere. CronOps helps teams automate 
                their workflows with enterprise-grade reliability.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-card/30">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-card border border-border text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Meet the Developer
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-primary shadow-xl">
                <Image
                  src="https://res.cloudinary.com/dprrkkrhs/image/upload/v1764159070/photo_qs2lid.jpg"
                  alt="Amit Gupta"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Amit Gupta</h3>
              <p className="text-primary font-medium mb-4">Full Stack Developer</p>
              <p className="text-muted-foreground text-center max-w-lg mb-6">
                Passionate about building developer tools and automating workflows. 
                Creating CronOps to make cron job management simple and reliable for everyone.
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
