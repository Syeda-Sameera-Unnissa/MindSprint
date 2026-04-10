"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useVoice } from "@/hooks/useVoice";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";

export default function TodoPage() {
  useAuthGuard();

  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [brainDump, setBrainDump] = useState("");

  const { startListening } = useVoice();

  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user?.id);

    setTodos(data || []);
  };

  const addTodo = async () => {
    if (!title) return;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("todos").insert([
      {
        title,
        notes,
        brain_dump: brainDump,
        user_id: user?.id,
      },
    ]);

    setTitle("");
    setNotes("");
    setBrainDump("");
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
  };

  const moveToTasks = async (todo: any) => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("tasks").insert([
      {
        title: todo.title,
        notes: todo.notes,
        brain_dump: todo.brain_dump,
        user_id: user?.id,
      },
    ]);

    await deleteTodo(todo.id);
  };

  const smartOrganize = (text: string) => {
    return text
      .split(/[.,\n]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, i) => `${i + 1}. ${line}`)
      .join("\n");
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* HEADER */}
      <PageHeader
        title="Todo"
        subtitle="Capture quickly. Organize smartly."
      />

      {/* FORM */}
      <div className="mb-10">
        <GlassCard>

          {/* TITLE */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quick task"
            className="w-full p-3 mb-3 rounded-xl 
            bg-white/5 border border-white/10 text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />

          <Button
            onClick={() => startListening(setTitle)}
            className="w-full mb-4"
          >
            🎤 Voice Input
          </Button>

          {/* NOTES */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full p-3 mb-2 rounded-xl 
            bg-white/5 border border-white/10 text-white"
          />

          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => startListening(setNotes)}
              className="flex-1"
            >
              🎤 Notes
            </Button>

            <Button
              onClick={() => setNotes(smartOrganize(notes))}
              variant="secondary"
              className="flex-1"
            >
              ✨ Smart Organize
            </Button>
          </div>

          {/* BRAIN DUMP */}
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="Brain Dump"
            className="w-full p-3 mb-2 rounded-xl 
            bg-white/5 border border-white/10 text-white"
          />

          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => startListening(setBrainDump)}
              className="flex-1"
            >
              🎤 Brain Dump
            </Button>

            <Button
              onClick={() => setBrainDump(smartOrganize(brainDump))}
              variant="secondary"
              className="flex-1"
            >
              ✨ Smart Organize
            </Button>
          </div>

          {/* ADD BUTTON */}
          <Button onClick={addTodo} className="w-full">
            ➕ Add Todo
          </Button>

        </GlassCard>
      </div>

      {/* TODO LIST */}
      <div className="space-y-5">

        {todos.map((todo) => (
          <GlassCard key={todo.id}>

            <p className="font-semibold text-white text-lg mb-1">
              {todo.title}
            </p>

            {todo.notes && (
              <p className="text-sm text-gray-300 mb-1 whitespace-pre-line">
                📝 {todo.notes}
              </p>
            )}

            {todo.brain_dump && (
              <p className="text-sm text-gray-400 whitespace-pre-line">
                🧠 {todo.brain_dump}
              </p>
            )}

            <div className="mt-4 flex gap-2 flex-wrap">
              <Button onClick={() => moveToTasks(todo)} variant="primary">
                📝 Move To Tasks
              </Button>

              <Button onClick={() => deleteTodo(todo.id)} variant="secondary">
                🗑️ Delete
              </Button>
            </div>

          </GlassCard>
        ))}

      </div>

    </div>
  );
}