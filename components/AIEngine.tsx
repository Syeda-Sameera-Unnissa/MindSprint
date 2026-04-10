"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AIEngine() {
  const hasSpokenRef = useRef(false);

  // 🔊 SAFE SPEAK FUNCTION
  const speak = (text: string) => {
    const synth = window.speechSynthesis;

    if (synth.speaking) return;

    const utter = new SpeechSynthesisUtterance(text);

    utter.onerror = () => {
      console.warn("Speech interrupted (safe)");
    };

    synth.cancel();
    synth.speak(utter);

    console.log("🔊 AI:", text);
  };

  // 🧠 GENERATE DYNAMIC MESSAGE
  const generateMessage = (
    mood: string,
    insights: any,
    name: string
  ) => {
    const tones = ["sarcastic", "coach", "friendly"];
    const tone =
      tones[Math.floor(Math.random() * tones.length)];

    const phrases: any = {
      sarcastic: [
        "that task won't magically finish itself.",
        "scrolling isn't part of the plan, right?",
        "interesting approach… avoiding everything.",
        "procrastination level: expert.",
      ],
      coach: [
        "start small. just begin.",
        "you've got this. one step.",
        "focus for just 2 minutes.",
        "momentum starts now.",
      ],
      friendly: [
        "let’s do one task together.",
        "you’re doing okay, keep going.",
        "small progress still counts.",
        "just start, I’m with you.",
      ],
    };

    let message =
      phrases[tone][
        Math.floor(Math.random() * phrases[tone].length)
      ];

    // 🧠 ADD BEHAVIOR INSIGHTS
    if (insights?.hour) {
      message += ` You usually slow down around ${insights.hour}:00.`;
    }

    if (insights?.streakBreak) {
      message += ` You tend to lose streak after ${insights.streakBreak} days.`;
    }

    // 👥 BODY DOUBLE EFFECT
    const bodyDoubleLines = [
      "I'm here with you.",
      "Let's do this together.",
      "Don't worry, I'm watching 😄",
      "I'm right here, no escaping now.",
    ];

    if (Math.random() < 0.3) {
      message +=
        " " +
        bodyDoubleLines[
          Math.floor(Math.random() * bodyDoubleLines.length)
        ];
    }

    // 👤 ADD NAME PERSONALIZATION
    if (name) {
      message = `${name}, ${message}`;
    }

    return message;
  };

  // 🧠 ANALYZE USER BEHAVIOR
  const getBehaviorInsights = async (userId: string) => {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", true);

    if (!tasks || tasks.length === 0) return {};

    // ⏰ Most active hour
    const hourMap: any = {};

    tasks.forEach((t: any) => {
      const hour = new Date(t.created_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    let bestHour = null;
    let max = 0;

    Object.keys(hourMap).forEach((h) => {
      if (hourMap[h] > max) {
        max = hourMap[h];
        bestHour = h;
      }
    });

    // 🔥 Streak break pattern
    const dates = tasks
      .map((t: any) =>
        new Date(t.created_at).toISOString().split("T")[0]
      )
      .sort();

    let maxGap = 0;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);

      const diff =
        (curr.getTime() - prev.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diff > maxGap) maxGap = diff;
    }

    return {
      hour: bestHour,
      streakBreak: Math.floor(maxGap),
    };
  };

  useEffect(() => {
    const checkBehavior = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const mood =
          localStorage.getItem("mood") || "neutral";

        // 🧠 GET PROFILE (NAME)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const name = profile?.name || "";

        // 📊 LAST ACTIVITY
        const { data: logs } = await supabase
          .from("behavior_log")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (!logs || logs.length === 0) return;

        const lastAction = new Date(
          logs[0].timestamp
        ).getTime();

        const now = new Date().getTime();

        const minutesInactive =
          (now - lastAction) / 1000 / 60;

        // ⚡ TRIGGER
        if (minutesInactive > 0.1 && !hasSpokenRef.current) {
          const insights = await getBehaviorInsights(
            user.id
          );

          const message = generateMessage(
            mood,
            insights,
            name
          );

          // ❌ Avoid tab switch issues
          if (document.hidden) return;

          speak(message);

          // 🔔 NOTIFICATION
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }

          if (Notification.permission === "granted") {
            new Notification("MindSprint", {
              body: message,
            });
          }

          hasSpokenRef.current = true;
        }
      } catch (err) {
        console.error("AI Error:", err);
      }
    };

    const interval = setInterval(checkBehavior, 5000);

    return () => clearInterval(interval);
  }, []);

  return null;
}