"use client";

import { supabase } from "@/lib/supabaseClient";

export const useInsights = () => {
  // 🧠 AI INSIGHTS
  const generateInsights = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const insights: string[] = [];

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (!tasks || tasks.length === 0) {
      return ["Start completing tasks to see insights."];
    }

    const completedTasks = tasks.filter((t) => t.completed);

    // 🔹 Productivity ratio
    const ratio = completedTasks.length / tasks.length;

    if (ratio > 0.7) {
      insights.push("🔥 You're highly productive!");
    } else if (ratio > 0.4) {
      insights.push("👍 You're making steady progress.");
    } else {
      insights.push("⚡ Try completing more tasks.");
    }

    // 🔹 Best hour
    const hours: any = {};

    completedTasks.forEach((task: any) => {
      const hour = new Date(task.created_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    let bestHour: any = null;
    let max = 0;

    Object.keys(hours).forEach((h) => {
      if (hours[h] > max) {
        max = hours[h];
        bestHour = h;
      }
    });

    if (bestHour !== null) {
      insights.push(`⏰ You're most productive around ${bestHour}:00`);
    }

    // 🔹 Consistency
    const daysSet = new Set();

    completedTasks.forEach((task: any) => {
      const day = new Date(task.created_at)
        .toISOString()
        .split("T")[0];
      daysSet.add(day);
    });

    if (daysSet.size >= 5) {
      insights.push("🔥 Strong consistency streak!");
    } else if (daysSet.size >= 3) {
      insights.push("👍 You're building consistency.");
    } else {
      insights.push("⚡ Try working consistently daily.");
    }

    return insights;
  };

  // 📈 WEEKLY IMPROVEMENT
  const getWeeklyImprovement = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", true);

    const now = new Date();

    let thisWeek = 0;
    let lastWeek = 0;

    tasks?.forEach((task: any) => {
      const date = new Date(task.created_at);
      const diff =
        (now.getTime() - date.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diff <= 7) thisWeek++;
      else if (diff <= 14) lastWeek++;
    });

    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;

    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  };

  return { generateInsights, getWeeklyImprovement };
};