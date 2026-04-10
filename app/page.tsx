"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login"); // 🔥 redirect immediately
      }
    };

    checkUser();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="relative p-[1px] rounded-2xl 
        bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20
        hover:scale-[1.03] hover:-translate-y-1 transition">

        <div className="absolute inset-0 blur-xl opacity-0 
          bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
          hover:opacity-20 transition"></div>

        <div className="relative rounded-2xl bg-[#0B0F1A]/90 backdrop-blur-xl 
          p-10 border border-white/10 text-center">

          <img src="/logo.png" className="w-12 h-12 mx-auto mb-3" />

          <h1 className="text-4xl font-bold mb-4
            bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400
            text-transparent bg-clip-text">
            MindSprint
          </h1>

          <p className="text-gray-400 mb-8">
            Capture tasks. Stay focused. Build consistency.
          </p>

          <button
            onClick={() => router.push("/todo")}
            className="w-full p-3 rounded-xl 
            bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30
            border border-white/10
            hover:from-blue-500/50 hover:to-pink-500/50
            hover:scale-[1.02] active:scale-[0.97]
            transition-all duration-200 font-medium shadow-lg shadow-purple-500/20"
          >
            Start Planning
          </button>

        </div>
      </div>
    </div>
  );
}