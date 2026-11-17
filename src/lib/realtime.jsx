import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { API_URL } from "./http";
import { useAuth } from "./auth";

let socket = null;
const subscribers = new Set();

/** Subscribe to server change events: fn({ table, channel_id? }). Returns an unsubscribe function. */
export function onServerChange(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }

/**
 * Opens one Socket.IO connection to the backend and invalidates the matching
 * React Query caches whenever data changes, so a change made on mobile shows
 * up on the web within a second without a refresh.
 */
export function RealtimeSync() {
  const qc = useQueryClient();
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.token) return;
    socket = io(API_URL, { auth: { token: session.token }, transports: ["websocket", "polling"], reconnectionDelayMax: 10_000 });
    socket.on("change", (p) => {
      const table = p?.table;
      if (!table) return;
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["module_counts"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      if (table === "chat_messages" || table === "chat_channels") qc.invalidateQueries({ queryKey: ["chat_channels"] });
      if (table === "profiles" || table === "departments") { qc.invalidateQueries({ queryKey: ["employee_performance"] }); qc.invalidateQueries({ queryKey: ["departments"] }); }
      if (table === "integrations") qc.invalidateQueries({ queryKey: ["integration_events"] });
      subscribers.forEach((fn) => fn(p));
    });
    // after a reconnect, refresh everything that may have changed meanwhile
    socket.io.on("reconnect", () => qc.invalidateQueries());
    return () => { socket?.close(); socket = null; };
  }, [session?.token, qc]);

  return null;
}
