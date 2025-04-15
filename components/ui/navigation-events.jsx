"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Wrapper component that uses useSearchParams
const NavigationEventsContent = ({ setIsLoading }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    window.addEventListener("beforeunload", handleRouteChangeStart);

    // Set loading to true on navigation start
    const handleClick = (e) => {
      // Check for links that trigger navigation
      const target = e.target.closest("a");
      if (
        target &&
        target.href &&
        !target.href.startsWith("#") &&
        !target.target &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        handleRouteChangeStart();
        return;
      }

      // Handle button clicks that might trigger navigation
      const button = e.target.closest("button");
      if (button && !button.disabled) {
        // Skip buttons that are explicitly marked to not show loading
        if (
          button.classList.contains("no-loading") ||
          button.closest(".no-loading") ||
          button.classList.contains("cancel-button") ||
          button.closest(".cancel-button") ||
          button.getAttribute("role") === "alertdialog-cancel"
        ) {
          return;
        }

        // For all other buttons, show the loading state
        handleRouteChangeStart();
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("beforeunload", handleRouteChangeStart);
      document.removeEventListener("click", handleClick);
    };
  }, [setIsLoading]);

  // Reset loading state when the route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams, setIsLoading]);

  return null;
};

export function NavigationEvents({ setIsLoading }) {
  return (
    <Suspense fallback={null}>
      <NavigationEventsContent setIsLoading={setIsLoading} />
    </Suspense>
  );
}
