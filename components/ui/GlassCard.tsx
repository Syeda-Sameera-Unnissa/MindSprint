"use client";

import React from "react";

export default function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 
      bg-gradient-to-br from-[#0B0F1A]/80 via-purple-900/30 to-pink-900/30
      backdrop-blur-xl border border-white/10 
      shadow-lg shadow-purple-500/15 
      hover:shadow-pink-500/30 hover:scale-[1.02] hover:-translate-y-1
      transition-all duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
}