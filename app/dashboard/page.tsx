"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";

export default function Dashboard() {
  useAuthGuard();

  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data: logs } = await supabase
      .from("task_logs")
      .select("*")
      .eq("user_id", user.id);

    // ✅ FIXED DAILY COUNT
    const todayCount =
      logs?.filter(
        (log: any) =>
          new Date(log.completed_at).toISOString().split("T")[0] === today
      ).length || 0;

    setDailyCompleted(todayCount);

    const last7Days: any = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(new Date().getDate() - i);
      last7Days[d.toISOString().split("T")[0]] = 0;
    }

    logs?.forEach((log: any) => {
      const date = new Date(log.completed_at)
        .toISOString()
        .split("T")[0];

      if (last7Days[date] !== undefined) {
        last7Days[date]++;
      }
    });

    setChartData(
      Object.keys(last7Days).map((date) => ({
        date: date.slice(5),
        tasks: last7Days[date],
      }))
    );

    const { data: game } = await supabase
      .from("gamification")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setCoins(game.coins);
    setStreak(game.streak);
    setXP(game.xp);
    setLevel(game.level);

    const { data: ach } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id);

    setAchievements(ach || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <PageHeader title="Dashboard" subtitle="Track your progress" />

      {/* Daily Goal */}
      <GlassCard className="text-center mb-6">
        🎯 Daily Goal: {dailyCompleted} / 3
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {[
          { icon: "🪙", label: "Coins", value: coins },
          { icon: "🔥", label: "Streak", value: streak },
          { icon: "⚡", label: "XP", value: xp },
          { icon: "⭐", label: "Level", value: level },
        ].map((item, i) => (
          <GlassCard key={i} className="text-center">
            <p className="text-2xl">{item.icon}</p>
            <p className="text-gray-400 text-sm">{item.label}</p>
            <p className="text-xl font-semibold">{item.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Chart */}
      <GlassCard>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="tasks" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Achievements */}
      <GlassCard className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">🏆 Achievements</h2>

        <div className="flex gap-2 flex-wrap">
          {achievements.map((a, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"
            >
              {a.type}
            </span>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}