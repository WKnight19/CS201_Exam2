"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function NavBar() {
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/sign-in";
  }

  return (
    <nav className="border-b border-border py-3 px-6 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg">
        CS 201 Study
      </Link>
      <div className="flex items-center gap-3">
        {session?.user ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback>
                {session.user.name ? session.user.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </>
        ) : (
          <Link href="/sign-in" className="text-sm">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
