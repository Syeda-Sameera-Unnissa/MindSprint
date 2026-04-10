"use client";

import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition-all duration-300 " +
    "hover:scale-[1.05] hover:-translate-y-[2px] active:scale-[0.96]";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 " +
      "text-white border border-white/10 shadow-lg shadow-purple-500/20 " +
      "hover:shadow-pink-500/30",

    secondary:
      "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 " +
      "hover:from-purple-500/30 hover:to-pink-500/30",

    success:
      "bg-green-500/20 text-green-300 border border-green-500/20 " +
      "hover:bg-green-500/30",

    danger:
      "bg-red-500/20 text-red-300 border border-red-500/20 " +
      "hover:bg-red-500/30",

    ghost:
      "bg-white/5 text-gray-300 hover:bg-white/10",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}