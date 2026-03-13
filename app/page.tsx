"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const authClient = createAuthClient();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-4xl font-bold">Welcome to breach26</h1>
      
      {isPending ? (
        <p>Loading...</p>
      ) : session ? (
        <div className="flex flex-col items-center gap-4">
          <p>Logged in as: <span className="font-semibold">{session.user.email}</span></p>
          <Button variant="outline" onClick={() => authClient.signOut()}>
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

