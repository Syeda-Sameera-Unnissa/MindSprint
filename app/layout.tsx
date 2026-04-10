"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AIEngine from "@/components/AIEngine";
import { Toaster } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // 🔥 NEW
  const pathname = usePathname();
  const router = useRouter();

  const hideSidebarRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  // 🔥 AUTH CHECK (MAIN FIX)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !hideSidebarRoutes.includes(pathname)) {
        router.replace("/login");
      }

      setCheckingAuth(false);
    };

    checkSession();
  }, [pathname]);

  // 🌙 Theme logic (same as before)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 🔥 BLOCK ENTIRE UI until auth is checked
  if (checkingAuth) return null;

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">

        {/* Sidebar */}
        {!shouldHideSidebar && (
          <div className="w-64 flex-shrink-0">
            <Sidebar setDarkMode={setDarkMode} />
          </div>
        )}

        {/* Main Content */}
        <div
          className="flex-1 overflow-y-auto 
          bg-gradient-to-br from-[#030617] via-[#0B0F1A] to-[#1e1b4b]
          text-white p-6"
        >
          <div className="max-w-7xl mx-auto min-h-screen flex flex-col">

            <div className="flex-1">
              {children}
            </div>

            <div className="py-1 text-center text-sm text-gray-400">
              © 2026 MindSprint • Built by Sameera •{" "}
              <a
                href="https://www.linkedin.com/in/syeda-sameera"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                LinkedIn
              </a>
            </div>

          </div>
        </div>

        <Toaster position="top-center" />
        <AIEngine />

      </body>
    </html>
  );
}