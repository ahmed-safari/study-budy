"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    // Create a MutationObserver to detect DOM changes that might indicate navigation
    const observer = new MutationObserver(() => {
      if (document.querySelector(".nprogress")) {
        handleRouteChangeStart();
      } else if (isLoading) {
        handleRouteChangeComplete();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up on unmount
    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  // Reset loading state when the path changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}
