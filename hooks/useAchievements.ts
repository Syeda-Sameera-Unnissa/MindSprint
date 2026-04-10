"use client";

import { supabase } from "@/lib/supabaseClient";

export const useAchievements = () => {
  const checkAchievements = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    const completed =
      tasks?.filter((t) => t.completed) || [];

    const unlock = async (title: string) => {
      await supabase.from("achievements").insert([
        {
          user_id: user.id,
          title,
        },
      ]);
    };

    // 🏆 RULES

    if (completed.length === 1) {
      unlock("🎯 First Task Completed");
    }

    if (completed.length === 5) {
      unlock("🔥 5 Tasks Completed");
    }

    if (completed.length === 10) {
      unlock("🚀 10 Tasks Completed");
    }
  };

  return { checkAchievements };
};