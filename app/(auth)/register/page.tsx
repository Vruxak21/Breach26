/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Plane,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUp } from "@/lib/auth-client";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

const rightPanelVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 18,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const logoVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: SignUpValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/choose-plan",
      });
      router.push("/choose-plan");
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left visual panel */}
      <div className="relative hidden w-0 flex-1 overflow-hidden bg-slate-900 md:block">
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=90"
          alt="Aerial view of a coast and mountains"
          fill
          priority
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-indigo-900/70" />

        <div className="relative flex h-full flex-col justify-between px-12 py-10 text-white">
          <motion.div
            className="space-y-6"
            variants={logoVariants as any}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/90 shadow-sm">
                <Plane className="h-3.5 w-3.5" />
              </span>
              <span className="tracking-wide">TravelMind</span>
            </div>

            <div className="max-w-sm space-y-3">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Plan smarter trips with AI
              </h1>
              <p className="text-base text-slate-100/80">
                Create your account and start building day-by-day itineraries in minutes.
              </p>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                Verified hotels & stays
              </div>
              <div className="rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                Real-time trip collaboration
              </div>
              <div className="rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                Live budget tracking
              </div>
            </div>

            <p className="text-xs text-slate-200/70">
              Trusted by travelers in 40+ countries.
            </p>
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <motion.div
        className="flex w-full items-center justify-center bg-white px-6 py-8 md:w-[45%] md:px-10 lg:px-14"
        variants={rightPanelVariants as any}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md">
          {/* Mobile top header with logo + thumbnails */}
          <div className="mb-8 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <Plane className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold text-slate-900">
                TravelMind
              </span>
            </div>
            <div className="flex gap-1.5">
              <img
                src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=200&q=60"
                alt="Tropical destination"
                className="h-8 w-12 rounded-lg object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1529758146491-1e11fd721f11?w=200&q=60"
                alt="City skyline"
                className="h-8 w-12 rounded-lg object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1559599101-7466fe601f50?w=200&q=60"
                alt="Mountain range"
                className="h-8 w-12 rounded-lg object-cover"
              />
            </div>
          </div>

          <motion.div
            className="space-y-1"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Create your account
            </h2>
            <p className="text-sm text-slate-500">
              Start planning AI-powered trips for free.
            </p>
          </motion.div>

          <motion.form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-8 space-y-5"
          >
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Alex Johnson"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  {...form.register("name")}
                />
              </div>
              {form.formState.errors.name?.message && (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password?.message && (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  {...form.register("confirmPassword")}
                />
              </div>
              {form.formState.errors.confirmPassword?.message && (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            {error && (
              <motion.p
                variants={itemVariants}
                className="text-sm text-rose-500"
              >
                {error}
              </motion.p>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-indigo-100 transition hover:scale-[1.02] hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>

            <motion.p
              className="text-center text-xs text-slate-500"
              variants={itemVariants}
            >
              By creating an account you agree to our{" "}
              <button
                type="button"
                className="font-medium text-slate-700 underline-offset-2 hover:underline"
              >
                Terms of Service
              </button>
              .
            </motion.p>

            <motion.div
              className="pt-2 text-center text-sm text-slate-600"
              variants={itemVariants}
            >
              <span>Already have an account? </span>
              <a
                href="/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Sign in
              </a>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

