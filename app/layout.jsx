"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { NavigationEvents } from "@/components/ui/navigation-events";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Note: metadata is now in a separate file since this is a client component

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Loading overlay - appears when navigating between pages */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-lg font-medium">Loading...</p>
            </div>
          </div>
        )}

        {children}
        <Toaster />
        <NavigationEvents setIsLoading={setIsLoading} />
        <footer className="m-4 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.
          </p>
          <p>
            Made with <span className="text-red-500">♥️</span> by DSAI4201
            Students
          </p>
        </footer>
      </body>
    </html>
  );
}
