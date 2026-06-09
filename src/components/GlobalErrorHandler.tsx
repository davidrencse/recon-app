"use client";

import { useEffect } from "react";

/**
 * GlobalErrorHandler:
 * Suppresses common but harmless runtime errors that can occur during
 * complex mobile interactions (like unmounting elements during a swipe).
 */
export default function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      // Fix for "Invalid pointer id" / releasePointerCapture error
      if (e.message?.includes("releasePointerCapture") || e.message?.includes("Invalid pointer id")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes("releasePointerCapture") || e.reason?.message?.includes("Invalid pointer id")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
