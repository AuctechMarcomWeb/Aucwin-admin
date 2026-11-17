// // import { useQuery } from "@tanstack/react-query";
// // import { Link } from "react-router-dom";
// // import { ArrowRight, Plus } from "lucide-react";
// // import { getCalendarEvents, getModuleCounts } from "@/lib/api";
// // import { useAuth } from "@/lib/auth";
// // import { MODULES } from "@/lib/modules";
// // import { fmtDateTime, Badge } from "@/components/ui";

// // const KIND_LABEL = {
// //   meeting: "Meeting",
// //   reminder: "Reminder",
// //   followup: "Follow-up",
// //   task: "Task",
// //   todo: "To-do",
// // };

// // export default function HomePage() {
// //   const { profile, isSuperAdmin } = useAuth();
// //   const counts = useQuery({
// //     queryKey: ["module_counts"],
// //     queryFn: getModuleCounts,
// //   });
// //   const start = new Date();
// //   start.setHours(0, 0, 0, 0);
// //   const end = new Date(start);
// //   end.setDate(end.getDate() + 1);
// //   const today = useQuery({
// //     queryKey: ["calendar", "today"],
// //     queryFn: () => getCalendarEvents(start, end),
// //   });
// //   const c = counts.data ?? {};
// //   const modules = MODULES.filter((m) => !m.superOnly || isSuperAdmin);
// //   const countText = (m) => {
// //     if (!m.countKey || counts.isLoading) return "";
// //     const n = c[m.countKey] ?? 0;
// //     return {
// //       leads: `${n} open`,
// //       tasks: `${n} open`,
// //       reminders: `${n} pending`,
// //       meetings: `${n} upcoming`,
// //       todos: `${n} to do`,
// //       notes: `${n} notes`,
// //       chat: n ? `${n} unread` : "all read",
// //       calendar: `${n} today`,
// //       clients: `${n} active`,
// //     }[m.countKey];
// //   };

// //   return (
// //     <div>
// //       <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
// //         <div>
// //           <p className="text-sm font-medium text-slate-500">
// //             {new Date().toLocaleDateString("en-CA", {
// //               weekday: "long",
// //               day: "numeric",
// //               month: "long",
// //             })}
// //           </p>
// //           <h1 className="mt-1 text-[30px] font-bold tracking-tight text-ink">
// //             {greeting()}, {profile?.full_name.split(" ")[0]}
// //           </h1>
// //           <p className="mt-1 text-sm text-slate-500">
// //             {c.followups_overdue ? (
// //               <span className="font-semibold text-amber-600">
// //                 {c.followups_overdue} overdue follow-up
// //                 {c.followups_overdue === 1 ? "" : "s"} ·{" "}
// //               </span>
// //             ) : null}
// //             {today.data?.length
// //               ? `${today.data.length} thing${today.data.length === 1 ? "" : "s"} on today's calendar`
// //               : "Nothing on today's calendar"}
// //           </p>
// //         </div>
// //         <div className="flex gap-2">
// //           {/* on wide screens "New lead" is in the top bar */}
// //           <Link to="/leads?new=1" className="btn-primary sm:hidden">
// //             <Plus size={16} /> New lead
// //           </Link>
// //           <Link to="/overview" className="btn-secondary">
// //             Overview <ArrowRight size={15} />
// //           </Link>
// //         </div>
// //       </div>

// //       {/* Module grid — the home screen */}
// //       <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
// //         {modules.map((m) => (
// //           <Link
// //             key={m.key}
// //             to={m.to}
// //             className="group relative overflow-hidden rounded-2xl border border-mist-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-pop sm:p-5"
// //             style={{ borderColor: m.bg }}
// //           >
// //             <div
// //               className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 transition-transform group-hover:scale-125"
// //               style={{ background: m.bg }}
// //             />
// //             <div className="relative">
// //               <span
// //                 className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
// //                 style={{ background: m.bg, color: m.color }}
// //               >
// //                 <m.icon size={26} strokeWidth={2.2} />
// //               </span>
// //               <h2 className="mt-4 text-[15px] font-bold leading-tight text-ink">
// //                 {m.label}
// //               </h2>
// //               <p className="mt-1 hidden text-[13px] leading-snug text-slate-500 sm:block">
// //                 {m.blurb}
// //               </p>
// //               <p
// //                 className="mt-3 text-[13px] font-semibold num"
// //                 style={{ color: m.color }}
// //               >
// //                 {countText(m) || (m.superOnly ? "Set up" : "")}
// //               </p>
// //             </div>
// //           </Link>
// //         ))}
// //       </div>

