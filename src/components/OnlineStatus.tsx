"use client";
// src/components/OnlineStatus.tsx
import { useState, useEffect } from "react";

export function OnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    // Register SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
        online ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-500" : "bg-orange-500"}`}
      />
      <span>{online ? "متصل" : "بدون إنترنت"}</span>
    </div>
  );
}
