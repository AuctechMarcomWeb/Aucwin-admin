// import { useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import clsx from "clsx";
// import { Plus, Trash2, Calendar, Flag } from "lucide-react";
// import { createTodo, deleteTodo, getTodos, updateTodo } from "@/lib/api";
// import { errMsg } from "@/lib/http";
// import {
//   Empty,
//   Spinner,
//   fmtDateTime,
//   isOverdue,
//   toneOf,
//   Input,
// } from "@/components/ui";
// import { ModuleHeader } from "@/components/Layout";

// const BLUE = "#2563EB";

// export default function TodoPage() {
//   const qc = useQueryClient();
//   const q = useQuery({ queryKey: ["todos"], queryFn: getTodos });
//   const [title, setTitle] = useState("");
//   const [due, setDue] = useState("");
//   const [priority, setPriority] = useState("medium");
//   const [showDone, setShowDone] = useState(false);
//   const inval = () => {
//     qc.invalidateQueries({ queryKey: ["todos"] });
//     qc.invalidateQueries({ queryKey: ["module_counts"] });
//     qc.invalidateQueries({ queryKey: ["calendar"] });
//   };
//   const add = useMutation({
//     mutationFn: () =>
//       createTodo({
//         title: title.trim(),
//         due_at: due ? new Date(due).toISOString() : null,
//         priority,
//         position: q.data?.length ?? 0,
//       }),
//     onSuccess: () => {
//       setTitle("");
//       setDue("");
//       setPriority("medium");
//       inval();
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const toggle = useMutation({
//     mutationFn: (t) => updateTodo(t.id, { done: !t.done }),
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const del = useMutation({
//     mutationFn: deleteTodo,
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const rename = useMutation({
//     mutationFn: ({ id, title }) => updateTodo(id, { title }),
//     onSuccess: inval,
//   });

//   const open = (q.data ?? []).filter((t) => !t.done);
//   const done = (q.data ?? []).filter((t) => t.done);

//   return (
//     <div className="max-w-3xl">
//       <ModuleHeader
//         moduleKey="todos"
//         title="My to-do list"
//         subtitle="Only you can see this list. Items with a date also show on your calendar."
//       />
//       <form
//         className="card mb-5 flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
//         onSubmit={(e) => {
//           e.preventDefault();
//           if (title.trim()) add.mutate();
//         }}
//       >
//         <Input
//           autoFocus
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Add something to do and press Enter…"
//           className="flex-1 border-0 bg-transparent px-2 text-[15px] focus:ring-0"
//         />
//         <div className="flex items-center gap-2">
//           <label className="relative">
//             <Calendar
//               size={16}
//               className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400"
//             />
//             <input
//               type="datetime-local"
//               value={due}
//               onChange={(e) => setDue(e.target.value)}
//               className="input w-44 py-1.5 pl-8 text-[13px]"
//             />
//           </label>
//           <div className="flex rounded-lg border border-mist-3 p-0.5">
//             {["low", "medium", "high"].map((p) => (
//               <button
//                 type="button"
//                 key={p}
//                 title={`${p} priority`}
//                 onClick={() => setPriority(p)}
//                 className={clsx(
//                   "rounded-md p-1.5",
//                   priority === p ? "bg-mist" : "",
//                 )}
//               >
//                 <Flag
//                   size={14}
//                   style={{ color: toneOf(p) }}
//                   fill={priority === p ? toneOf(p) : "none"}
//                 />
//               </button>
//             ))}
//           </div>
//           <button
//             className="btn-primary py-2"
//             style={{ background: BLUE }}
//             disabled={!title.trim() || add.isPending}
//           >
//             <Plus size={16} /> Add
//           </button>
//         </div>
//       </form>

//       {q.isLoading ? (
//         <Spinner />
//       ) : open.length === 0 && done.length === 0 ? (
//         <div className="card">
//           <Empty
//             title="Your list is empty"
//             hint="Add the first thing you want to get done today."
//           />
//         </div>
//       ) : (
//         <>
//           <ul className="card divide-y divide-mist">
//             {open.length === 0 && (
//               <li className="px-5 py-6 text-center text-sm text-slate-500">
//                 All done for now 🎉
//               </li>
//             )}
//             {open.map((t) => (
//               <Row
//                 key={t.id}
//                 t={t}
//                 onToggle={() => toggle.mutate(t)}
//                 onDelete={() => del.mutate(t.id)}
//                 onRename={(title) => rename.mutate({ id: t.id, title })}
//               />
//             ))}
//           </ul>
//           {done.length > 0 && (
//             <div className="mt-4">
//               <button
//                 className="text-sm font-semibold text-slate-500 hover:text-ink"
//                 onClick={() => setShowDone(!showDone)}
//               >
//                 {showDone ? "Hide" : "Show"} {done.length} completed
//               </button>
//               {showDone && (
//                 <ul className="card mt-2 divide-y divide-mist opacity-70">
//                   {done.map((t) => (
//                     <Row
//                       key={t.id}
//                       t={t}
//                       onToggle={() => toggle.mutate(t)}
//                       onDelete={() => del.mutate(t.id)}
//                       onRename={(title) => rename.mutate({ id: t.id, title })}
//                     />
//                   ))}
//                 </ul>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// function Row({ t, onToggle, onDelete, onRename }) {
//   const [editing, setEditing] = useState(false);
//   const [v, setV] = useState(t.title);
//   const late = !t.done && isOverdue(t.due_at);
//   return (
//     <li className="group flex items-center gap-3 px-4 py-3">
//       <button
//         onClick={onToggle}
//         aria-label={t.done ? "Mark not done" : "Mark done"}
//         className={clsx(
//           "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
//           t.done
//             ? "border-blue-600 bg-blue-600"
//             : "border-slate-300 hover:border-blue-500",
//         )}
//       >
//         {t.done && (
//           <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
//             <path
//               d="M2 6l3 3 5-6"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         )}
//       </button>
//       {editing ? (
//         <input
//           autoFocus
//           value={v}
//           onChange={(e) => setV(e.target.value)}
//           onBlur={() => {
//             setEditing(false);
//             if (v.trim() && v !== t.title) onRename(v.trim());
//           }}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") e.target.blur();
//             if (e.key === "Escape") {
//               setV(t.title);
//               setEditing(false);
//             }
//           }}
//           className="flex-1 rounded-md border border-blue-300 px-2 py-0.5 text-sm outline-none"
//         />
//       ) : (
//         <button
//           onClick={() => setEditing(true)}
//           className={clsx(
//             "flex-1 text-left text-sm",
//             t.done ? "text-slate-400 line-through" : "text-ink",
//           )}
//         >
//           {t.title}
//         </button>
//       )}
//       <Flag
//         size={13}
//         style={{ color: toneOf(t.priority) }}
//         fill={t.priority === "high" ? toneOf(t.priority) : "none"}
//       />
//       {t.due_at && (
//         <span
//           className={clsx(
//             "text-[12px] num",
//             late ? "font-semibold text-amber-600" : "text-slate-400",
//           )}
//         >
//           {fmtDateTime(t.due_at)}
//         </span>
//       )}
//       <button
//         onClick={onDelete}
//         className="rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-mist hover:text-amber-600 group-hover:opacity-100"
//         aria-label="Delete"
//       >
//         <Trash2 size={14} />
//       </button>
//     </li>
//   );
// }
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flag,
  ListTodo,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { createTodo, deleteTodo, getTodos, updateTodo } from "@/lib/api";
import { errMsg } from "@/lib/http";
import { Spinner, fmtDateTime, isOverdue } from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";

const PRIORITY = {
  high: { label: "High", fg: "#C2410C", bg: "#FFEDD5" },
  medium: { label: "Medium", fg: "#B7791F", bg: "#FEF3C7" },
  low: { label: "Low", fg: "#64748B", bg: "#EEF2F6" },
};
const pad = (n) => String(n).padStart(2, "0");
/** value for <input type="datetime-local"> */
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const at = (daysFromToday, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const isToday = (iso) =>
  !!iso && new Date(iso).toDateString() === new Date().toDateString();
const dueText = (iso) => {
  const d = new Date(iso);
  const t = fmtDateTime(iso).split("· ")[1];
  if (isToday(iso)) return `Today, ${t}`;
  const tm = new Date();
  tm.setDate(tm.getDate() + 1);
  if (d.toDateString() === tm.toDateString()) return `Tomorrow, ${t}`;
  return fmtDateTime(iso);
};

export default function TodoPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["todos"], queryFn: getTodos });
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("open");
  const dateRef = useRef(null);
  const titleRef = useRef(null);
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["todos"] });
    qc.invalidateQueries({ queryKey: ["module_counts"] });
    qc.invalidateQueries({ queryKey: ["calendar"] });
  };
  const add = useMutation({
    mutationFn: () =>
      createTodo({
        title: title.trim(),
        due_at: due ? new Date(due).toISOString() : null,
        priority,
        position: q.data?.length ?? 0,
      }),
    onSuccess: () => {
      setTitle("");
      setDue("");
      setPriority("medium");
      inval();
      titleRef.current?.focus();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const toggle = useMutation({
    mutationFn: (t) => updateTodo(t.id, { done: !t.done }),
    onSuccess: (_d, t) => {
      inval();
      if (!t.done) toast.success("Nice — done!");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: deleteTodo,
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const patch = useMutation({
    mutationFn: ({ id, p }) => updateTodo(id, p),
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const clearDone = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) await deleteTodo(id);
    },
    onSuccess: () => {
      inval();
      toast.success("Completed items cleared");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const all = q.data ?? [];
  const open = all.filter((t) => !t.done);
  const done = all.filter((t) => t.done);
  const overdue = open.filter((t) => isOverdue(t.due_at));
  const today = open.filter((t) => isToday(t.due_at) && !isOverdue(t.due_at));
  const later = open
    .filter((t) => t.due_at && !isToday(t.due_at) && !isOverdue(t.due_at))
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
  const noDate = open.filter((t) => !t.due_at);
  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;

  const FILTERS = [
    { key: "open", label: "To do", n: open.length },
    { key: "today", label: "Today", n: today.length + overdue.length },
    { key: "overdue", label: "Overdue", n: overdue.length },
    { key: "done", label: "Completed", n: done.length },
  ];
  const sections = useMemo(() => {
    if (filter === "done") return [["Completed", done, "done"]];
    if (filter === "overdue") return [["Overdue", overdue, "late"]];
    if (filter === "today")
      return [
        ["Overdue", overdue, "late"],
        ["Today", today, "today"],
      ];
    return [
      ["Overdue", overdue, "late"],
      ["Today", today, "today"],
      ["Coming up", later, "later"],
      ["No date", noDate, "none"],
    ];
  }, [filter, done, overdue, today, later, noDate]);
  const shownCount = sections.reduce((a, [, l]) => a + l.length, 0);

  const quick = [
    {
      label: "Today",
      d: () => at(0, Math.min(Math.max(new Date().getHours() + 1, 18), 23)),
    },
    { label: "Tomorrow", d: () => at(1, 10) },
    { label: "Next week", d: () => at(7, 10) },
  ];

  return (
    <div>
      <ModuleHeader
        moduleKey="todos"
        title="My to-do list"
        subtitle="Only you can see this list. Items with a date also show on your calendar."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {/* ---------- add ---------- */}
          <form
            className="card mb-5 p-3 transition-shadow focus-within:shadow-lift"
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim() && !add.isPending) add.mutate();
            }}
          >
            <div className="flex items-center gap-3 px-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
                <Plus size={19} />
              </span>
              <input
                ref={titleRef}
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do? Press Enter to add"
                maxLength={200}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
              />
              <button
                className="btn-primary shrink-0 px-4 py-2"
                disabled={!title.trim() || add.isPending}
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-mist pt-3">
              <span className="flex items-center gap-1 px-1 text-[12px] font-semibold text-slate-500">
                <CalendarDays size={14} /> Due
              </span>
              {due ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#DBEAFE] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#1D4ED8]">
                  {dueText(new Date(due).toISOString())}
                  <button
                    type="button"
                    onClick={() => setDue("")}
                    aria-label="Remove due date"
                    className="rounded p-0.5 hover:bg-white/60"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : (
                quick.map((qd) => (
                  <button
                    type="button"
                    key={qd.label}
                    onClick={() => setDue(toLocalInput(qd.d()))}
                    className="rounded-lg border border-mist-3 px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                  >
                    {qd.label}
                  </button>
                ))
              )}
              <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-mist-3 px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-600 hover:border-slate-300">
                <Clock size={13} /> Pick date & time
                <input
                  ref={dateRef}
                  type="datetime-local"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Pick a due date and time"
                />
              </label>
              <span className="mx-1 hidden h-5 w-px bg-mist-2 sm:block" />
              <span className="flex items-center gap-1 px-1 text-[12px] font-semibold text-slate-500">
                <Flag size={14} /> Priority
              </span>
              <div className="flex gap-1">
                {["low", "medium", "high"].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={clsx(
                      "rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold transition",
                      priority === p
                        ? "ring-1 ring-current"
                        : "opacity-60 hover:opacity-100",
                    )}
                    style={{
                      background: PRIORITY[p].bg,
                      color: PRIORITY[p].fg,
                    }}
                    aria-pressed={priority === p}
                  >
                    {PRIORITY[p].label}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* ---------- filters ---------- */}
          <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-mist-2 p-1 sm:w-fit">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={clsx(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition",
                  filter === f.key
                    ? "bg-white text-ink shadow-card"
                    : "text-slate-600 hover:text-ink",
                )}
              >
                {f.label}
                <span
                  className={clsx(
                    "rounded-full px-1.5 text-[11px] font-bold num",
                    f.key === "overdue" && f.n
                      ? "bg-amber-600 text-white"
                      : "bg-white/70 text-slate-500",
                  )}
                >
                  {f.n}
                </span>
              </button>
            ))}
          </div>

          {/* ---------- list ---------- */}
          {q.isLoading ? (
            <Spinner />
          ) : shownCount === 0 ? (
            <div className="card flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
                {filter === "done" || !all.length ? (
                  <ListTodo size={26} />
                ) : (
                  <Sparkles size={26} />
                )}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">
                {!all.length
                  ? "Your list is empty"
                  : filter === "done"
                    ? "Nothing completed yet"
                    : filter === "overdue"
                      ? "Nothing overdue 🎉"
                      : "All done for now 🎉"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {!all.length || filter !== "done"
                  ? "Type above to add the next thing you want to get done."
                  : "Tick items off as you finish them."}
              </p>
            </div>
          ) : (
            sections
              .filter(([, list]) => list.length)
              .map(([name, list, kind]) => (
                <section key={name} className="mb-5">
                  <h2
                    className={clsx(
                      "mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.1em]",
                      kind === "late" ? "text-amber-700" : "text-slate-500",
                    )}
                  >
                    {kind === "late" && <AlertTriangle size={13} />}
                    {name}
                    <span className="font-semibold normal-case tracking-normal text-slate-400">
                      · {list.length}
                    </span>
                  </h2>
                  <ul className="card divide-y divide-mist overflow-hidden">
                    {list.map((t) => (
                      <Row
                        key={t.id}
                        t={t}
                        onToggle={() => toggle.mutate(t)}
                        onDelete={() => del.mutate(t.id)}
                        onRename={(v) =>
                          patch.mutate({ id: t.id, p: { title: v } })
                        }
                        onPriority={(p) =>
                          patch.mutate({ id: t.id, p: { priority: p } })
                        }
                      />
                    ))}
                  </ul>
                </section>
              ))
          )}
        </div>

        {/* ---------- progress ---------- */}
        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-[13px] font-bold uppercase tracking-[.1em] text-slate-500">
              Your progress
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#E4E9F0"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#12ACA2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-ink num">
                  {pct}%
                </span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-ink num">
                  {done.length}
                  <span className="text-base font-semibold text-slate-400">
                    {" "}
                    / {all.length}
                  </span>
                </p>
                <p className="text-sm text-slate-500">items completed</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                {
                  n: today.length,
                  label: "Today",
                  c: "text-teal-700 bg-teal-50",
                },
                {
                  n: overdue.length,
                  label: "Overdue",
                  c: "text-amber-700 bg-amber-50",
                },
                {
                  n: open.length,
                  label: "Left",
                  c: "text-[#1D4ED8] bg-[#EFF6FF]",
                },
              ].map((s) => (
                <div key={s.label} className={clsx("rounded-xl py-2.5", s.c)}>
                  <p className="text-lg font-extrabold num">{s.n}</p>
                  <p className="text-[11.5px] font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
            {done.length > 0 && (
              <button
                className="btn-secondary mt-4 w-full"
                disabled={clearDone.isPending}
                onClick={() => clearDone.mutate(done.map((t) => t.id))}
              >
                <CheckCircle2 size={15} /> Clear {done.length} completed
              </button>
            )}
          </div>
          <div className="card p-5 text-[13px] leading-relaxed text-slate-600">
            <p className="mb-2 font-bold text-ink">Tips</p>
            <ul className="space-y-1.5">
              <li>• Click a task's text to rename it.</li>
              <li>• Click the priority tag to change it.</li>
              <li>• Tasks with a date also appear on your calendar.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

const NEXT = { low: "medium", medium: "high", high: "low" };

function Row({ t, onToggle, onDelete, onRename, onPriority }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(t.title);
  const late = !t.done && isOverdue(t.due_at);
  const pr = PRIORITY[t.priority] ?? PRIORITY.medium;
  return (
    <li
      className={clsx(
        "group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70",
        t.done && "bg-slate-50/50",
      )}
    >
      <button
        onClick={onToggle}
        aria-label={t.done ? "Mark not done" : "Mark done"}
        className={clsx(
          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all",
          t.done
            ? "border-teal-600 bg-teal-600"
            : "border-slate-300 hover:border-teal-500 hover:bg-teal-50",
        )}
      >
        {t.done && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
            <path
              d="M2 6l3 3 5-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={v}
            maxLength={200}
            onChange={(e) => setV(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (v.trim() && v !== t.title) onRename(v.trim());
              else setV(t.title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
              if (e.key === "Escape") {
                setV(t.title);
                setEditing(false);
              }
            }}
            className="w-full rounded-lg border border-teal-400 px-2 py-1 text-[14.5px] outline-none ring-4 ring-teal-500/15"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to rename"
            className={clsx(
              "block w-full truncate text-left text-[14.5px] font-medium",
              t.done ? "text-slate-400 line-through" : "text-ink",
            )}
          >
            {t.title}
          </button>
        )}
        {t.due_at && (
          <span
            className={clsx(
              "mt-0.5 inline-flex items-center gap-1 text-[12px] num",
              late ? "font-semibold text-amber-700" : "text-slate-500",
            )}
          >
            {late ? <AlertTriangle size={12} /> : <CalendarDays size={12} />}
            {late ? `Overdue · ${dueText(t.due_at)}` : dueText(t.due_at)}
          </span>
        )}
      </div>
      <button
        onClick={() => !t.done && onPriority(NEXT[t.priority] ?? "medium")}
        title={t.done ? pr.label : "Click to change priority"}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-bold"
        style={{ background: pr.bg, color: pr.fg }}
      >
        <Flag size={11} fill={t.priority === "high" ? pr.fg : "none"} />{" "}
        {pr.label}
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-amber-50 hover:text-amber-700 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}