// //       {/* Today */}
// //       <section className="mt-8">
// //         <div className="mb-3 flex items-center justify-between">
// //           <h2 className="text-[17px] font-bold text-ink">Today</h2>
// //           <Link
// //             to="/calendar"
// //             className="text-sm font-semibold text-sky-600 hover:underline"
// //           >
// //             Open calendar
// //           </Link>
// //         </div>
// //         {today.isLoading ? null : !today.data?.length ? (
// //           <div className="rounded-2xl border border-dashed border-mist-3 p-8 text-center text-sm text-slate-500">
// //             A clear day. Schedule a meeting or reminder from any lead, or add a
// //             to-do.
// //           </div>
// //         ) : (
// //           <ul className="grid gap-2 md:grid-cols-2">
// //             {today.data.map((e) => (
// //               <li
// //                 key={e.kind + e.id}
// //                 className="flex items-center gap-3 rounded-xl border border-mist-2 bg-white px-4 py-3"
// //               >
// //                 <span className="w-16 shrink-0 text-[13px] font-semibold text-ink num">
// //                   {fmtDateTime(e.starts_at).split("· ")[1]}
// //                 </span>
// //                 <span
// //                   className="rounded-md px-2 py-0.5 text-[11px] font-bold"
// //                   style={kindStyle(e.kind)}
// //                 >
// //                   {KIND_LABEL[e.kind]}
// //                 </span>
// //                 <Link
// //                   to={linkFor(e)}
// //                   className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:underline"
// //                 >
// //                   {e.title}
// //                 </Link>
// //                 <Badge value={e.status} />
// //               </li>
// //             ))}
// //           </ul>
// //         )}
// //       </section>
// //     </div>
// //   );
// // }

// // export function kindStyle(kind) {
// //   const m = {
// //     meeting: ["#FFEDD5", "#EA580C"],
// //     reminder: ["#FEF3C7", "#D97706"],
// //     followup: ["#FCE7F3", "#DB2777"],
// //     task: ["#EDE9FE", "#7C3AED"],
// //     todo: ["#DBEAFE", "#2563EB"],
// //   };
// //   const [bg, color] = m[kind] ?? ["#EEF2F6", "#475569"];
// //   return { background: bg, color };
// // }
// // export function linkFor(e) {
// //   if (e.kind === "todo") return "/todo";
// //   if (e.kind === "task") return "/tasks";
// //   if (e.kind === "meeting") return "/meetings";
// //   if (e.kind === "reminder") return "/reminders";
// //   return e.lead_id
// //     ? `/leads/${e.lead_id}`
// //     : e.client_id
// //       ? `/clients/${e.client_id}`
// //       : "/follow-ups";
// // }
// // function greeting() {
// //   const h = new Date().getHours();
// //   return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
// // }
// import { useQuery } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
// import clsx from "clsx";
// import {
//   AlertTriangle,
//   ArrowRight,
//   CalendarDays,
//   CheckCircle2,
//   Plus,
// } from "lucide-react";
// import { getCalendarEvents, getModuleCounts } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import { MODULES } from "@/lib/modules";
// import { fmtDateTime, Badge } from "@/components/ui";

// const KIND_LABEL = {
//   meeting: "Meeting",
//   reminder: "Reminder",
//   followup: "Follow-up",
//   task: "Task",
//   todo: "To-do",
// };
// const DONE = ["done", "completed", "cancelled"];

// export default function HomePage() {
//   const { profile, isSuperAdmin } = useAuth();
//   const counts = useQuery({
//     queryKey: ["module_counts"],
//     queryFn: getModuleCounts,
//   });
//   const start = new Date();
//   start.setHours(0, 0, 0, 0);
//   const end = new Date(start);
//   end.setDate(end.getDate() + 1);
//   const today = useQuery({
//     queryKey: ["calendar", "today"],
//     queryFn: () => getCalendarEvents(start, end),
//   });
//   const c = counts.data ?? {};
//   const modules = MODULES.filter((m) => !m.superOnly || isSuperAdmin);
//   const countText = (m) => {
//     if (!m.countKey || counts.isLoading) return "";
//     const n = c[m.countKey] ?? 0;
//     return {
//       leads: `${n} open`,
//       tasks: `${n} open`,
//       reminders: `${n} pending`,
//       meetings: `${n} upcoming`,
//       todos: `${n} to do`,
//       notes: `${n} notes`,
//       chat: n ? `${n} unread` : "all read",
//       calendar: `${n} today`,
//       clients: `${n} active`,
//     }[m.countKey];
//   };
//   const events = today.data ?? [];
//   const now = new Date();

