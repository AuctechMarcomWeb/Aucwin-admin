import { useEffect, useState } from "react";
import clsx from "clsx";
import { X, Loader2, Inbox, Eye, EyeOff } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { label as humanize } from "@/lib/types";

// ---------- Form fields ----------
export function Field({ label, children, hint, className }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
export function Input(props) {
  return <input {...props} className={clsx("input", props.className)} />;
}
/** Password field with an eye button to show / hide what you type. */
export function PasswordInput({ className, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={clsx("input pr-11", className)} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
/** Rates a password 0-4 and lists what is missing. */
export function passwordScore(pw = "") {
  const checks = [
    { ok: pw.length >= 8, text: "At least 8 characters" },
    { ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw), text: "Upper and lower case letters" },
    { ok: /\d/.test(pw), text: "A number" },
    { ok: /[^A-Za-z0-9]/.test(pw), text: "A symbol (e.g. ! @ # $)" },
  ];
  let score = checks.filter((c) => c.ok).length;
  if (pw.length >= 12 && score >= 3) score = 4;
  if (pw.length < 8) score = Math.min(score, 1);
  return { score, checks };
}
const STRENGTH = [
  { word: "Too weak", bar: "bg-amber-600", text: "text-amber-700" },
  { word: "Weak", bar: "bg-amber-600", text: "text-amber-700" },
  { word: "Fair", bar: "bg-[#D97706]", text: "text-[#B45309]" },
  { word: "Good", bar: "bg-teal-500", text: "text-teal-700" },
  { word: "Strong", bar: "bg-moss-600", text: "text-moss-700" },
];
/** Coloured bar + checklist shown under a new-password field. */
export function PasswordStrength({ value }) {
  if (!value) return null;
  const { score, checks } = passwordScore(value);
  const s = STRENGTH[score];
  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={clsx("h-1.5 flex-1 rounded-full transition-colors", i < Math.max(score, 1) ? s.bar : "bg-mist-2")} />
          ))}
        </div>
        <span className={clsx("w-16 text-right text-xs font-semibold", s.text)}>{s.word}</span>
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.text} className={clsx("flex items-center gap-1.5 text-xs", c.ok ? "text-moss-700" : "text-slate-400")}>
            <span className={clsx("flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold", c.ok ? "bg-moss-600 text-white" : "border border-slate-300")}>
              {c.ok ? "✓" : ""}
            </span>
            {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Textarea(props) {
  return (
    <textarea rows={3} {...props} className={clsx("input", props.className)} />
  );
}
export function Select({ options, placeholder, ...props }) {
  return (
    <select {...props} className={clsx("input", props.className)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
export const enumOptions = (values) =>
  values.map((v) => ({ value: v, label: humanize(v) }));

// ---------- Modal ----------
export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className={clsx(
          "max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-pop sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  busy,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}Delete
        </button>
      </div>
    </Modal>
  );
}

// ---------- Status (dot + word) ----------
const TONES = {
  prospect: "#1E8F99",
  follow_up: "#6B4A9E",
  meeting_scheduled: "#2563EB",
  meeting_done: "#0D9488",
  sale_done: "#2F7D4A",
  dnp: "#D97706",
  unreachable: "#64748B",
  new_lead: "#1E8F99",
  junk: "#94A3B8",
  rspv: "#7C3AED",
  new: "#1E8F99",
  contacted: "#6B4A9E",
  qualified: "#B7791F",
  proposal: "#C2410C",
  won: "#2F7D4A",
  lost: "#94A3B8",
  pending: "#B7791F",
  done: "#2F7D4A",
  cancelled: "#94A3B8",
  todo: "#64748B",
  in_progress: "#1E8F99",
  onboarding: "#6B4A9E",
  on_hold: "#B7791F",
  completed: "#2F7D4A",
  paid: "#2F7D4A",
  overdue: "#C2410C",
  refunded: "#94A3B8",
  low: "#94A3B8",
  medium: "#B7791F",
  high: "#C2410C",
  super_admin: "#0B1D33",
  admin: "#6B4A9E",
  employee: "#64748B",
  call: "#DB2777",
  meeting: "#EA580C",
  reminder: "#D97706",
  email: "#64748B",
  whatsapp: "#2F7D4A",
  draft: "#94A3B8",
  sent: "#0284C7",
};
export const toneOf = (v) => TONES[v] ?? "#64748B";
export function Badge({ value, className, solid }) {
  const tone = toneOf(value);
  if (solid)
    return (
      <span
        className={clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
          className,
        )}
        style={{ background: tone }}
      >
        {humanize(value)}
      </span>
    );
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-slate-700",
        className,
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: tone }}
      />
      {humanize(value)}
    </span>
  );
}

// ---------- Misc ----------
export function Spinner({ className }) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center py-12 text-teal-600",
        className,
      )}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
}
export function Empty({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 rounded-full bg-mist p-3 text-slate-400">
        <Inbox size={22} />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-slate-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
export function Avatar({ name, size = 32 }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = [
    "#0E7C86",
    "#16304F",
    "#6B4A9E",
    "#2F7D4A",
    "#B7791F",
    "#2A4466",
  ];
  const bg =
    palette[
      [...(name ?? "")].reduce((a, c) => a + c.charCodeAt(0), 0) %
        palette.length
    ];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.round(size * 0.36),
      }}
    >
      {initials}
    </div>
  );
}
export const money = (n, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(n ?? 0));
export const fmtDate = (d) => (d ? format(new Date(d), "MMM d, yyyy") : "—");
export const fmtDateTime = (d) =>
  d ? format(new Date(d), "MMM d, yyyy · h:mm a") : "—";
export const fmtRelative = (d) =>
  d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : "—";
export const isOverdue = (d) => !!d && isPast(new Date(d));
/** datetime-local input value from ISO (local time) */
export const toLocalInput = (iso) => {
  const d = iso ? new Date(iso) : new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);
