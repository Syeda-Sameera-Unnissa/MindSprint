"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useBehavior } from "@/hooks/useBehavior";
import { useGamification } from "@/hooks/useGamification";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function FocusPage() {
  const [task, setTask] = useState<any>(null);

  const [seconds, setSeconds] = useState(1500);
  const [pausedFocusTime, setPausedFocusTime] = useState(1500);

  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isRunning, setIsRunning] = useState(false);

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const intervalRef = useRef<any>(null);

  const { logAction } = useBehavior();
  const { updateGamification } = useGamification();

  const totalTime = mode === "focus" ? 1500 : 300;

  // 🆕 NEW STATES
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState("default");
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentSound, setCurrentSound] = useState("rain");

  const sounds: any = {
    rain: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cafe: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    nature: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  };

  const themes: any = {
    default: "bg-gradient-to-br from-[#030617] via-[#0B0F1A] to-[#1e1b4b]",
    night: "bg-black",
    ocean: "bg-gradient-to-br from-blue-900 to-cyan-700",
    sunset: "bg-gradient-to-br from-orange-500 to-pink-600",
  };

  // ✅ INIT AUDIO + LOCAL STORAGE TASK
  useEffect(() => {
    const stored = localStorage.getItem("focusTask");
    if (stored) setTask(JSON.parse(stored));

    const sound = new Audio(sounds[currentSound]);
    sound.loop = true;
    sound.volume = 0.5;

    setAudio(sound);
  }, []);

  // 🔥 ✅ FIXED FETCH TASKS (MAIN ISSUE FIXED HERE)
  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      console.log("User:", user);

      if (!user) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("archived", false)
        .or("completed.is.null,completed.eq.false");

      console.log("Fetched Tasks:", data, error);

      setTasks(data || []);
    };

    fetchTasks();
  }, []);

  // 🆕 UPDATE SOUND
  useEffect(() => {
    if (!audio) return;

    audio.src = sounds[currentSound];

    if (isRunning && soundOn) {
      audio.play().catch(() => {});
    }
  }, [currentSound]);

  // ✅ TIMER
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // ✅ AUDIO CONTROL
  useEffect(() => {
    if (!audio) return;

    if (isRunning && soundOn) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isRunning, soundOn, audio]);

  const start = () => setIsRunning(true);

  const pause = () => {
    setIsRunning(false);
    if (mode === "focus") setPausedFocusTime(seconds);
  };

  const takeBreak = () => {
    if (mode === "focus") setPausedFocusTime(seconds);
    setMode("break");
    setSeconds(300);
    setIsRunning(true);
  };

  const backToFocus = () => {
    setMode("focus");
    setSeconds(pausedFocusTime);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    setSeconds(1500);
    setMode("focus");

    if (audio) audio.currentTime = 0;
  };

  const completeTask = async () => {
    if (!task) return;

    setIsRunning(false);

    await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", task.id);

    await logAction("task_completed");
    await updateGamification();

    localStorage.removeItem("focusTask");

    alert("Task completed 🎉");
  };

  const formatTime = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = ((totalTime - seconds) / totalTime) * 100;
  const radius = 90;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className={`${themes[theme]} min-h-screen`}>
      <div className={`${isFullscreen ? "fixed inset-0 z-50 p-6" : "max-w-4xl mx-auto px-4 py-8"}`}>

        <PageHeader
          title="Focus"
          subtitle={mode === "focus" ? "Deep work mode" : "Take a mindful break"}
        />

        <GlassCard className="text-center p-8">

          {/* ✅ FIXED DROPDOWN */}
          <select
            onChange={(e) => {
              const selected = tasks.find(
                (t) => String(t.id) === e.target.value
              );
              setTask(selected);
            }}
            className="mb-4 p-2 bg-white/10 rounded w-full"
          >
            <option value="">Select Task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <p className="text-gray-400 mb-6">
            {task?.title || "No task selected"}
          </p>

          {/* TIMER */}
          <div className="relative flex items-center justify-center mb-6">
            <svg height={radius * 2} width={radius * 2}>
              <circle
                stroke="rgba(255,255,255,0.1)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />

              <circle
                stroke="url(#gradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />

              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute text-4xl font-bold">
              {formatTime()}
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            {Math.round(progress)}% completed
          </p>

          {/* CONTROLS */}
          <div className="grid grid-cols-2 gap-3">

            {!isRunning ? (
              <Button onClick={start} variant="secondary">▶️ Start</Button>
            ) : (
              <Button onClick={pause} variant="secondary">⏸ Pause</Button>
            )}

            {mode === "focus" ? (
              <Button onClick={takeBreak} variant="secondary">☕ Break</Button>
            ) : (
              <Button onClick={backToFocus} variant="secondary">🎯 Back</Button>
            )}

            <Button onClick={stop} variant="primary">🛑 Stop</Button>
            <Button onClick={completeTask} variant="primary">✅ Complete</Button>

          </div>

          {/* FULLSCREEN */}
          <div className="mt-4">
            <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="secondary">
              ⛶ Fullscreen
            </Button>
          </div>

          {/* THEMES */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {Object.keys(themes).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="px-3 py-1 bg-white/10 rounded"
              >
                {t}
              </button>
            ))}
          </div>

          {/* SOUND SELECT */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {Object.keys(sounds).map((s) => (
              <button
                key={s}
                onClick={() => setCurrentSound(s)}
                className="px-3 py-1 bg-white/10 rounded"
              >
                {s}
              </button>
            ))}
          </div>

          {/* SOUND TOGGLE */}
          <div className="mt-6">
            <Button
              onClick={() => setSoundOn((prev) => !prev)}
              variant="secondary"
            >
              {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
            </Button>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}