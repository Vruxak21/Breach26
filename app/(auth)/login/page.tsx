/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "@/lib/auth-client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plane,
  Sparkles,
} from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInValues = z.infer<typeof signInSchema>;

const panelVariants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: "spring", stiffness: 80, damping: 18, when: "beforeChildren", staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.04 12.2615C23.04 11.4459 22.9669 10.6615 22.8306 9.90918H12V14.3576H18.1894C17.9222 15.7959 17.1116 17.0041 15.9034 17.8123V20.7137H19.5606C21.76 18.6615 23.04 15.7615 23.04 12.2615Z" fill="#4285F4" />
      <path d="M12 23.5C15.24 23.5 17.9572 22.4292 19.5606 20.7136L15.9034 17.8123C15.0397 18.3931 13.9531 18.7387 12 18.7387C8.87531 18.7387 6.22938 16.6706 5.28938 13.8298H1.51001V16.8179C3.10188 20.5656 7.19688 23.5 12 23.5Z" fill="#34A853" />
      <path d="M5.28938 13.8297C5.04188 13.2489 4.90125 12.6243 4.90125 11.9997C4.90125 11.3751 5.04188 10.7506 5.28938 10.1697V7.18164H1.51001C0.76875 8.66975 0.375 10.2943 0.375 11.9997C0.375 13.7051 0.76875 15.3297 1.51001 16.8178L5.28938 13.8297Z" fill="#FBBC05" />
      <path d="M12 5.26094C14.1216 5.26094 15.9897 6.00141 17.4253 7.36953L19.6622 5.11828C17.9522 3.23641 15.235 2 12 2C7.19688 2 3.10188 4.93453 1.51001 8.68228L5.28938 11.6703C6.22938 8.82953 8.87531 6.76094 12 5.26094Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (values: SignInValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.email({ email: values.email, password: values.password, callbackURL: "/dashboard" });
      router.push("/dashboard");
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    background: "var(--bg-wash)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: "15px",
    color: "var(--text-primary)",
    padding: "11px 14px",
    outline: "none",
    transition: "all 150ms",
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--primary-500)";
    e.target.style.boxShadow = "var(--shadow-primary)";
    e.target.style.background = "var(--bg-base)";
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--border-default)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "var(--bg-wash)";
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Left: Visual Panel */}
      <div className="relative hidden w-0 flex-1 overflow-hidden md:block">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=90"
          alt="Aerial view of a scenic travel destination"
          fill
          priority
          className="object-cover"
        />
        {/* Warm gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(234,108,0,0.15) 100%)" }}
        />
        <div className="relative flex h-full flex-col justify-between px-12 py-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(249,115,22,0.85)" }}
            >
              <Plane className="h-4 w-4" />
            </span>
            <span
              className="text-[22px] font-700"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              TravelMind
            </span>
          </div>

          {/* Quote */}
          <div className="space-y-5">
            <h2
              className="text-[44px] font-700 leading-tight max-w-sm"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              Your next adventure starts here.
            </h2>
            <p className="text-[16px] max-w-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
              Join 50,000+ travelers planning smarter trips with AI.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {["AI Itineraries", "Real-time Collaboration", "Smart Budgeting"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-4 py-1.5 text-[13px] font-medium"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Trusted by travelers in 40+ countries.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Auth Panel */}
      <motion.div
        className="flex w-full items-center justify-center px-6 py-10 md:w-[45%] md:px-10 lg:px-14"
        style={{ background: "var(--bg-base)" }}
        variants={panelVariants as any}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "var(--accent-50)", color: "var(--accent-500)" }}
              >
                <Plane className="h-4 w-4" />
              </div>
              <span
                className="text-[18px] font-700"
                style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
              >
                TravelMind
              </span>
            </div>
            <div className="flex gap-1.5">
              {[
                "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=200&q=60",
                "https://images.unsplash.com/photo-1529758146491-1e11fd721f11?w=200&q=60",
                "https://images.unsplash.com/photo-1559599101-7466fe601f50?w=200&q=60",
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="h-8 w-12 rounded-lg object-cover" />
              ))}
            </div>
          </div>

          {/* Heading */}
          <motion.div className="space-y-1" variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent-500)" }} />
              <span className="tm-label" style={{ color: "var(--accent-600)" }}>Welcome back</span>
            </div>
            <h2
              className="text-[32px] font-700"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
            >
              Sign in to continue
            </h2>
            <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
              Plan your next adventure where you left off.
            </p>
          </motion.div>

          <motion.form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-8 space-y-5"
          >
            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label htmlFor="email" className="tm-label-field">Email address</label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center h-4 w-4 my-auto"
                  style={{ color: "var(--text-muted)", top: "50%", transform: "translateY(-50%)", position: "absolute" }}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="text-[12px]" style={{ color: "var(--danger-text)" }}>
                  {form.formState.errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label htmlFor="password" className="tm-label-field">Password</label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute h-4 w-4"
                  style={{ color: "var(--text-muted)", top: "50%", left: "14px", transform: "translateY(-50%)", position: "absolute" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingLeft: "40px", paddingRight: "40px" }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password?.message && (
                <p className="text-[12px]" style={{ color: "var(--danger-text)" }}>
                  {form.formState.errors.password.message}
                </p>
              )}
              <div className="mt-1 text-right">
                <button type="button" className="text-[12px] font-medium" style={{ color: "var(--primary-600)" }}>
                  Forgot password?
                </button>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p variants={itemVariants} className="text-[13px]" style={{ color: "var(--danger-text)" }}>
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 font-600 text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: "var(--accent-500)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 24px",
                  fontSize: "15px",
                  fontFamily: "var(--font-sans)",
                  border: "none",
                  boxShadow: "var(--shadow-accent)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div className="flex items-center gap-3" variants={itemVariants}>
              <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
              <span className="tm-label">or continue with</span>
              <div className="h-px flex-1" style={{ background: "var(--border-default)" }} />
            </motion.div>

            {/* Google */}
            <motion.div variants={itemVariants}>
              <button
                type="button"
                onClick={() => signIn.social({ provider: "google", callbackURL: "/dashboard" })}
                className="inline-flex w-full items-center justify-center gap-3 font-medium transition-all"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  padding: "11px 24px",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-base)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </motion.div>

            {/* Sign up link */}
            <motion.div className="pt-2 text-center text-[14px]" variants={itemVariants} style={{ color: "var(--text-muted)" }}>
              <span>Don&apos;t have an account? </span>
              <a href="/signup" className="font-semibold" style={{ color: "var(--accent-600)" }}>
                Create one free
              </a>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
