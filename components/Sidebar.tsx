"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<any>(null);
  const [mood, setMood] = useState("neutral");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(data);
    };

    load();

    const savedMood = localStorage.getItem("mood");
    if (savedMood) setMood(savedMood);
  }, []);

  const menu = [
    { name: "Todo", path: "/todo", icon: "⏳" },
    { name: "Tasks", path: "/tasks", icon: "📝" },
    { name: "Focus", path: "/focus", icon: "🎯" },
    { name: "Archive", path: "/archive", icon: "📜" },
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Feedback", path: "/feedback", icon: "⭐" },
    { name: "Profile", path: "/profile", icon: "👤" },
    
  ];

  return (
    <div className="w-64 h-screen flex flex-col p-4 text-white
      bg-gradient-to-b from-[#0B0F1A]/90 via-[#1e1b4b]/90 to-[#312e81]/90
      backdrop-blur-xl border-r border-white/10 shadow-xl"
    >

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-4 px-2 h-[60px]">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            MindSprint
          </h1>
        </div>

        {/* MOOD */}
        <div className="mb-4">
          <select
            value={mood}
            onChange={(e) => {
            setMood(e.target.value);
            localStorage.setItem("mood", e.target.value);
          }}
            className="w-full p-2 rounded-lg text-white
            bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20
            border border-white/10 backdrop-blur-md

            hover:from-blue-500/30 hover:to-pink-500/30
            hover:scale-[1.02] hover:-translate-y-[1px]

            focus:outline-none focus:ring-2 focus:ring-purple-500/40

            transition-all duration-200 cursor-pointer"
            >
            <option className="bg-[#111827]" value="happy">😊 Happy</option>
            <option className="bg-[#111827]" value="focused">🎯 Focused</option>
            <option className="bg-[#111827]" value="distracted">😵 Distracted</option>
            <option className="bg-[#111827]" value="overwhelmed">😖 Overwhelmed</option>
            <option className="bg-[#111827]" value="stressed">😫 Stressed</option>
            <option className="bg-[#111827]" value="sad">😔 Sad</option>
            <option className="bg-[#111827]" value="neutral">😐 Neutral</option>
            </select>
          </div>

        {/* MENU */}
        {menu.map((item) => {
          const active = pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`relative w-full text-left p-2 mb-2 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-500/30 to-pink-500/30 text-white shadow-md shadow-purple-500/20"
                  : "hover:bg-white/10 text-gray-300 hover:translate-x-1"
              }`}
            >

              {/* ACTIVE LINE */}
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-1 rounded bg-gradient-to-b from-blue-400 to-pink-400"></span>
              )}

              <div className="flex items-center gap-2 pl-2">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* BOTTOM */}
      <div className="mt-auto pt-4">

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            {profile?.name?.charAt(0) || "U"}
          </div>
          <span>{profile?.name || "User"}</span>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="w-full p-2 rounded-lg bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:scale-[1.02] transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}