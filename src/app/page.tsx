"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Clock, 
  Shield, 
  Zap, 
  BarChart3, 
  Code2, 
  Terminal, 
  Rocket,
  CheckCircle2,
  Quote,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/store";

const features = [
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Support for any cron expression with timezone awareness",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "HTTP and script jobs executed reliably with retries",
  },
  {
    icon: BarChart3,
    title: "Detailed Logs",
    description: "Complete execution history with response tracking",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with Redis-backed queues",
  },
];

const useCases = [
  {
    icon: Code2,
    title: "For Developers",
    description: "Trigger API endpoints or run scripts without managing crontab files. Perfect for maintenance tasks and recurring jobs.",
    benefits: ["Webhook integrations", "Instant one-off runs", "History retention"]
  },
  {
    icon: Terminal,
    title: "For DevOps",
    description: "Centralize cron job management across your infrastructure. Monitor health and get alerted on failures.",
    benefits: ["Central dashboard", "Failure alerts", "Secure execution"]
  },
  {
    icon: Rocket,
    title: "For Startups",
    description: "Scale your background tasks without managing complex infrastructure. Start free and grow as you need.",
    benefits: ["Zero maintenance", "Usage analytics", "Team collaboration"]
  }
];

const steps = [
  {
    step: "01",
    title: "Define Your Job",
    description: "Enter your cron expression and choose your target (HTTP Endpoint or Script)."
  },
  {
    step: "02",
    title: "Set Schedule",
    description: "Configure timezone and retry policies to ensure reliable execution."
  },
  {
    step: "03",
    title: "Monitor & Track",
    description: "Watch executions in real-time and get notified if anything goes wrong."
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "3 Active Cron Jobs",
      "Standard Support",
      "Basic Analytics",
      "1 Minute Resolution",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: 50,
    description: "For growing needs",
    features: [
      "100 Active Cron Jobs",
      "Priority Support",
      "Advanced Analytics",
      "30 Second Resolution",
      "Email Notifications",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: 100,
    description: "For power users & teams",
    features: [
      "Unlimited Cron Jobs",
      "24/7 Dedicated Support",
      "Real-time Analytics",
      "1 Second Resolution",
      "Webhook Integrations",
      "Team Management",
    ],
    popular: false,
  },
];

const testimonials = [
  {
    quote: "CronOps has completely simplified how we handle background tasks. No more ssh-ing into servers to edit crontabs.",
    author: "Alex Chen",
    role: "Senior Engineer at TechFlow",
    avatar: "AC"
  },
  {
    quote: "The monitoring capabilities are a lifesaver. We know immediately if a critical sync job fails.",
    author: "Sarah Miller",
    role: "DevOps Lead at ScaleUp",
    avatar: "SM"
  },
  {
    quote: "Setup was incredibly fast. We migrated over 50 cron jobs in less than an hour.",
    author: "Jordan Davis",
    role: "CTO at Innovate",
    avatar: "JD"
  }
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-4 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                v2.0 is now live
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-8">
                Schedule Jobs with{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A modern, reliable cron job scheduling platform. Create, manage, and
                monitor your scheduled tasks with enterprise-grade reliability and zero infrastructure headaches.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="text-base px-8 h-12 rounded-full">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-full">
                    View Demo
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Hero Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 relative mx-auto max-w-5xl"
            >
              <div className="rounded-xl border border-border bg-card/50 backdrop-blur-xl p-2 shadow-2xl">
                <div className="rounded-lg bg-background/50 border border-border/50 p-4 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Active Jobs", value: "24", color: "text-indigo-500", trend: "+2" },
                      { label: "Success Rate", value: "99.9%", color: "text-emerald-500", trend: "+0.1%" },
                      { label: "Total Executions", value: "12.4k", color: "text-purple-500", trend: "+1.2k" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-6 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                      >
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {stat.label}
                            </p>
                            <p className="text-3xl font-bold text-foreground mt-2">
                              {stat.value}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-background border ${stat.color}`}>
                            {stat.trend}
                          </span>
                       </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur-lg opacity-20 -z-10" />
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to run reliable jobs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful features designed for developers and ops teams.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-8 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Built for every use case
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-border bg-gradient-to-b from-card to-background p-8"
                >
                  <useCase.icon className="h-10 w-10 text-primary mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-6">{useCase.description}</p>
                  <ul className="space-y-3">
                    {useCase.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-24 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Get started in minutes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border/50 -z-10" />
              
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center text-3xl font-bold text-primary mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground max-w-xs">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the perfect plan for your automation needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl border ${
                    plan.popular 
                      ? "border-primary shadow-lg shadow-primary/20 scale-105" 
                      : "border-border"
                  } bg-card p-8 flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-green-500 mr-3 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Loved by developers
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-card border border-border"
                >
                  <Quote className="h-8 w-8 text-primary/20 mb-6" />
                  <p className="text-lg text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/90" />
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
              Ready to automate your workflow?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who trust CronOps for their mission-critical background tasks. Start for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 h-12">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 bg-transparent text-white border-white hover:bg-white/10 hover:text-white">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}