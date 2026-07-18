"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again or reload the page.
      </p>
      <Button variant="outline" onClick={reset} className="mt-2 gap-2">
        <RefreshCcw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
