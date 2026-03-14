"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Plane,
  Crown,
  Loader2,
  Zap,
  Shield,
  Users,
  MessageCircle,
  BarChart3,
  Heart,
  Globe,
  FileText,
  Cloud,
  Brain,
} from "lucide-react";

const plans = [
  {
    id: "basic" as const,
    name: "Basic",
    price: 0,
    tagline: "Perfect for solo travelers",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/10",
    borderColor: "border-blue-200",
    features: [
      { text: "AI-powered itinerary generation", icon: Brain, included: true },
      { text: "Hotel & flight search", icon: Globe, included: true },
      { text: "Wishlist & favorites", icon: Heart, included: true },
      { text: "Budget tracking", icon: BarChart3, included: true },
      { text: "PDF export", icon: FileText, included: true },
      { text: "Weather & city info", icon: Cloud, included: true },
      { text: "Smart recommendations (RAG)", icon: Sparkles, included: true },
      { text: "Group collaboration", icon: Users, included: false },
      { text: "Shared itineraries", icon: Shield, included: false },
      { text: "Real-time chat", icon: MessageCircle, included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 10,
    tagline: "For groups & power planners",
    icon: Crown,
    gradient: "from-indigo-500 to-purple-600",
    bgGlow: "bg-indigo-500/10",
    borderColor: "border-indigo-300",
    popular: true,
    features: [
      { text: "AI-powered itinerary generation", icon: Brain, included: true },
      { text: "Hotel & flight search", icon: Globe, included: true },
      { text: "Wishlist & favorites", icon: Heart, included: true },
      { text: "Budget tracking", icon: BarChart3, included: true },
      { text: "PDF export", icon: FileText, included: true },
      { text: "Weather & city info", icon: Cloud, included: true },
      { text: "Smart recommendations (RAG)", icon: Sparkles, included: true },
      { text: "Group collaboration", icon: Users, included: true },
      { text: "Shared itineraries", icon: Shield, included: true },
      { text: "Real-time chat", icon: MessageCircle, included: true },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export default function ChoosePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleChoosePlan = async (plan: "basic" | "pro") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const data = await res.json();
      if (data.url) {
        // For basic (free) plan, the API returns a local redirect URL
        // For pro plan, it returns a Stripe checkout URL
        if (plan === "basic") {
          router.push(data.url);
        } else {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
            <Plane className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-slate-500">
            Start planning smarter trips today. Upgrade anytime to unlock group collaboration features.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          variants={containerVariants as any}
          initial="hidden"
          animate="visible"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loading === plan.id;
            const isFree = plan.price === 0;

            return (
              <motion.div
                key={plan.id}
                variants={cardVariants as any}
                className={`relative overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-indigo-300 ring-1 ring-indigo-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -right-8 top-6 rotate-45 bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                    Popular
                  </div>
                )}

                {/* Glow effect */}
                <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full ${plan.bgGlow} blur-3xl`} />

                <div className="relative p-8">
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 flex items-baseline gap-1">
                    {isFree ? (
                      <span className="text-4xl font-extrabold text-emerald-600">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                        <span className="text-sm font-medium text-slate-400">/month</span>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, i) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              feature.included
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-300"
                            }`}
                          >
                            {feature.included ? (
                              <Check className="h-3 w-3" strokeWidth={3} />
                            ) : (
                              <X className="h-3 w-3" strokeWidth={3} />
                            )}
                          </span>
                          <span
                            className={`text-sm ${
                              feature.included
                                ? "text-slate-700"
                                : "text-slate-400 line-through"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleChoosePlan(plan.id)}
                    disabled={loading !== null}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-60 ${
                      plan.popular
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isFree ? "Activating..." : "Redirecting to payment..."}
                      </>
                    ) : (
                      <>
                        {isFree ? "Get Started Free" : `Get ${plan.name}`}
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-10 text-center text-xs text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Secure payment via Stripe. Cancel anytime. All prices in USD.
        </motion.p>
      </div>
    </div>
  );
}
