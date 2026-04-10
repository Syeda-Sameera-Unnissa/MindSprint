"use client";

import { useState } from "react";

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);

  // 🎤 START LISTENING
  const startListening = (onResult: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // 🔊 SPEAK
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // 🧠 NORMALIZE SPEECH TEXT (fix p.m. / a.m.)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/p\.m\./g, "pm")
      .replace(/a\.m\./g, "am")
      .replace(/\s+/g, " ")
      .trim();
  };

  // 🧠 FORMAT LOCAL TIME (NO UTC — FINAL FIX)
  const formatLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // 🧠 TIME PARSER
  const parseTime = (input: string) => {
    const match = input.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)/);

    if (!match) return null;

    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const period = match[3];

    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    return { hour, minute };
  };

  // 🧠 MAIN PARSER (FINAL)
  const parseCommand = (rawText: string) => {
    const text = normalizeText(rawText);
    const result: any = {};

    let baseDate = new Date();

    // 📅 DATE HANDLING
    if (text.includes("tomorrow")) {
      baseDate.setDate(baseDate.getDate() + 1);
    }

    if (text.includes("today")) {
      baseDate = new Date();
    }

    // ⏰ REMINDER
    if (text.includes("reminder")) {
      const reminderPart = text.split("reminder")[1];
      const time = parseTime(reminderPart);

      if (time) {
        const d = new Date(baseDate);
        d.setHours(time.hour, time.minute, 0);
        result.reminder_at = formatLocal(d);
      }
    }

    // ⏰ DUE
    if (text.includes("due")) {
      const duePart = text.split("due")[1];
      const time = parseTime(duePart);

      if (time) {
        const d = new Date(baseDate);
        d.setHours(time.hour, time.minute, 0);
        result.due_at = formatLocal(d);
      }
    }

    // 🔁 fallback (if only one time mentioned)
    if (!result.due_at) {
      const time = parseTime(text);
      if (time) {
        const d = new Date(baseDate);
        d.setHours(time.hour, time.minute, 0);
        result.due_at = formatLocal(d);
      }
    }

    // 📝 NOTES
    if (text.includes("notes")) {
      result.notes = rawText
        .split(/notes/i)[1]
        ?.split(/brain/i)[0]
        ?.replace(/and$/i, "")
        ?.trim();
    }

    // 🧠 BRAIN DUMP
    if (text.includes("brain")) {
      result.brain_dump = rawText.split(/brain/i)[1]?.trim();
    }

    // 🎯 CLEAN TITLE
    let cleanTitle = text;

    cleanTitle = cleanTitle.replace(/due.*?/g, "");
    cleanTitle = cleanTitle.replace(/reminder.*?/g, "");
    cleanTitle = cleanTitle.replace(/notes.*?/g, "");
    cleanTitle = cleanTitle.replace(/brain.*?/g, "");
    cleanTitle = cleanTitle.replace(/tomorrow|today/g, "");
    cleanTitle = cleanTitle.replace(/\d{1,2}(:\d{2})?\s?(am|pm)/g, "");
    cleanTitle = cleanTitle.replace(/create|add|set/g, "");
    cleanTitle = cleanTitle.replace(/\band\b/g, "");
    cleanTitle = cleanTitle.replace(/\s+/g, " ");

    result.title = cleanTitle.trim();

    return result;
  };

  return {
    startListening,
    speak,
    isListening,
    parseCommand,
  };
};