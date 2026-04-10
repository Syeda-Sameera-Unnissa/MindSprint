"use client";

export const useReminder = () => {
  const scheduleReminder = (
    time: string,
    message: string,
    speak: (text: string) => void,
    notify: (title: string, body: string) => void
  ) => {
    const now = new Date().getTime();
    const reminderTime = new Date(time).getTime();

    const delay = reminderTime - now;

    if (delay <= 0) return;

    setTimeout(() => {
      notify("MindSprint Reminder", message);
      speak(`Reminder: ${message}`);
    }, delay);
  };

  return { scheduleReminder };
};