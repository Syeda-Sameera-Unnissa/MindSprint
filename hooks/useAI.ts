"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useVoice } from "./useVoice";
import { useNotification } from "./useNotification";

export const useAI = () => {
  const { speak } = useVoice();
  const { sendNotification } = useNotification();

  useEffect(() => {
    const checkBehavior = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // 🧠 Get mood from localStorage
        const mood =
          typeof window !== "undefined"
            ? localStorage.getItem("mood") || "neutral"
            : "neutral";

        // 🧠 1. INACTIVITY DETECTION
        const { data: logs } = await supabase
          .from("behavior_log")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          const lastActionTime = new Date(
            logs[0].timestamp
          ).getTime();

          const now = new Date().getTime();

          const minutesInactive =
            (now - lastActionTime) / 1000 / 60;

          if (minutesInactive > 0.1) {
            let message = "";

            // 🎯 Mood-based messaging
            if (mood === "sad" || mood === "tired") {
              message = "It's okay. Start with something small.";
            } else if (mood === "stressed") {
              message =
                "Take a deep breath. Do just one task.";
            } else if (mood === "happy") {
              message =
                "You're doing great! Keep the momentum going.";
            } else {
              message =
                "You've been inactive. Start something now.";
            }

            speak(message);

            sendNotification("MindSprint", message);
          }
        }

        // 🧠 2. TOO MANY TASKS (OVERLOAD)
        const { data: tasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("completed", false)
          .eq("archived", false);

        if (tasks && tasks.length > 10) {
          speak("You have too many tasks. Focus on one.");
        }
      } catch (err) {
        console.error("AI Error:", err);
      }
    };

    // ⏱ Run every 1 minute
    const interval = setInterval(checkBehavior, 5000);

    return () => clearInterval(interval);
  }, []);

  return {};
};