"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useVoice } from "@/hooks/useVoice";
import { useNotification } from "@/hooks/useNotification";
import { useReminder } from "@/hooks/useReminder";
import Button from "@/components/ui/Button";

type Props = {
  initialData?: any;
  onSubmit: (data: any) => void;
};

export default function TaskForm({ initialData, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [notes, setNotes] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [readAloud, setReadAloud] = useState(true);
  const [formKey, setFormKey] = useState(0);

  const { startListening, parseCommand } = useVoice();
  const { requestPermission, sendNotification } = useNotification();
  const { scheduleReminder } = useReminder();

  const smartOrganize = (text: string) => {
    return text
      .split(/[.,\n]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, i) => `${i + 1}. ${line}`)
      .join("\n");
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");

      setDueAt(
        initialData.due_at
          ? new Date(initialData.due_at).toISOString().slice(0, 19)
          : ""
      );

      setReminderAt(
        initialData.reminder_at
          ? new Date(initialData.reminder_at).toISOString().slice(0, 19)
          : ""
      );

      setNotes(initialData.notes || "");
      setBrainDump(initialData.brain_dump || "");
    }
  }, [initialData]);

  const handleSubmit = async () => {
    await requestPermission();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    if (reminderAt) {
      const now = new Date().getTime();
      const reminderTime = new Date(reminderAt).getTime();
      const delay = reminderTime - now;

      if (delay > 0 && delay <= 86400000) {
        scheduleReminder(
          reminderAt,
          title,
          (msg) => {
            if (readAloud) {
              speechSynthesis.speak(
                new SpeechSynthesisUtterance(msg)
              );
            }
          },
          sendNotification
        );
      }
    }

    let error;

    if (initialData?.id) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          title,
          due_at: dueAt || null,
          reminder_at: reminderAt || null,
          notes,
          brain_dump: brainDump,
        })
        .eq("id", initialData.id);

      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            due_at: dueAt || null,
            reminder_at: reminderAt || null,
            notes,
            brain_dump: brainDump,
            user_id: user.id,
            completed: false,
            archived: false,
          },
        ]);

      error = insertError;
    }

    if (error) {
      alert("Error saving task: " + error.message);
      return;
    }

    onSubmit({});

    setTitle("");
    setDueAt("");
    setReminderAt("");
    setNotes("");
    setBrainDump("");

    setFormKey((prev) => prev + 1);
  };

  return (
    <div
      key={formKey}
      className="space-y-5 p-5 rounded-2xl 
      bg-white/5 backdrop-blur-xl border border-white/10 
      shadow-xl shadow-purple-500/10 text-white"
    >

      {/* TITLE */}
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="✨ What do you want to get done?"
          className="p-3 w-full rounded-xl 
          bg-white/5 border border-white/10 
          text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />

        <Button
          onClick={() =>
            startListening((text) => {
              const parsed = parseCommand(text);
              if (parsed.title) setTitle(parsed.title);
              if (parsed.notes) setNotes(parsed.notes);
              if (parsed.brain_dump) setBrainDump(parsed.brain_dump);
              if (parsed.due_at) setDueAt(parsed.due_at);
              if (parsed.reminder_at) setReminderAt(parsed.reminder_at);
            })
          }
          className="w-full"
        >
          🎤 Smart Voice Input
        </Button>
      </div>

      {/* DATE ROW */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Due</label>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="p-2 w-full rounded-lg bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Reminder</label>
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
            className="p-2 w-full rounded-lg bg-white/5 border border-white/10 text-white"
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="space-y-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="📝 Notes..."
          className="p-3 w-full rounded-xl bg-white/5 border border-white/10 text-white min-h-[90px]"
        />

        <div className="flex gap-2">
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
      </div>

      {/* BRAIN DUMP */}
      <div className="space-y-2">
        <textarea
          value={brainDump}
          onChange={(e) => setBrainDump(e.target.value)}
          placeholder="🧠 Dump everything here..."
          className="p-3 w-full rounded-xl bg-white/5 border border-white/10 text-white min-h-[90px]"
        />

        <div className="flex gap-2">
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
      </div>

      {/* TOGGLE */}
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={readAloud}
          onChange={() => setReadAloud(!readAloud)}
        />
        🔊 Read reminder aloud
      </label>

      {/* SAVE */}
      <Button onClick={handleSubmit} className="w-full">
        💾 Save Task
      </Button>

    </div>
  );
}