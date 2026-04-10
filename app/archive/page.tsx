"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";

export default function ArchivePage() {
  useAuthGuard();
  const [tasks, setTasks] = useState<any[]>([]);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null); // ✅ added

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user?.id)
      .eq("archived", true)
      .order("created_at", { ascending: false });

    setTasks(data || []);
  };

  const unarchiveTask = async (id: string) => {
    await supabase.from("tasks").update({ archived: false }).eq("id", id);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* HEADER */}
      <PageHeader
        title="Archived Tasks"
        subtitle="Review or restore your past work"
      />

      {/* EMPTY */}
      {tasks.length === 0 && (
        <GlassCard className="text-center text-gray-400">
          No archived tasks yet
        </GlassCard>
      )}

      {/* LIST */}
      <div className="space-y-5">

        {tasks.map((task) => {
          const showDetails = openTaskId === task.id;

          return (
            <GlassCard key={task.id}>

              <div className="flex justify-between items-start">

                {/* LEFT */}
                <div>
                  <p className="font-semibold text-lg text-white mb-1">
                    {task.title} {task.completed && "✅"}
                  </p>

                  {task.due_at && (
                    <p className="text-xs text-gray-400">
                      ⏰ {formatDate(task.due_at)}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => unarchiveTask(task.id)} variant="primary">
                    ♻️ Unarchive
                  </Button>

                  <Button onClick={() => deleteTask(task.id)} variant="secondary">
                    ❌ Delete
                  </Button>
                </div>

              </div>

              {/* VIEW DETAILS BUTTON */}
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

              {/* DETAILS (TASK STYLE) */}
              {showDetails && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">

                  {task.notes && (
                    <GlassCard className="bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20">
                      <p className="text-purple-300 font-semibold mb-1">📝 Notes</p>
                      <p className="text-sm text-gray-300 whitespace-pre-line">
                        {task.notes}
                      </p>
                    </GlassCard>
                  )}

                  {task.brain_dump && (
                    <GlassCard className="bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20">
                      <p className="text-purple-300 font-semibold mb-1">🧠 Brain Dump</p>
                      <p className="text-sm text-gray-300 whitespace-pre-line">
                        {task.brain_dump}
                      </p>
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