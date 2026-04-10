"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TaskForm from "@/components/TaskForm";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";

export default function TasksPage() {
  useAuthGuard();
  const [tasks, setTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const router = useRouter();

  const playSound = (file: string) => {
    const audio = new Audio(`/sounds/${file}`);
    audio.play();
  };

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .eq("archived", false)
      .order("created_at", { ascending: false });

    setTasks(data || []);
  };

  const completeTask = async (taskId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existingTask } = await supabase
      .from("tasks")
      .select("completed")
      .eq("id", taskId)
      .single();

    if (existingTask?.completed) {
      toast("⚠️ Task already completed");
      return;
    }

    await supabase.from("tasks").update({ completed: true }).eq("id", taskId);
    await supabase.from("task_logs").insert([{ user_id: user.id }]);

    let { data: game } = await supabase
      .from("gamification")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    let dailyCompleted = game.daily_completed || 0;
    if (game.last_goal_date !== todayStr) dailyCompleted = 0;
    dailyCompleted++;

    let newStreak = game.streak || 0;
    if (game.last_completed_date) {
      const last = new Date(game.last_completed_date);
      const diff = (today.getTime() - last.getTime()) / 86400000;

      if (diff === 1) newStreak++;
      else if (diff > 1) newStreak = 1;
    } else newStreak = 1;

    let newXP = (game.xp || 0) + 10;
    let newCoins = (game.coins || 0) + 5;

    if (dailyCompleted === game.daily_goal) {
      newXP += 50;
      newCoins += 20;
      toast.success("🎯 Daily Goal Completed!");
      playSound("success.mp3");
    }

    const newLevel = Math.floor(newXP / 100) + 1;

    if (newLevel > game.level) {
      toast.success(`⭐ Level Up! Level ${newLevel}`);
      playSound("levelup.mp3");
    }

    await supabase.from("gamification").update({
      xp: newXP,
      coins: newCoins,
      level: newLevel,
      streak: newStreak,
      daily_completed: dailyCompleted,
      last_goal_date: todayStr,
      last_completed_date: todayStr
    }).eq("user_id", user.id);

    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const archiveTask = async (id: string) => {
    await supabase.from("tasks").update({ archived: true }).eq("id", id);
    fetchTasks();
  };

  const focusTask = (task: any) => {
    localStorage.setItem("focusTask", JSON.stringify(task));
    router.push("/focus");
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    };

    checkUser();
    fetchTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* HEADER */}
      <PageHeader
        title="Add Tasks"
        subtitle="Stay consistent. Build streaks. Level up."
      />

      {/* FORM */}
      <div className="mb-10">
        <GlassCard>
          <TaskForm
            initialData={editingTask}
            onSubmit={() => {
              setEditingTask(null);
              fetchTasks();
            }}
          />
        </GlassCard>
      </div>

      {/* SECTION TITLE */}
      <PageHeader title="Your Tasks" />

      {/* TASK LIST */}
      <div className="space-y-6">

        {tasks.map((task) => {
          const showDetails = openTaskId === task.id;

          return (
            <GlassCard key={task.id}>

              <div className="flex justify-between items-start">

                <div>
                  <p className="font-semibold text-lg text-white mb-1">
                    {task.title} {task.completed && "✅"}
                  </p>

                  {task.due_at && (
                    <p className="text-xs text-gray-400">
                      ⏰ {new Date(task.due_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <span className={`text-xs px-3 py-1 rounded-full ${
                  task.completed
                    ? "bg-green-500/20 text-green-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}>
                  {task.completed ? "Done" : "Pending"}
                </span>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 flex-wrap mt-4">

                <Button onClick={() => focusTask(task)} variant="primary">
                  🎯 Focus
                </Button>

                <Button onClick={() => setEditingTask(task)} variant="primary">
                  ✏️ Edit
                </Button>

                <Button
                  onClick={() => completeTask(task.id)}
                  variant="primary"
                  disabled={task.completed}
                >
                  ✅ Complete
                </Button>

                <Button onClick={() => deleteTask(task.id)} variant="secondary">
                  🗑️ Delete
                </Button>

              </div>

              {(task.notes || task.brain_dump) && (
                <button
                  onClick={() =>
                    setOpenTaskId(showDetails ? null : task.id)
                  }
                  className="mt-3 text-sm text-purple-300 hover:text-pink-300 transition"
                >
                  {showDetails ? "Hide Details ▲" : "View Details ▼"}
                </button>
              )}

              {showDetails && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">

                  {task.notes && (
                    <GlassCard className="bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20">
                      <p className="text-purple-300 font-semibold mb-1"> ✍️ Notes</p>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{task.notes}</p>
                    </GlassCard>
                  )}

                  {task.brain_dump && (
                    <GlassCard className="bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20">
                      <p className="text-purple-300 font-semibold mb-1"> 🗪 Brain Dump</p>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{task.brain_dump}</p>
                    </GlassCard>
                  )}

                </div>
              )}

            </GlassCard>
          );
        })}

      </div>
    </div>
  );
}