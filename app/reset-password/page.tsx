"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  // 🔐 Proper guard for reset-password page
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      // If no session → user didn’t come from reset link
      if (!data.session) {
        router.push("/login");
      }
    };

    checkSession();
  }, []);

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      router.push("/login"); // ✅ redirect after success
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24
      bg-gradient-to-br from-[#030617] via-[#0B0F1A] to-[#1e1b4b] text-white">

      {/* Gradient Border */}
      <div className="w-full max-w-lg p-[1px] rounded-2xl 
        bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30">

        {/* Glass Card */}
        <div className="rounded-2xl bg-[#0B0F1A]/90 backdrop-blur-xl p-8 border border-white/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" className="w-12 h-12 mb-2" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              MindSprint
            </h1>
          </div>
          <h2 className="text-xl font-semibold mb-6 text-center
            bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
            text-transparent bg-clip-text">
            New Password
          </h2>

          <input
            type="password"
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded-xl 
            bg-white/5 border border-white/10 text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />

          <button
            onClick={handleUpdate}
            className="w-full p-3 rounded-xl 
            bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30
            border border-white/10
            hover:from-blue-500/50 hover:to-pink-500/50
            hover:scale-[1.02] active:scale-[0.97]
            transition-all duration-200 font-medium shadow-lg shadow-purple-500/20"
          >
            Update Password
          </button>

          {/* Back to login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Back to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}