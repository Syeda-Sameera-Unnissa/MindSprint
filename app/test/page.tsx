"use client";

import { useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useNotification } from "@/hooks/useNotification";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function TestPage() {
  useAuthGuard();
  const [text, setText] = useState("");

  const { startListening, speak, isListening } = useVoice();
  const { requestPermission, sendNotification } = useNotification();

  return (
    <div className="p-10">
      <h1 className="text-xl mb-4">Test Voice + Notifications</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 mb-4 w-full"
        placeholder="Your text"
      />

      <button
        onClick={() => startListening(setText)}
        className="bg-blue-500 text-white p-2 mr-2"
      >
        🎤 {isListening ? "Listening..." : "Speak"}
      </button>

      <button
        onClick={() => speak(text)}
        className="bg-green-500 text-white p-2 mr-2"
      >
        🔊 Speak Text
      </button>

      <button
        onClick={async () => {
          await requestPermission();
          sendNotification("MindSprint", text || "Test notification");
        }}
        className="bg-purple-500 text-white p-2"
      >
        🔔 Test Notification
      </button>
    </div>
  );
}