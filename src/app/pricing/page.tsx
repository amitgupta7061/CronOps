"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { usersApi, Plan } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    id: "FREE",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "3 Active Cron Jobs",
      "Standard Support",
      "Basic Analytics",
      "1 Minute Resolution",
    ],
    limit: 3,
    popular: false,
  },
  {
    name: "Premium",
    id: "PREMIUM",
    price: 50,
    description: "For growing needs",
    features: [
      "100 Active Cron Jobs",
      "Priority Support",
      "Advanced Analytics",
      "30 Second Resolution",
      "Email Notifications",
    ],
    limit: 100,
    popular: true,
  },
  {
    name: "Pro",
    id: "PRO",
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
    limit: Infinity,
    popular: false,
  },
] as const;

export default function PricingPage() {
  const { user, checkAuth } = useAuthStore();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: Plan) => {
    try {
      setLoadingPlan(planId);
      await usersApi.updatePlan(planId);
      await checkAuth(); // Refresh user state
      
      toast({
        title: "Plan Updated",
        description: `You remain now on the ${planId} plan.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your automation needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
          {plans.map((plan, index) => {
            const isCurrentPlan = user?.plan === plan.id || (!user?.plan && plan.id === "FREE");
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "relative flex flex-col h-full",
                    plan.popular ? "border-primary shadow-lg scale-105 z-10" : "border-border",
                    isCurrentPlan ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "secondary"}
                      disabled={isCurrentPlan || loadingPlan !== null}
                      onClick={() => handleUpgrade(plan.id as Plan)}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        "Upgrade"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
