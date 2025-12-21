"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Scale className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
              </div>
              <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using CronOps services, you agree to be bound by these Terms of Service 
                    and all applicable laws and regulations. If you do not agree with any of these terms, 
                    you are prohibited from using our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Permission is granted to use CronOps services for personal or commercial purposes 
                    in accordance with your subscription plan. This license does not include the right 
                    to modify, resell, or redistribute our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Responsibilities</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the security of your account credentials and for 
                    all activities that occur under your account. You must notify us immediately of any 
                    unauthorized use.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Service Availability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We strive to provide 99.9% uptime for our services. However, we do not guarantee 
                    uninterrupted access and may perform maintenance that temporarily affects service 
                    availability.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree not to use CronOps for any unlawful purposes, to spam or abuse systems, 
                    or to interfere with other users' access to the service. We reserve the right to 
                    terminate accounts that violate these policies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CronOps shall not be liable for any indirect, incidental, special, consequential, 
                    or punitive damages resulting from your use of the service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms, contact us at{" "}
                    <a href="mailto:legal@cronops.dev" className="text-primary hover:underline">
                      legal@cronops.dev
                    </a>
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
