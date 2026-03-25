"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch {
      setError("Sign-in failed. Try again or check your Google account settings.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">CS 201 Study App</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to study</p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