//   return (
//     <div>
//       <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-500">
//             {new Date().toLocaleDateString("en-CA", {
//               weekday: "long",
//               day: "numeric",
//               month: "long",
//             })}
//           </p>
//           <h1 className="mt-1 text-[30px] font-bold tracking-tight text-ink">
//             {greeting()}, {profile?.full_name?.split(" ")[0]}
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             {c.followups_overdue ? (
//               <span className="font-semibold text-amber-600">
//                 {c.followups_overdue} overdue follow-up
//                 {c.followups_overdue === 1 ? "" : "s"} ·{" "}
//               </span>
//             ) : null}
//             {events.length
//               ? `${events.length} thing${events.length === 1 ? "" : "s"} on today's calendar`
//               : "Nothing on today's calendar"}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           {/* on wide screens "New lead" is in the top bar */}
//           <Link to="/leads?new=1" className="btn-primary sm:hidden">
//             <Plus size={16} /> New lead
//           </Link>
//           <Link to="/overview" className="btn-secondary">
//             Overview <ArrowRight size={15} />
//           </Link>
//         </div>
//       </div>

//       {/* Module grid — the home screen */}
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
//         {modules.map((m) => (
//           <Link
//             key={m.key}
//             to={m.to}
//             className="group relative overflow-hidden rounded-2xl border border-mist-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-pop sm:p-5"
//             style={{ borderColor: m.bg }}
//           >
//             <div
//               className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 transition-transform group-hover:scale-125"
//               style={{ background: m.bg }}
//             />
//             <div className="relative">
//               <span
//                 className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
//                 style={{ background: m.bg, color: m.color }}
//               >
//                 <m.icon size={26} strokeWidth={2.2} />
//               </span>
//               <h2 className="mt-4 text-[15px] font-bold leading-tight text-ink">
//                 {m.label}
//               </h2>
//               <p className="mt-1 hidden text-[13px] leading-snug text-slate-500 sm:block">
//                 {m.blurb}
//               </p>
//               <p
//                 className="mt-3 text-[13px] font-semibold num"
//                 style={{ color: m.color }}
//               >
//                 {countText(m) || (m.superOnly ? "Set up" : "")}
//               </p>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Today */}
//       <section className="mt-8">
//         <div className="mb-3 flex items-center justify-between">
//           <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
//             <CalendarDays size={18} className="text-sky-600" /> Today
//             {events.length > 0 && (
//               <span className="rounded-full bg-mist-2 px-2 py-0.5 text-[12px] font-bold text-slate-500 num">
//                 {events.length}
//               </span>
//             )}
//           </h2>
//           <Link
//             to="/calendar"
//             className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:underline"
//           >
//             Open calendar <ArrowRight size={14} />
//           </Link>
//         </div>
//         {today.isLoading ? null : !events.length ? (
//           <div className="flex flex-col items-center rounded-2xl border border-dashed border-mist-3 bg-white/60 p-8 text-center">
//             <CheckCircle2 size={28} className="text-teal-500" />
//             <p className="mt-2 font-bold text-ink">A clear day</p>
//             <p className="mt-0.5 text-sm text-slate-500">
//               Schedule a meeting or reminder from any lead, or add a to-do.
//             </p>
//           </div>
//         ) : (
//           <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
//             {events.map((e) => {
//               const st = kindStyle(e.kind);
//               const done = DONE.includes(e.status);
//               const late = !done && new Date(e.starts_at) < now;
//               return (
//                 <li key={e.kind + e.id}>
//                   <Link
//                     to={linkFor(e)}
//                     className="group flex items-center gap-3 rounded-2xl border border-mist-2 bg-white px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-pop"
//                     style={{ borderLeft: `4px solid ${st.color}` }}
//                   >
//                     <span
//                       className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-center"
//                       style={{ background: st.background, color: st.color }}
//                     >
//                       <span className="text-[12.5px] font-extrabold leading-tight num">
//                         {fmtDateTime(e.starts_at)
//                           .split("· ")[1]
//                           ?.replace(" ", " ")}
//                       </span>
//                     </span>
//                     <div className="min-w-0 flex-1">
//                       <p
//                         className={clsx(
//                           "truncate text-[14px] font-semibold group-hover:underline",
//                           done ? "text-slate-400 line-through" : "text-ink",
//                         )}
//                       >
//                         {e.title}
//                       </p>
//                       <p className="mt-0.5 flex items-center gap-2 text-[12px]">
//                         <span className="font-bold" style={{ color: st.color }}>
//                           {KIND_LABEL[e.kind]}
//                         </span>
//                         {late && (
//                           <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
//                             <AlertTriangle size={11} /> Missed
//                           </span>
//                         )}
//                       </p>
//                     </div>
//                     <Badge value={e.status} />
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </section>
//     </div>
//   );
// }

// export function kindStyle(kind) {
//   const m = {
//     meeting: ["#FFEDD5", "#EA580C"],
//     reminder: ["#FEF3C7", "#D97706"],
//     followup: ["#FCE7F3", "#DB2777"],
//     task: ["#EDE9FE", "#7C3AED"],
//     todo: ["#DBEAFE", "#2563EB"],
//   };
//   const [bg, color] = m[kind] ?? ["#EEF2F6", "#475569"];
//   return { background: bg, color };
// }
// export function linkFor(e) {
//   if (e.kind === "todo") return "/todo";
//   if (e.kind === "task") return "/tasks";
//   if (e.kind === "meeting") return "/meetings";
//   if (e.kind === "reminder") return "/reminders";
//   return e.lead_id
//     ? `/leads/${e.lead_id}`
//     : e.client_id
//       ? `/clients/${e.client_id}`
//       : "/follow-ups";
// }
// function greeting() {
//   const h = new Date().getHours();
//   return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
// }
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ListTodo,
  MessageCircle,
  Plus,
  Sun,
} from "lucide-react";
import { getCalendarEvents, getModuleCounts } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MODULES } from "@/lib/modules";
import { fmtDateTime, Badge } from "@/components/ui";

