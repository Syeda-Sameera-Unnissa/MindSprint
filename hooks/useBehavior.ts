"use client";

import { supabase } from "@/lib/supabaseClient";

export const useBehavior = () => {
  const logAction = async (action: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("behavior_log").insert([
      {
        action,
        user_id: user?.id,
      },
    ]);
  };

  return { logAction };
};