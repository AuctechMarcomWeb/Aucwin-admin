export const LEAD_STATUSES = [
  "prospect",
  "follow_up",
  "meeting_scheduled",
  "meeting_done",
  "sale_done",
  "dnp",
  "unreachable",
  "qualified",
  "new_lead",
  "junk",
  "rspv",
];
export const ACTIVE_LEAD_STATUSES = LEAD_STATUSES.filter(s => !["sale_done", "junk"].includes(s));
export const normalizeLeadStatus = (value) => {
  const v = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = { new: "new_lead", contacted: "follow_up", proposal: "meeting_scheduled", won: "sale_done", lost: "junk", sale: "sale_done", rsvp: "rspv", followup: "follow_up" };
  return LEAD_STATUSES.includes(aliases[v] || v) ? (aliases[v] || v) : "new_lead";
};
export const LEAD_SOURCES = [
  "website",
  "referral",
  "social_media",
  "facebook",
  "phone",
  "walk_in",
  "advertisement",
  "other",
];
export const FOLLOWUP_TYPES = [
  "call",
  "meeting",
  "reminder",
  "email",
  "whatsapp",
];
export const TASK_STATUSES = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES = ["low", "medium", "high"];
export const SERVICE_STATUSES = [
  "onboarding",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];
export const PAYMENT_STATUSES = ["pending", "paid", "overdue", "refunded"];

export const label = (s) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ---------------- 0004 modules ----------------
export const NOTE_COLORS = [
  "yellow",
  "pink",
  "blue",
  "green",
  "purple",
  "orange",
];