const KIND_LABEL = {
  meeting: "Meeting",
  reminder: "Reminder",
  followup: "Follow-up",
  task: "Task",
  todo: "To-do",
};
const DONE = ["done", "completed", "cancelled"];

export default function HomePage() {
  const { profile, isSuperAdmin } = useAuth();
  const counts = useQuery({
    queryKey: ["module_counts"],
    queryFn: getModuleCounts,
  });
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const today = useQuery({
    queryKey: ["calendar", "today"],
    queryFn: () => getCalendarEvents(start, end),
  });
  const c = counts.data ?? {};
  const modules = MODULES.filter((m) => !m.superOnly || isSuperAdmin);
  const countText = (m) => {
    if (!m.countKey || counts.isLoading) return "";
    const n = c[m.countKey] ?? 0;
    return {
      leads: `${n} open`,
      tasks: `${n} open`,
      reminders: `${n} pending`,
      meetings: `${n} upcoming`,
      todos: `${n} to do`,
      notes: `${n} notes`,
      chat: n ? `${n} unread` : "all read",
      calendar: `${n} today`,
      clients: `${n} active`,
    }[m.countKey];
  };
  const events = today.data ?? [];
  const now = new Date();

  return (
    <div>
      {/* ---------- welcome banner ---------- */}
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-ink px-5 py-6 text-white shadow-lift sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-400/10" />
        <div className="pointer-events-none absolute -bottom-28 right-52 h-56 w-56 rounded-full bg-teal-400/[.07]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-300">
              <Sun size={15} />
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h1 className="mt-1.5 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
              {greeting()}, {profile?.full_name?.split(" ")[0]} 👋
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.followups_overdue > 0 && (
                <Link
                  to="/follow-ups"
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[12.5px] font-bold text-amber-200 ring-1 ring-amber-300/30 transition hover:bg-amber-400/30"
                >
                  <AlertTriangle size={13} /> {c.followups_overdue} overdue
                  follow-up{c.followups_overdue === 1 ? "" : "s"}
                </Link>
              )}
              <Link
                to="/calendar"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                <CalendarDays size={13} />{" "}
                {events.length
                  ? `${events.length} thing${events.length === 1 ? "" : "s"} today`
                  : "Nothing scheduled today"}
              </Link>
              {c.chat > 0 && (
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
                >
                  <MessageCircle size={13} /> {c.chat} unread message
                  {c.chat === 1 ? "" : "s"}
                </Link>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
            {[
              {
                to: "/leads?new=1",
                icon: Plus,
                label: "New lead",
                primary: true,
              },
              { to: "/todo", icon: ListTodo, label: "Add to-do" },
              { to: "/calendar", icon: CalendarPlus, label: "Plan meeting" },
              { to: "/overview", icon: BarChart3, label: "Overview" },
            ].map((q) => (
              <Link
                key={q.label}
                to={q.to}
                className={clsx(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition",
                  q.primary
                    ? "bg-teal-500 text-white shadow-brand hover:bg-teal-400"
                    : "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20",
                )}
              >
                <q.icon size={16} /> {q.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Module grid — the home screen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        {modules.map((m) => (
          <Link
            key={m.key}
            to={m.to}
            className="group relative overflow-hidden rounded-2xl border border-mist-2 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-pop sm:p-5"
            style={{ borderColor: m.bg }}
          >
            <div
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 transition-transform group-hover:scale-125"
              style={{ background: m.bg }}
            />
            <div className="relative">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
                style={{ background: m.bg, color: m.color }}
              >
                <m.icon size={26} strokeWidth={2.2} />
              </span>
              <h2 className="mt-4 text-[15px] font-bold leading-tight text-ink">
                {m.label}
              </h2>
              <p className="mt-1 hidden text-[13px] leading-snug text-slate-500 sm:block">
                {m.blurb}
              </p>
              <p
                className="mt-3 text-[13px] font-semibold num"
                style={{ color: m.color }}
              >
                {countText(m) || (m.superOnly ? "Set up" : "")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Today */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
            <CalendarDays size={18} className="text-sky-600" /> Today
            {events.length > 0 && (
              <span className="rounded-full bg-mist-2 px-2 py-0.5 text-[12px] font-bold text-slate-500 num">
                {events.length}
              </span>
            )}
          </h2>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:underline"
          >
            Open calendar <ArrowRight size={14} />
          </Link>
        </div>
        {today.isLoading ? null : !events.length ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-mist-3 bg-white/60 p-8 text-center">
            <CheckCircle2 size={28} className="text-teal-500" />
            <p className="mt-2 font-bold text-ink">A clear day</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Schedule a meeting or reminder from any lead, or add a to-do.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {events.map((e) => {
              const st = kindStyle(e.kind);
              const done = DONE.includes(e.status);
              const late = !done && new Date(e.starts_at) < now;
              return (
                <li key={e.kind + e.id}>
                  <Link
                    to={linkFor(e)}
                    className="group flex items-center gap-3 rounded-2xl border border-mist-2 bg-white px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-pop"
                    style={{ borderLeft: `4px solid ${st.color}` }}
                  >
                    <span
                      className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-center"
                      style={{ background: st.background, color: st.color }}
                    >
                      <span className="text-[12.5px] font-extrabold leading-tight num">
                        {fmtDateTime(e.starts_at)
                          .split("· ")[1]
                          ?.replace(" ", " ")}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx(
                          "truncate text-[14px] font-semibold group-hover:underline",
                          done ? "text-slate-400 line-through" : "text-ink",
                        )}
                      >
                        {e.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-[12px]">
                        <span className="font-bold" style={{ color: st.color }}>
                          {KIND_LABEL[e.kind]}
                        </span>
                        {late && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <AlertTriangle size={11} /> Missed
                          </span>
                        )}
                      </p>
                    </div>
                    <Badge value={e.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export function kindStyle(kind) {
  const m = {
    meeting: ["#FFEDD5", "#EA580C"],
    reminder: ["#FEF3C7", "#D97706"],
    followup: ["#FCE7F3", "#DB2777"],
    task: ["#EDE9FE", "#7C3AED"],
    todo: ["#DBEAFE", "#2563EB"],
  };
  const [bg, color] = m[kind] ?? ["#EEF2F6", "#475569"];
  return { background: bg, color };
}
export function linkFor(e) {
  if (e.kind === "todo") return "/todo";
  if (e.kind === "task") return "/tasks";
  if (e.kind === "meeting") return "/meetings";
  if (e.kind === "reminder") return "/reminders";
  return e.lead_id
    ? `/leads/${e.lead_id}`
    : e.client_id
      ? `/clients/${e.client_id}`
      : "/follow-ups";
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
