"use client";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession } = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});
