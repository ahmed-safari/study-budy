"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Wrapper component that uses useSearchParams
const LoadingOverlayContent = () => {
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-indigo-600 border-r-indigo-600 border-b-indigo-200 border-l-indigo-200 mb-3"></div>
        <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
        <p className="text-gray-500 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
};

export function LoadingOverlay() {
  return (
    <Suspense fallback={null}>
      <LoadingOverlayContent />
    </Suspense>
  );
}
