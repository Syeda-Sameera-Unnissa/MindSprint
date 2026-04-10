"use client";

import { supabase } from "@/lib/supabaseClient";

export const useGamification = () => {
  const updateGamification = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("gamification")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!data) {
      await supabase.from("gamification").insert([
        {
          user_id: user.id,
          coins: 10,
          streak: 1,
          xp: 20,
          level: 1,
          last_active: today,
        },
      ]);
      return;
    }

    let newCoins = data.coins + 10;
    let newXP = data.xp + 20;
    let newLevel = data.level;

    // 🧠 LEVEL LOGIC
    if (newXP >= newLevel * 100) {
      newLevel += 1;
    }

    // 🔥 STREAK LOGIC
    let newStreak = data.streak;

    if (data.last_active === today) {
      // same day
    } else {
      const y = new Date();
      y.setDate(y.getDate() - 1);

      if (data.last_active === y.toISOString().split("T")[0]) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    await supabase
      .from("gamification")
      .update({
        coins: newCoins,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        last_active: today,
      })
      .eq("user_id", user.id);
  };

  return { updateGamification };
};