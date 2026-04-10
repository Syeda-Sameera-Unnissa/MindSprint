"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else router.push("/tasks");
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-24
      bg-gradient-to-br from-[#030617] via-[#0B0F1A] to-[#1e1b4b] text-white">

      <div className="w-full max-w-lg p-[1px] rounded-2xl 
        bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30">

        <div className="rounded-2xl bg-[#0B0F1A]/90 backdrop-blur-xl p-8 border border-white/10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" className="w-12 h-12 mb-2" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              MindSprint
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">
            Welcome Back
          </h2>

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-3 rounded-xl 
            bg-white/5 border border-white/10 text-white
            focus:ring-2 focus:ring-purple-500/40 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded-xl 
            bg-white/5 border border-white/10 text-white
            focus:ring-2 focus:ring-purple-500/40 outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full p-3 rounded-xl 
            bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30
            border border-white/10
            hover:from-blue-500/50 hover:to-pink-500/50
            hover:scale-[1.02] transition-all duration-200"
          >
            Login
          </button>

          <div className="mt-4 text-sm text-center space-y-2">
            <button
              onClick={() => router.push("/forgot-password")}
              className="text-purple-300 hover:text-pink-300"
            >
              Forgot Password?
            </button>

            <button
              onClick={() => router.push("/register")}
              className="block w-full text-gray-400 hover:text-white"
            >
              Create an account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}