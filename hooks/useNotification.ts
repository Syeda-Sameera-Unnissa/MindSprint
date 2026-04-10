"use client";

export const useNotification = () => {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    return permission;
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  return { requestPermission, sendNotification };
};