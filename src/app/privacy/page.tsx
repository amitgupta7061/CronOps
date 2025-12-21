"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export default function PrivacyPage() {
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
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
              </div>
              <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, 
                    use our services, or contact us for support. This includes your name, email address, 
                    and any job configurations you create.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use the information we collect to provide, maintain, and improve our services, 
                    process transactions, send you technical notices and support messages, and respond 
                    to your comments and questions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect your personal information 
                    from unauthorized access, alteration, disclosure, or destruction. All data is encrypted 
                    in transit and at rest.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Retention</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as your account is active or as needed 
                    to provide you services. Execution logs are retained based on your subscription plan.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to access, correct, or delete your personal information at any time. 
                    You can manage your data through your account settings or by contacting our support team.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us at{" "}
                    <a href="mailto:privacy@cronops.dev" className="text-primary hover:underline">
                      privacy@cronops.dev
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
