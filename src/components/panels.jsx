// import { useEffect, useRef, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import {
//   Plus,
//   Check,
//   Trash2,
//   Pencil,
//   FileText,
//   Download,
//   Upload,
//   Phone,
//   Mail,
//   MessageCircle,
//   Calendar,
//   StickyNote,
//   ArrowRightLeft,
//   UserPlus,
//   CreditCard,
//   Loader2,
//   Eye,
//   ExternalLink,
//   Film,
//   Image as ImageIcon,
//   X,
//   History,
//   CalendarClock,
//   ListChecks,
//   NotebookPen,
//   FolderOpen,
//   Wallet,
//   Video,
//   Bell,
//   AlertTriangle,
// } from "lucide-react";
// import clsx from "clsx";
// import {
//   addActivity,
//   createFollowUp,
//   createPayment,
//   deleteDocument,
//   deleteFollowUp,
//   deletePayment,
//   deleteTask,
//   getActivities,
//   getDocuments,
//   getDocumentUrl,
//   getFollowUps,
//   getPayments,
//   getTasks,
//   updateFollowUp,
//   updatePayment,
//   updateTask,
//   uploadDocument,
// } from "@/lib/api";
// import { errMsg } from "@/lib/http";
// import { useAuth } from "@/lib/auth";
// import { PAYMENT_STATUSES } from "@/lib/types";
// import {
//   Field,
//   Input,
//   Modal,
//   Select,
//   Spinner,
//   Textarea,
//   enumOptions,
//   fmtDateTime,
//   fmtRelative,
//   isOverdue,
//   money,
// } from "./ui";
// import { FollowUpForm, TaskForm } from "./forms";
// import { getNotes } from "@/lib/api";
// import { NoteEditor, NOTE_BG } from "@/pages/Notes";

// const kindOf = (p) => (p.client_id ? "client" : "lead");
// const idOf = (p) => p.client_id ?? p.lead_id;

// /** Header used by every panel: coloured icon, title, count and an action on the right. */
// export function PanelHead({
//   icon: Icon,
//   title,
//   count,
//   sub,
//   color = "#0B857D",
//   bg = "#E6F7F5",
//   action,
// }) {
//   return (
//     <div className="flex items-center gap-3 border-b border-mist-2 px-5 py-4">
//       <span
//         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
//         style={{ background: bg, color }}
//       >
//         <Icon size={18} />
//       </span>
//       <div className="min-w-0 flex-1">
//         <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink">
//           {title}
//           {count > 0 && (
//             <span className="rounded-full bg-mist-2 px-2 py-0.5 text-[11px] font-bold text-slate-500 num">
//               {count}
//             </span>
//           )}
//         </h3>
//         {sub && <p className="truncate text-[12.5px] text-slate-500">{sub}</p>}
//       </div>
//       {action}
//     </div>
//   );
// }
// const HeadBtn = ({ onClick, children, color = "#0B857D" }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition hover:bg-slate-100"
//     style={{ color }}
//   >
//     {children}
//   </button>
// );
// function SoftEmpty({ icon: Icon, title, text, action }) {
//   return (
//     <div className="flex flex-col items-center px-5 py-9 text-center">
//       <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-slate-400">
//         <Icon size={20} />
//       </span>
//       <p className="mt-2.5 text-[14px] font-bold text-ink">{title}</p>
//       {text && <p className="mt-0.5 text-[12.5px] text-slate-500">{text}</p>}
//       {action}
//     </div>
//   );
// }
// const FU_STYLE = {
//   call: { icon: Phone, c: "#DB2777", bg: "#FCE7F3" },
//   meeting: { icon: Video, c: "#EA580C", bg: "#FFEDD5" },
//   reminder: { icon: Bell, c: "#D97706", bg: "#FEF3C7" },
//   email: { icon: Mail, c: "#2563EB", bg: "#DBEAFE" },
//   whatsapp: { icon: MessageCircle, c: "#16A34A", bg: "#DCFCE7" },
// };
// const ACT_STYLE = {
//   call: ["#DB2777", "#FCE7F3"],
//   email: ["#2563EB", "#DBEAFE"],
//   meeting: ["#EA580C", "#FFEDD5"],
//   note: ["#7C3AED", "#EDE9FE"],
//   status_change: ["#0B857D", "#E6F7F5"],
//   assignment: ["#0F2F58", "#E3EAF4"],
//   document: ["#475569", "#EEF2F6"],
//   payment: ["#16A34A", "#DCFCE7"],
//   created: ["#0B857D", "#E6F7F5"],
//   converted: ["#16A34A", "#DCFCE7"],
//   system: ["#64748B", "#EEF2F6"],
// };
// const PRIO = {
//   high: ["#C2410C", "#FFEDD5"],
//   medium: ["#B7791F", "#FEF3C7"],
//   low: ["#64748B", "#EEF2F6"],
// };

// const ACT_ICONS = {
//   call: Phone,
//   email: Mail,
//   meeting: Calendar,
//   note: StickyNote,
//   status_change: ArrowRightLeft,
//   assignment: UserPlus,
//   document: FileText,
//   payment: CreditCard,
//   created: Plus,
//   converted: Check,
//   system: StickyNote,
// };

// // ---------------- Activity timeline + add note ----------------
// export function ActivityPanel(parent) {
//   const qc = useQueryClient();
//   const q = useQuery({
//     queryKey: ["activities", parent],
//     queryFn: () => getActivities(parent),
//   });
//   const [type, setType] = useState("note");
//   const [title, setTitle] = useState("");
//   const [body, setBody] = useState("");
//   const add = useMutation({
//     mutationFn: () =>
//       addActivity({
//         ...parent,
//         type,
//         title: title || `${type[0].toUpperCase()}${type.slice(1)} logged`,
//         body,
//       }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["activities"] });
//       setTitle("");
//       setBody("");
//       toast.success("Logged");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const items = q.data ?? [];
//   return (
//     <div className="card overflow-hidden">
//       <PanelHead
//         icon={History}
//         title="History & activity"
//         count={items.length}
//         sub="Calls, emails, meetings and everything that changed"
//       />
//       <form
//         className="border-b border-mist-2 bg-slate-50/50 p-4"
//         onSubmit={(e) => {
//           e.preventDefault();
//           if (body.trim()) add.mutate();
//         }}
//       >
//         <div className="mb-2.5 flex flex-wrap gap-1.5">
//           {["note", "call", "email", "meeting"].map((t) => {
//             const Icon = ACT_ICONS[t];
//             const [c, bg] = ACT_STYLE[t];
//             const on = type === t;
//             return (
//               <button
//                 type="button"
//                 key={t}
//                 onClick={() => setType(t)}
//                 aria-pressed={on}
//                 className={clsx(
//                   "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-bold capitalize transition",
//                   on
//                     ? "border-transparent shadow-sm"
//                     : "border-mist-3 bg-white text-slate-500 hover:text-ink",
//                 )}
//                 style={on ? { background: bg, color: c } : undefined}
//               >
//                 <Icon size={14} />{" "}
//                 {t === "note"
//                   ? "Note"
//                   : t === "call"
//                     ? "Call"
//                     : t === "email"
//                       ? "Email"
//                       : "Meeting"}
//               </button>
//             );
//           })}
//         </div>
//         <div className="rounded-xl border border-mist-3 bg-white transition focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-500/10">
//           <input
//             placeholder="Title (optional)"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full rounded-t-xl border-b border-mist bg-transparent px-3.5 py-2.5 text-[14px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-slate-400"
//           />
//           <textarea
//             placeholder={
//               type === "call"
//                 ? "What was discussed on the call?"
//                 : type === "meeting"
//                   ? "Meeting summary and next steps…"
//                   : type === "email"
//                     ? "What did you send or receive?"
//                     : "Write a note…"
//             }
//             value={body}
//             onChange={(e) => setBody(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && body.trim())
//                 add.mutate();
//             }}
//             rows={2}
//             className="block w-full resize-y bg-transparent px-3.5 py-2.5 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
//           />
//           <div className="flex items-center justify-between gap-2 border-t border-mist px-3 py-2">
//             <span className="hidden text-[11.5px] text-slate-400 sm:block">
//               Ctrl + Enter to save
//             </span>
//             <button
//               className="btn-primary ml-auto py-1.5 text-[13px]"
//               disabled={add.isPending || !body.trim()}
//             >
//               {add.isPending ? (
//                 <Loader2 size={14} className="animate-spin" />
//               ) : (
//                 <Plus size={14} />
//               )}{" "}
//               Add to history
//             </button>
//           </div>
//         </div>
//       </form>
//       {q.isLoading ? (
//         <Spinner />
//       ) : !items.length ? (
//         <SoftEmpty
//           icon={History}
//           title="No history yet"
//           text="Log your first call or note above."
//         />
//       ) : (
//         <ol className="relative px-5 py-4 before:absolute before:bottom-6 before:left-[37px] before:top-6 before:w-px before:bg-mist-2">
//           {items.map((a) => {
//             const Icon = ACT_ICONS[a.type] ?? StickyNote;
//             const [c, bg] = ACT_STYLE[a.type] ?? ACT_STYLE.system;
//             return (
//               <li key={a.id} className="relative flex gap-3.5 py-2.5">
//                 <span
//                   className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
//                   style={{ background: bg, color: c }}
//                 >
//                   <Icon size={14} />
//                 </span>
//                 <div className="min-w-0 flex-1 pt-0.5">
//                   <div className="flex flex-wrap items-baseline justify-between gap-x-3">
//                     <p className="min-w-0 break-words text-[14px] font-semibold text-ink">
//                       {a.title}
//                     </p>
//                     <span
//                       className="shrink-0 text-[12px] text-slate-400"
//                       title={fmtDateTime(a.created_at)}
//                     >
//                       {fmtRelative(a.created_at)}
//                     </span>
//                   </div>
//                   {a.body && (
//                     <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-[13.5px] leading-relaxed text-slate-600">
//                       {a.body}
//                     </p>
//                   )}
//                   <p className="mt-1 text-[12px] text-slate-400">
//                     by {a.user?.full_name ?? "System"}
//                   </p>
//                 </div>
//               </li>
//             );
//           })}
//         </ol>
//       )}
//     </div>
//   );
// }

// // ---------------- Follow-ups ----------------
// export function FollowUpsPanel(parent) {
//   const qc = useQueryClient();
//   const q = useQuery({
//     queryKey: ["follow_ups", parent],
//     queryFn: () => getFollowUps(parent),
//   });
//   const [modal, setModal] = useState(null);
//   const [complete, setComplete] = useState(null);
//   const inval = () => {
//     qc.invalidateQueries({ queryKey: ["follow_ups"] });
//     qc.invalidateQueries({ queryKey: ["activities"] });
//     qc.invalidateQueries({ queryKey: ["dashboard"] });
//     qc.invalidateQueries({ queryKey: ["leads"] });
//   };
//   const del = useMutation({
//     mutationFn: deleteFollowUp,
//     onSuccess: () => {
//       inval();
//       toast.success("Removed");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const fus = [...(q.data ?? [])].sort((x, y) =>
//     (x.status === "pending") === (y.status === "pending")
//       ? new Date(x.due_at) - new Date(y.due_at)
//       : x.status === "pending"
//         ? -1
//         : 1,
//   );
//   const pendingN = fus.filter((f) => f.status === "pending").length;
//   const lateN = fus.filter(
//     (f) => f.status === "pending" && isOverdue(f.due_at),
//   ).length;
//   return (
//     <div className="card overflow-hidden">
//       <PanelHead
//         icon={CalendarClock}
//         title="Follow-ups"
//         count={pendingN}
//         color="#EA580C"
//         bg="#FFEDD5"
//         sub={
//           lateN
//             ? `${lateN} late · ${pendingN} pending`
//             : pendingN
//               ? `${pendingN} pending`
//               : "Calls, meetings and reminders"
//         }
//         action={
//           <HeadBtn onClick={() => setModal("new")}>
//             <Plus size={15} /> Schedule
//           </HeadBtn>
//         }
//       />
//       {q.isLoading ? (
//         <Spinner />
//       ) : !fus.length ? (
//         <SoftEmpty
//           icon={CalendarClock}
//           title="No follow-ups yet"
//           text="Plan the next call or meeting so it isn't forgotten."
//           action={
//             <button
//               className="btn-secondary mt-3 py-1.5 text-[13px]"
//               onClick={() => setModal("new")}
//             >
//               <Plus size={14} /> Schedule follow-up
//             </button>
//           }
//         />
//       ) : (
//         <ul className="space-y-1 p-2">
//           {fus.map((f) => {
//             const st = FU_STYLE[f.type] ?? FU_STYLE.reminder;
//             const pending = f.status === "pending";
//             const late = pending && isOverdue(f.due_at);
//             return (
//               <li
//                 key={f.id}
//                 className={clsx(
//                   "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50",
//                   !pending && "opacity-60",
//                 )}
//               >
//                 <span
//                   className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
//                   style={{ background: st.bg, color: st.c }}
//                 >
//                   <st.icon size={16} />
//                 </span>
//                 <div className="min-w-0 flex-1">
//                   <p
//                     className={clsx(
//                       "truncate text-[14px] font-semibold",
//                       pending ? "text-ink" : "text-slate-500 line-through",
//                     )}
//                   >
//                     {f.title}
//                   </p>
//                   <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
//                     <span
//                       className={clsx(
//                         "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold num",
//                         late
//                           ? "bg-amber-50 text-amber-700"
//                           : pending
//                             ? "bg-mist text-slate-600"
//                             : "bg-[#DCFCE7] text-[#16A34A]",
//                       )}
//                       title={fmtDateTime(f.due_at)}
//                     >
//                       {late ? (
//                         <AlertTriangle size={11} />
//                       ) : pending ? (
//                         <Calendar size={11} />
//                       ) : (
//                         <Check size={11} />
//                       )}
//                       {pending
//                         ? fmtDateTime(f.due_at)
//                         : f.status === "done"
//                           ? "Done"
//                           : f.status}
//                     </span>
//                     {f.assignee && (
//                       <span className="text-slate-400">
//                         {f.assignee.full_name}
//                       </span>
//                     )}
//                   </div>
//                   {f.outcome && (
//                     <p className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12.5px] text-slate-600">
//                       {f.outcome}
//                     </p>
//                   )}
//                 </div>
//                 <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
//                   {pending && (
//                     <button
//                       className="rounded-lg p-1.5 text-[#16A34A] hover:bg-[#DCFCE7]"
//                       title="Mark done"
//                       aria-label={`Mark ${f.title} done`}
//                       onClick={() => setComplete(f)}
//                     >
//                       <Check size={16} />
//                     </button>
//                   )}
//                   <button
//                     className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
//                     title="Edit"
//                     aria-label={`Edit ${f.title}`}
//                     onClick={() => setModal(f)}
//                   >
//                     <Pencil size={14} />
//                   </button>
//                   <button
//                     className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700"
//                     title="Delete"
//                     aria-label={`Delete ${f.title}`}
//                     onClick={() => del.mutate(f.id)}
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//       <Modal
//         open={modal !== null}
//         onClose={() => setModal(null)}
//         title={modal === "new" ? "Schedule follow-up" : "Edit follow-up"}
//       >
//         {modal && (
//           <FollowUpForm
//             followUp={modal === "new" ? undefined : modal}
//             leadId={parent.lead_id}
//             clientId={parent.client_id}
//             onDone={() => {
//               setModal(null);
//               inval();
//             }}
//           />
//         )}
//       </Modal>
//       <CompleteFollowUpModal
//         followUp={complete}
//         onClose={() => setComplete(null)}
//         onDone={inval}
//       />
//     </div>
//   );
// }

// export function CompleteFollowUpModal({ followUp, onClose, onDone }) {
//   const [outcome, setOutcome] = useState("");
//   const [next, setNext] = useState("");
//   const [nextTitle, setNextTitle] = useState("");
//   const m = useMutation({
//     mutationFn: async () => {
//       if (!followUp) return;
//       await updateFollowUp(followUp.id, { status: "done", outcome });
//       if (next) {
//         await createFollowUp({
//           title: nextTitle || `Follow-up: ${followUp.title}`,
//           type: followUp.type,
//           due_at: new Date(next).toISOString(),
//           lead_id: followUp.lead_id,
//           client_id: followUp.client_id,
//           assigned_to: followUp.assigned_to,
//         });
//       }
//     },
//     onSuccess: () => {
//       toast.success("Follow-up completed");
//       setOutcome("");
//       setNext("");
//       setNextTitle("");
//       onDone();
//       onClose();
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   return (
//     <Modal open={!!followUp} onClose={onClose} title="Complete follow-up">
//       <form
//         className="space-y-4"
//         onSubmit={(e) => {
//           e.preventDefault();
//           m.mutate();
//         }}
//       >
//         <Field label="Call / meeting notes & outcome">
//           <Textarea
//             value={outcome}
//             onChange={(e) => setOutcome(e.target.value)}
//             placeholder="What happened? What was agreed?"
//           />
//         </Field>
//         <div className="rounded-lg border border-dashed border-mist-3 p-3">
//           <p className="mb-2 text-xs font-medium text-slate-600">
//             Schedule the next follow-up (optional)
//           </p>
//           <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//             <Input
//               type="datetime-local"
//               value={next}
//               onChange={(e) => setNext(e.target.value)}
//             />
//             <Input
//               placeholder="Title"
//               value={nextTitle}
//               onChange={(e) => setNextTitle(e.target.value)}
//             />
//           </div>
//         </div>
//         <div className="flex justify-end">
//           <button className="btn-primary" disabled={m.isPending}>
//             {m.isPending && <Loader2 size={16} className="animate-spin" />}Mark
//             as done
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// }

// // ---------------- Tasks ----------------
// export function TasksPanel(parent) {
//   const qc = useQueryClient();
//   const q = useQuery({
//     queryKey: ["tasks", parent],
//     queryFn: () => getTasks(parent),
//   });
//   const [modal, setModal] = useState(null);
//   const inval = () => qc.invalidateQueries({ queryKey: ["tasks"] });
//   const toggle = useMutation({
//     mutationFn: (t) =>
//       updateTask(t.id, {
//         status: t.status === "done" ? "todo" : "done",
//         completed_at: null,
//       }),
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const del = useMutation({
//     mutationFn: deleteTask,
//     onSuccess: () => {
//       inval();
//       toast.success("Task deleted");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const tasks = q.data ?? [];
//   const openN = tasks.filter((t) => t.status !== "done").length;
//   return (
//     <div className="card overflow-hidden">
//       <PanelHead
//         icon={ListChecks}
//         title="Tasks"
//         count={openN}
//         color="#7C3AED"
//         bg="#EDE9FE"
//         sub={
//           tasks.length
//             ? `${tasks.length - openN} of ${tasks.length} done`
//             : "Work to do for this record"
//         }
//         action={
//           <HeadBtn onClick={() => setModal("new")}>
//             <Plus size={15} /> Add
//           </HeadBtn>
//         }
//       />
//       {q.isLoading ? (
//         <Spinner />
//       ) : !tasks.length ? (
//         <SoftEmpty
//           icon={ListChecks}
//           title="No tasks yet"
//           text="Add things that need doing, like sending a quote."
//           action={
//             <button
//               className="btn-secondary mt-3 py-1.5 text-[13px]"
//               onClick={() => setModal("new")}
//             >
//               <Plus size={14} /> Add task
//             </button>
//           }
//         />
//       ) : (
//         <ul className="space-y-1 p-2">
//           {tasks.map((t) => {
//             const done = t.status === "done";
//             const [pc, pbg] = PRIO[t.priority] ?? PRIO.medium;
//             const late = !done && t.due_at && isOverdue(t.due_at);
//             return (
//               <li
//                 key={t.id}
//                 className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
//               >
//                 <button
//                   onClick={() => toggle.mutate(t)}
//                   aria-label={done ? "Mark not done" : "Mark done"}
//                   role="checkbox"
//                   aria-checked={done}
//                   className={clsx(
//                     "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition",
//                     done
//                       ? "border-teal-600 bg-teal-600 text-white"
//                       : "border-slate-300 hover:border-teal-500 hover:bg-teal-50",
//                   )}
//                 >
//                   {done && <Check size={13} strokeWidth={3} />}
//                 </button>
//                 <div className="min-w-0 flex-1">
//                   <p
//                     className={clsx(
//                       "truncate text-[14px] font-semibold",
//                       done ? "text-slate-400 line-through" : "text-ink",
//                     )}
//                   >
//                     {t.title}
//                   </p>
//                   <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
//                     <span
//                       className="rounded-full px-2 py-0.5 font-bold capitalize"
//                       style={{ background: pbg, color: pc }}
//                     >
//                       {t.priority ?? "medium"}
//                     </span>
//                     <span
//                       className={clsx(
//                         "num",
//                         late
//                           ? "font-semibold text-amber-700"
//                           : "text-slate-400",
//                       )}
//                     >
//                       {t.due_at
//                         ? `${late ? "Late · " : ""}${fmtDateTime(t.due_at)}`
//                         : "No due date"}
//                     </span>
//                     {t.assignee && (
//                       <span className="text-slate-400">
//                         · {t.assignee.full_name}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex shrink-0 items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
//                   <button
//                     className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
//                     title="Edit"
//                     aria-label={`Edit ${t.title}`}
//                     onClick={() => setModal(t)}
//                   >
//                     <Pencil size={14} />
//                   </button>
//                   <button
//                     className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700"
//                     title="Delete"
//                     aria-label={`Delete ${t.title}`}
//                     onClick={() => del.mutate(t.id)}
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//       <Modal
//         open={modal !== null}
//         onClose={() => setModal(null)}
//         title={modal === "new" ? "New task" : "Edit task"}
//       >
//         {modal && (
//           <TaskForm
//             task={modal === "new" ? undefined : modal}
//             leadId={parent.lead_id}
//             clientId={parent.client_id}
//             onDone={() => {
//               setModal(null);
//               inval();
//             }}
//           />
//         )}
//       </Modal>
//     </div>
//   );
// }

// // ---------------- Documents ----------------
// const fileKind = (mime, name) => {
//   const ext = String(name || "")
//     .split(".")
//     .pop()
//     .toLowerCase();
//   if (
//     mime?.startsWith("image/") ||
//     ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
//   )
//     return "image";
//   if (mime === "application/pdf" || ext === "pdf") return "pdf";
//   if (mime?.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext))
//     return "video";
//   return "file";
// };
// const KIND_STYLE = {
//   image: { icon: ImageIcon, fg: "#7C3AED", bg: "#EDE9FE" },
//   pdf: { icon: FileText, fg: "#DC2626", bg: "#FEE2E2" },
//   video: { icon: Film, fg: "#DB2777", bg: "#FCE7F3" },
//   file: { icon: FileText, fg: "#0284C7", bg: "#E0F2FE" },
// };
// const sizeText = (b) =>
//   !b
//     ? ""
//     : b > 1024 * 1024
//       ? `${(b / 1024 / 1024).toFixed(1)} MB`
//       : `${Math.max(1, Math.round(b / 1024))} KB`;
// /** Short-lived signed link for a document (refreshed before it expires). */
// function useDocUrl(id, enabled = true) {
//   return useQuery({
//     queryKey: ["doc_url", id],
//     queryFn: () => getDocumentUrl(id),
//     enabled: !!id && enabled,
//     staleTime: 8 * 60_000,
//     gcTime: 9 * 60_000,
//     refetchInterval: 8 * 60_000,
//   });
// }
// async function downloadDoc(d) {
//   try {
//     const url = await getDocumentUrl(d.id);
//     const a = document.createElement("a");
//     a.href = `${url}&download=1`;
//     a.rel = "noopener";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   } catch (e) {
//     toast.error(errMsg(e));
//   }
// }

// function DocTile({ d, onOpen }) {
//   const kind = fileKind(d.mime_type, d.name);
//   const url = useDocUrl(d.id, kind === "image");
//   const [failed, setFailed] = useState(false);
//   const st = KIND_STYLE[kind];
//   const ext = (d.name.split(".").pop() || "").slice(0, 4).toUpperCase();
//   return (
//     <button
//       type="button"
//       onClick={() => onOpen(d)}
//       className="group overflow-hidden rounded-xl border border-mist-2 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-teal-500/20"
//       title={d.name}
//     >
//       <div
//         className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
//         style={{ background: kind === "image" && !failed ? "#EEF2F6" : st.bg }}
//       >
//         {kind === "image" && url.data && !failed ? (
//           <img
//             src={url.data}
//             alt=""
//             loading="lazy"
//             onError={() => setFailed(true)}
//             className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//           />
//         ) : kind === "image" && !failed ? (
//           <Loader2 size={20} className="animate-spin text-slate-400" />
//         ) : (
//           <div className="flex flex-col items-center gap-1.5">
//             <span
//               className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card"
//               style={{ color: st.fg }}
//             >
//               <st.icon size={21} />
//             </span>
//             {ext && (
//               <span
//                 className="text-[11px] font-extrabold tracking-wide"
//                 style={{ color: st.fg }}
//               >
//                 {failed ? "MISSING" : ext}
//               </span>
//             )}
//           </div>
//         )}
//         <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/30 group-hover:opacity-100">
//           <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-card">
//             <Eye size={14} /> Preview
//           </span>
//         </span>
//       </div>
//       <div className="px-3 py-2.5">
//         <p className="truncate text-[13px] font-semibold text-ink">{d.name}</p>
//         <p className="truncate text-[11.5px] text-slate-500">
//           {[sizeText(d.size_bytes), fmtRelative(d.created_at)]
//             .filter(Boolean)
//             .join(" · ")}
//         </p>
//       </div>
//     </button>
//   );
// }

// /** Full-screen viewer: photos, PDFs and videos open inside the CRM. */
// function DocPreview({ doc, canDelete, onDelete, onClose }) {
//   const kind = fileKind(doc.mime_type, doc.name);
//   const url = useDocUrl(doc.id);
//   const [missing, setMissing] = useState(false);
//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);
//   // check once that the file still exists (old uploads may be gone)
//   useEffect(() => {
//     if (!url.data) return;
//     let stop = false;
//     fetch(url.data, { method: "HEAD" })
//       .then((r) => !stop && setMissing(r.status === 404))
//       .catch(() => {});
//     return () => {
//       stop = true;
//     };
//   }, [url.data]);
//   const st = KIND_STYLE[kind];
//   return (
//     <div
//       className="fixed inset-0 z-50 flex flex-col bg-ink-950/90 backdrop-blur-sm"
//       onMouseDown={onClose}
//       role="dialog"
//       aria-label={`Preview ${doc.name}`}
//     >
//       <div
//         className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6"
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <span
//           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"
//           style={{ color: st.bg }}
//         >
//           <st.icon size={18} />
//         </span>
//         <div className="min-w-0 flex-1">
//           <p className="truncate text-sm font-bold">{doc.name}</p>
//           <p className="truncate text-xs text-slate-400">
//             {[
//               sizeText(doc.size_bytes),
//               doc.uploader?.full_name,
//               fmtRelative(doc.created_at),
//             ]
//               .filter(Boolean)
//               .join(" · ")}
//           </p>
//         </div>
//         <button
//           className="btn border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
//           onClick={() => downloadDoc(doc)}
//           disabled={missing}
//         >
//           <Download size={15} />{" "}
//           <span className="hidden sm:inline">Download</span>
//         </button>
//         {url.data && !missing && (
//           <a
//             className="btn border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
//             href={url.data}
//             target="_blank"
//             rel="noreferrer"
//             title="Open in new tab"
//           >
//             <ExternalLink size={15} />
//           </a>
//         )}
//         {canDelete && (
//           <button
//             className="btn border border-white/15 bg-white/10 px-3 py-2 text-red-300 hover:bg-red-500/20"
//             onClick={onDelete}
//             title="Delete"
//           >
//             <Trash2 size={15} />
//           </button>
//         )}
//         <button
//           className="btn px-2.5 py-2 text-slate-300 hover:bg-white/10 hover:text-white"
//           onClick={onClose}
//           aria-label="Close preview"
//         >
//           <X size={20} />
//         </button>
//       </div>
//       <div
//         className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
//         onMouseDown={(e) => e.target === e.currentTarget && onClose()}
//       >
//         {!url.data ? (
//           <Loader2 size={28} className="animate-spin text-white/70" />
//         ) : missing ? (
//           <div
//             className="max-w-sm rounded-2xl bg-white p-8 text-center"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
//               <FileText size={22} />
//             </span>
//             <h3 className="mt-3 text-lg font-bold text-ink">
//               This file is no longer available
//             </h3>
//             <p className="mt-1 text-sm text-slate-500">
//               It was saved on an older server copy and has been removed. Please
//               delete this entry and upload the file again.
//             </p>
//           </div>
//         ) : kind === "image" ? (
//           <img
//             src={url.data}
//             alt={doc.name}
//             className="max-h-full max-w-full rounded-lg object-contain shadow-pop"
//             onMouseDown={(e) => e.stopPropagation()}
//           />
//         ) : kind === "pdf" ? (
//           <iframe
//             title={doc.name}
//             src={url.data}
//             className="h-full w-full max-w-5xl rounded-lg bg-white shadow-pop"
//             onMouseDown={(e) => e.stopPropagation()}
//           />
//         ) : kind === "video" ? (
//           <video
//             src={url.data}
//             controls
//             className="max-h-full max-w-full rounded-lg shadow-pop"
//             onMouseDown={(e) => e.stopPropagation()}
//           />
//         ) : (
//           <div
//             className="max-w-sm rounded-2xl bg-white p-8 text-center"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <span
//               className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
//               style={{ background: st.bg, color: st.fg }}
//             >
//               <st.icon size={22} />
//             </span>
//             <h3 className="mt-3 break-all text-base font-bold text-ink">
//               {doc.name}
//             </h3>
//             <p className="mt-1 text-sm text-slate-500">
//               This type of file can't be previewed here. Download it to open it
//               on your computer.
//             </p>
//             <button
//               className="btn-primary mt-5 w-full"
//               onClick={() => downloadDoc(doc)}
//             >
//               <Download size={16} /> Download
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export function DocumentsPanel(parent) {
//   const qc = useQueryClient();
//   const { isAdmin, profile } = useAuth();
//   const q = useQuery({
//     queryKey: ["documents", parent],
//     queryFn: () => getDocuments(parent),
//   });
//   const fileRef = useRef(null);
//   const [busy, setBusy] = useState(null); // { done, total }
//   const [drag, setDrag] = useState(false);
//   const [viewing, setViewing] = useState(null);
//   const [confirmDel, setConfirmDel] = useState(null);
//   async function onFiles(files) {
//     const list = Array.from(files ?? []);
//     if (!list.length) return;
//     const tooBig = list.filter((f) => f.size > 25 * 1024 * 1024);
//     if (tooBig.length)
//       toast.error(
//         `${tooBig.map((f) => f.name).join(", ")} is larger than 25 MB`,
//       );
//     const ok = list.filter((f) => f.size <= 25 * 1024 * 1024);
//     if (!ok.length) return;
//     let done = 0;
//     let failed = 0;
//     setBusy({ done, total: ok.length });
//     for (const f of ok) {
//       try {
//         await uploadDocument(kindOf(parent), idOf(parent), f);
//       } catch (e) {
//         failed++;
//         toast.error(`${f.name}: ${errMsg(e)}`);
//       }
//       setBusy({ done: ++done, total: ok.length });
//     }
//     setBusy(null);
//     if (fileRef.current) fileRef.current.value = "";
//     if (done - failed > 0)
//       toast.success(
//         `Uploaded ${done - failed} file${done - failed > 1 ? "s" : ""}`,
//       );
//     qc.invalidateQueries({ queryKey: ["documents"] });
//     qc.invalidateQueries({ queryKey: ["activities"] });
//   }
//   const del = useMutation({
//     mutationFn: deleteDocument,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["documents"] });
//       setConfirmDel(null);
//       setViewing(null);
//       toast.success("Deleted");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const canDelete = (d) => isAdmin || d.uploaded_by === profile?.id;
//   const docs = q.data ?? [];
//   return (
//     <div
//       className={clsx(
//         "card relative overflow-hidden transition-colors",
//         drag && "border-teal-400 ring-4 ring-teal-500/15",
//       )}
//       onDragOver={(e) => {
//         e.preventDefault();
//         setDrag(true);
//       }}
//       onDragLeave={(e) =>
//         !e.currentTarget.contains(e.relatedTarget) && setDrag(false)
//       }
//       onDrop={(e) => {
//         e.preventDefault();
//         setDrag(false);
//         onFiles(e.dataTransfer.files);
//       }}
//     >
//       <PanelHead
//         icon={FolderOpen}
//         title="Documents"
//         count={docs.length}
//         color="#2563EB"
//         bg="#DBEAFE"
//         sub="Photos, PDFs and files for this record"
//         action={
//           <label
//             className={clsx(
//               "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-teal-700 transition hover:bg-slate-100",
//               busy && "pointer-events-none opacity-50",
//             )}
//           >
//             {busy ? (
//               <Loader2 size={15} className="animate-spin" />
//             ) : (
//               <Upload size={15} />
//             )}
//             {busy
//               ? `Uploading ${Math.min(busy.done + 1, busy.total)}/${busy.total}…`
//               : "Upload"}
//             <input
//               ref={fileRef}
//               type="file"
//               multiple
//               className="hidden"
//               onChange={(e) => onFiles(e.target.files)}
//             />
//           </label>
//         }
//       />
//       <div className="p-4">
//         {q.isLoading ? (
//           <Spinner />
//         ) : !docs.length ? (
//           <button
//             type="button"
//             onClick={() => fileRef.current?.click()}
//             className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-mist-3 px-4 py-8 text-center transition-colors hover:border-teal-300 hover:bg-teal-50/40"
//           >
//             <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
//               <Upload size={21} />
//             </span>
//             <span className="mt-3 text-sm font-bold text-ink">
//               Drop files here or click to upload
//             </span>
//             <span className="mt-0.5 text-xs text-slate-500">
//               Photos, PDFs, Word, Excel, videos · up to 25 MB each
//             </span>
//           </button>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
//               {docs.map((d) => (
//                 <DocTile key={d.id} d={d} onOpen={setViewing} />
//               ))}
//             </div>
//             <p className="mt-3 text-center text-xs text-slate-400">
//               Click a file to preview · drag & drop to add more · max 25 MB each
//             </p>
//           </>
//         )}
//       </div>
//       {drag && (
//         <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-teal-50/90">
//           <p className="flex items-center gap-2 text-sm font-bold text-teal-800">
//             <Upload size={18} /> Drop to upload
//           </p>
//         </div>
//       )}
//       {viewing && (
//         <DocPreview
//           key={viewing.id}
//           doc={viewing}
//           canDelete={canDelete(viewing)}
//           onDelete={() => setConfirmDel(viewing)}
//           onClose={() => setViewing(null)}
//         />
//       )}
//       <Modal
//         open={!!confirmDel}
//         onClose={() => setConfirmDel(null)}
//         title="Delete this file?"
//       >
//         <p className="break-all text-sm text-slate-600">
//           <b className="text-ink">{confirmDel?.name}</b> will be deleted for
//           everyone. This can't be undone.
//         </p>
//         <div className="mt-5 flex justify-end gap-2">
//           <button className="btn-secondary" onClick={() => setConfirmDel(null)}>
//             Cancel
//           </button>
//           <button
//             className="btn-danger"
//             disabled={del.isPending}
//             onClick={() => del.mutate(confirmDel)}
//           >
//             {del.isPending && <Loader2 size={16} className="animate-spin" />}
//             Delete
//           </button>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// // ---------------- Payments (clients only) ----------------
// export function PaymentsPanel({ clientId }) {
//   const qc = useQueryClient();
//   const { isAdmin } = useAuth();
//   const q = useQuery({
//     queryKey: ["payments", clientId],
//     queryFn: () => getPayments(clientId),
//   });
//   const [open, setOpen] = useState(false);
//   const [f, setF] = useState({
//     amount: "",
//     status: "pending",
//     description: "",
//     due_at: "",
//   });
//   const inval = () => {
//     qc.invalidateQueries({ queryKey: ["payments"] });
//     qc.invalidateQueries({ queryKey: ["activities"] });
//     qc.invalidateQueries({ queryKey: ["dashboard"] });
//   };
//   const add = useMutation({
//     mutationFn: () =>
//       createPayment({
//         client_id: clientId,
//         amount: Number(f.amount),
//         status: f.status,
//         description: f.description || null,
//         due_at: f.due_at || null,
//       }),
//     onSuccess: () => {
//       inval();
//       setOpen(false);
//       setF({ amount: "", status: "pending", description: "", due_at: "" });
//       toast.success("Payment recorded");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const setStatus = useMutation({
//     mutationFn: ({ id, status }) => updatePayment(id, { status }),
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const del = useMutation({
//     mutationFn: deletePayment,
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const total = (q.data ?? []).reduce(
//     (a, p) => a + (p.status === "paid" ? Number(p.amount) : 0),
//     0,
//   );
//   const outstanding = (q.data ?? []).reduce(
//     (a, p) =>
//       a +
//       (p.status === "pending" || p.status === "overdue" ? Number(p.amount) : 0),
//     0,
//   );
//   return (
//     <div className="card overflow-hidden">
//       <PanelHead
//         icon={Wallet}
//         title="Payments"
//         count={q.data?.length ?? 0}
//         color="#16A34A"
//         bg="#DCFCE7"
//         sub={`Paid ${money(total)} · Outstanding ${money(outstanding)}`}
//         action={
//           <HeadBtn onClick={() => setOpen(true)}>
//             <Plus size={15} /> Record
//           </HeadBtn>
//         }
//       />
//       {q.isLoading ? (
//         <Spinner />
//       ) : !q.data?.length ? (
//         <SoftEmpty
//           icon={Wallet}
//           title="No payments recorded"
//           text="Record a deposit or payment to track what's been paid."
//         />
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Description</th>
//                 <th className="text-right">Amount</th>
//                 <th>Status</th>
//                 <th>Due</th>
//                 <th>Paid</th>
//                 <th />
//               </tr>
//             </thead>
//             <tbody>
//               {q.data.map((p) => (
//                 <tr key={p.id}>
//                   <td>{p.description ?? "—"}</td>
//                   <td className="text-right font-medium">
//                     {money(p.amount, p.currency)}
//                   </td>
//                   <td>
//                     <Select
//                       className="w-32 py-1"
//                       value={p.status}
//                       onChange={(e) =>
//                         setStatus.mutate({ id: p.id, status: e.target.value })
//                       }
//                       options={enumOptions(PAYMENT_STATUSES)}
//                     />
//                   </td>
//                   <td className="text-xs">{p.due_at ?? "—"}</td>
//                   <td className="text-xs">
//                     {p.paid_at ? fmtDateTime(p.paid_at) : "—"}
//                   </td>
//                   <td>
//                     {isAdmin && (
//                       <button
//                         className="btn-ghost p-1.5 text-amber-600"
//                         onClick={() => del.mutate(p.id)}
//                       >
//                         <Trash2 size={15} />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//       <Modal open={open} onClose={() => setOpen(false)} title="Record payment">
//         <form
//           className="grid grid-cols-1 gap-4 sm:grid-cols-2"
//           onSubmit={(e) => {
//             e.preventDefault();
//             add.mutate();
//           }}
//         >
//           <Field label="Amount (CAD) *">
//             <Input
//               type="number"
//               min={0.01}
//               step="0.01"
//               required
//               value={f.amount}
//               onChange={(e) => setF({ ...f, amount: e.target.value })}
//             />
//           </Field>
//           <Field label="Status">
//             <Select
//               value={f.status}
//               onChange={(e) => setF({ ...f, status: e.target.value })}
//               options={enumOptions(PAYMENT_STATUSES)}
//             />
//           </Field>
//           <Field label="Description" className="sm:col-span-2">
//             <Input
//               value={f.description}
//               onChange={(e) => setF({ ...f, description: e.target.value })}
//               placeholder="Deposit, final balance…"
//             />
//           </Field>
//           <Field label="Due date">
//             <Input
//               type="date"
//               value={f.due_at}
//               onChange={(e) => setF({ ...f, due_at: e.target.value })}
//             />
//           </Field>
//           <div className="flex items-end justify-end">
//             <button className="btn-primary" disabled={add.isPending}>
//               Save
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }

// // ---------------- Contact quick actions ----------------
// export function ContactActions({ phone, email, dark }) {
//   const wa = phone ? `https://wa.me/${phone.replace(/[^\d]/g, "")}` : null;
//   const cls = dark
//     ? "inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
//     : "btn-secondary py-1.5";
//   return (
//     <div className="flex flex-wrap gap-2">
//       {phone && (
//         <a href={`tel:${phone}`} className={cls}>
//           <Phone size={15} /> Call
//         </a>
//       )}
//       {wa && (
//         <a href={wa} target="_blank" rel="noreferrer" className={cls}>
//           <MessageCircle size={15} className={dark ? "text-[#4ADE80]" : ""} />{" "}
//           WhatsApp
//         </a>
//       )}
//       {email && (
//         <a href={`mailto:${email}`} className={cls}>
//           <Mail size={15} /> Email
//         </a>
//       )}
//       {!phone && !email && (
//         <span
//           className={
//             dark ? "text-[13px] text-white/60" : "text-[13px] text-slate-400"
//           }
//         >
//           No phone or email saved
//         </span>
//       )}
//     </div>
//   );
// }

// // ---------------- Notes attached to a record ----------------
// export function NotesPanel(parent) {
//   const qc = useQueryClient();
//   const q = useQuery({
//     queryKey: ["notes", parent],
//     queryFn: () => getNotes(parent),
//   });
//   const [editing, setEditing] = useState(null);
//   return (
//     <div className="card overflow-hidden">
//       <PanelHead
//         icon={NotebookPen}
//         title="Notes"
//         count={q.data?.length ?? 0}
//         color="#9333EA"
//         bg="#F3E8FF"
//         sub="Sticky notes about this record"
//         action={
//           <HeadBtn color="#9333EA" onClick={() => setEditing("new")}>
//             <Plus size={15} /> Add
//           </HeadBtn>
//         }
//       />
//       {q.isLoading ? (
//         <Spinner />
//       ) : !q.data?.length ? (
//         <SoftEmpty
//           icon={NotebookPen}
//           title="No notes yet"
//           text="Keep details like preferences or budget here."
//         />
//       ) : (
//         <div className="grid gap-3 p-4 sm:grid-cols-2">
//           {q.data.map((n) => {
//             const [bg, fg] = NOTE_BG[n.color] ?? NOTE_BG.yellow;
//             return (
//               <button
//                 key={n.id}
//                 onClick={() => setEditing(n)}
//                 className="rounded-xl p-3 text-left transition hover:-translate-y-0.5"
//                 style={{ background: bg }}
//               >
//                 <div className="text-sm font-bold" style={{ color: fg }}>
//                   {n.title || "Untitled"}
//                 </div>
//                 {n.body && (
//                   <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[13px] text-slate-700">
//                     {n.body}
//                   </p>
//                 )}
//                 <div className="mt-2 text-[11px] text-slate-500">
//                   {n.owner?.full_name} · {fmtRelative(n.updated_at)}
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       )}
//       <Modal
//         open={editing !== null}
//         onClose={() => setEditing(null)}
//         title={editing === "new" ? "New note" : "Edit note"}
//         wide
//       >
//         {editing && (
//           <NoteEditor
//             note={editing === "new" ? undefined : editing}
//             leadId={parent.lead_id}
//             clientId={parent.client_id}
//             onDone={() => {
//               setEditing(null);
//               qc.invalidateQueries({ queryKey: ["notes"] });
//             }}
//           />
//         )}
//       </Modal>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  Check,
  Trash2,
  Pencil,
  FileText,
  Download,
  Upload,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  StickyNote,
  ArrowRightLeft,
  UserPlus,
  CreditCard,
  Loader2,
  Eye,
  ExternalLink,
  Film,
  Image as ImageIcon,
  X,
  History,
  CalendarClock,
  ListChecks,
  NotebookPen,
  FolderOpen,
  Wallet,
  Video,
  Bell,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import {
  addActivity,
  createFollowUp,
  createPayment,
  deleteDocument,
  deleteFollowUp,
  deletePayment,
  deleteTask,
  getActivities,
  getDocuments,
  getDocumentUrl,
  getFollowUps,
  getPayments,
  getTasks,
  updateFollowUp,
  updatePayment,
  updateTask,
  uploadDocument,
} from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { PAYMENT_STATUSES } from "@/lib/types";
import {
  Field,
  Input,
  Modal,
  Select,
  Spinner,
  Textarea,
  enumOptions,
  fmtDate,
  fmtDateTime,
  fmtRelative,
  isOverdue,
  money,
} from "./ui";
import { FollowUpForm, TaskForm } from "./forms";
import { getNotes } from "@/lib/api";
import { NoteEditor, NOTE_BG } from "@/pages/Notes";

const kindOf = (p) => (p.client_id ? "client" : "lead");
const idOf = (p) => p.client_id ?? p.lead_id;

/** Header used by every panel: coloured icon, title, count and an action on the right. */
export function PanelHead({
  icon: Icon,
  title,
  count,
  sub,
  color = "#0B857D",
  bg = "#E6F7F5",
  action,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-mist-2 px-5 py-4">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: bg, color }}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-ink">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-mist-2 px-2 py-0.5 text-[11px] font-bold text-slate-500 num">
              {count}
            </span>
          )}
        </h3>
        {sub && <p className="truncate text-[12.5px] text-slate-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
const HeadBtn = ({ onClick, children, color = "#0B857D" }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition hover:bg-slate-100"
    style={{ color }}
  >
    {children}
  </button>
);
function SoftEmpty({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-5 py-9 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-slate-400">
        <Icon size={20} />
      </span>
      <p className="mt-2.5 text-[14px] font-bold text-ink">{title}</p>
      {text && <p className="mt-0.5 text-[12.5px] text-slate-500">{text}</p>}
      {action}
    </div>
  );
}
const FU_STYLE = {
  call: { icon: Phone, c: "#DB2777", bg: "#FCE7F3" },
  meeting: { icon: Video, c: "#EA580C", bg: "#FFEDD5" },
  reminder: { icon: Bell, c: "#D97706", bg: "#FEF3C7" },
  email: { icon: Mail, c: "#2563EB", bg: "#DBEAFE" },
  whatsapp: { icon: MessageCircle, c: "#16A34A", bg: "#DCFCE7" },
};
const ACT_STYLE = {
  call: ["#DB2777", "#FCE7F3"],
  email: ["#2563EB", "#DBEAFE"],
  meeting: ["#EA580C", "#FFEDD5"],
  note: ["#7C3AED", "#EDE9FE"],
  status_change: ["#0B857D", "#E6F7F5"],
  assignment: ["#0F2F58", "#E3EAF4"],
  document: ["#475569", "#EEF2F6"],
  payment: ["#16A34A", "#DCFCE7"],
  created: ["#0B857D", "#E6F7F5"],
  converted: ["#16A34A", "#DCFCE7"],
  system: ["#64748B", "#EEF2F6"],
};
const PRIO = {
  high: ["#C2410C", "#FFEDD5"],
  medium: ["#B7791F", "#FEF3C7"],
  low: ["#64748B", "#EEF2F6"],
};

const ACT_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: StickyNote,
  status_change: ArrowRightLeft,
  assignment: UserPlus,
  document: FileText,
  payment: CreditCard,
  created: Plus,
  converted: Check,
  system: StickyNote,
};

// ---------------- Activity timeline + add note ----------------
export function ActivityPanel(parent) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["activities", parent],
    queryFn: () => getActivities(parent),
  });
  const [type, setType] = useState("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const add = useMutation({
    mutationFn: () =>
      addActivity({
        ...parent,
        type,
        title: title || `${type[0].toUpperCase()}${type.slice(1)} logged`,
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
      setTitle("");
      setBody("");
      toast.success("Logged");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const items = q.data ?? [];
  return (
    <div className="card overflow-hidden">
      <PanelHead
        icon={History}
        title="History & activity"
        count={items.length}
        sub="Calls, emails, meetings and everything that changed"
      />
      <form
        className="border-b border-mist-2 bg-slate-50/50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) add.mutate();
        }}
      >
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {["note", "call", "email", "meeting"].map((t) => {
            const Icon = ACT_ICONS[t];
            const [c, bg] = ACT_STYLE[t];
            const on = type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                aria-pressed={on}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-bold capitalize transition",
                  on
                    ? "border-transparent shadow-sm"
                    : "border-mist-3 bg-white text-slate-500 hover:text-ink",
                )}
                style={on ? { background: bg, color: c } : undefined}
              >
                <Icon size={14} />{" "}
                {t === "note"
                  ? "Note"
                  : t === "call"
                    ? "Call"
                    : t === "email"
                      ? "Email"
                      : "Meeting"}
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-mist-3 bg-white transition focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-500/10">
          <input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-t-xl border-b border-mist bg-transparent px-3.5 py-2.5 text-[14px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-slate-400"
          />
          <textarea
            placeholder={
              type === "call"
                ? "What was discussed on the call?"
                : type === "meeting"
                  ? "Meeting summary and next steps…"
                  : type === "email"
                    ? "What did you send or receive?"
                    : "Write a note…"
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && body.trim())
                add.mutate();
            }}
            rows={2}
            className="block w-full resize-y bg-transparent px-3.5 py-2.5 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between gap-2 border-t border-mist px-3 py-2">
            <span className="hidden text-[11.5px] text-slate-400 sm:block">
              Ctrl + Enter to save
            </span>
            <button
              className="btn-primary ml-auto py-1.5 text-[13px]"
              disabled={add.isPending || !body.trim()}
            >
              {add.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Add to history
            </button>
          </div>
        </div>
      </form>
      {q.isLoading ? (
        <Spinner />
      ) : !items.length ? (
        <SoftEmpty
          icon={History}
          title="No history yet"
          text="Log your first call or note above."
        />
      ) : (
        <ol className="relative px-5 py-4 before:absolute before:bottom-6 before:left-[37px] before:top-6 before:w-px before:bg-mist-2">
          {items.map((a) => {
            const Icon = ACT_ICONS[a.type] ?? StickyNote;
            const [c, bg] = ACT_STYLE[a.type] ?? ACT_STYLE.system;
            return (
              <li key={a.id} className="relative flex gap-3.5 py-2.5">
                <span
                  className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
                  style={{ background: bg, color: c }}
                >
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="min-w-0 break-words text-[14px] font-semibold text-ink">
                      {a.title}
                    </p>
                    <span
                      className="shrink-0 text-[12px] text-slate-400"
                      title={fmtDateTime(a.created_at)}
                    >
                      {fmtRelative(a.created_at)}
                    </span>
                  </div>
                  {a.body && (
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-[13.5px] leading-relaxed text-slate-600">
                      {a.body}
                    </p>
                  )}
                  <p className="mt-1 text-[12px] text-slate-400">
                    by {a.user?.full_name ?? "System"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ---------------- Follow-ups ----------------
export function FollowUpsPanel(parent) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["follow_ups", parent],
    queryFn: () => getFollowUps(parent),
  });
  const [modal, setModal] = useState(null);
  const [complete, setComplete] = useState(null);
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["follow_ups"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["leads"] });
  };
  const del = useMutation({
    mutationFn: deleteFollowUp,
    onSuccess: () => {
      inval();
      toast.success("Removed");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const fus = [...(q.data ?? [])].sort((x, y) =>
    (x.status === "pending") === (y.status === "pending")
      ? new Date(x.due_at) - new Date(y.due_at)
      : x.status === "pending"
        ? -1
        : 1,
  );
  const pendingN = fus.filter((f) => f.status === "pending").length;
  const lateN = fus.filter(
    (f) => f.status === "pending" && isOverdue(f.due_at),
  ).length;
  return (
    <div className="card overflow-hidden">
      <PanelHead
        icon={CalendarClock}
        title="Follow-ups"
        count={pendingN}
        color="#EA580C"
        bg="#FFEDD5"
        sub={
          lateN
            ? `${lateN} late · ${pendingN} pending`
            : pendingN
              ? `${pendingN} pending`
              : "Calls, meetings and reminders"
        }
        action={
          <HeadBtn onClick={() => setModal("new")}>
            <Plus size={15} /> Schedule
          </HeadBtn>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : !fus.length ? (
        <SoftEmpty
          icon={CalendarClock}
          title="No follow-ups yet"
          text="Plan the next call or meeting so it isn't forgotten."
          action={
            <button
              className="btn-secondary mt-3 py-1.5 text-[13px]"
              onClick={() => setModal("new")}
            >
              <Plus size={14} /> Schedule follow-up
            </button>
          }
        />
      ) : (
        <ul className="space-y-1 p-2">
          {fus.map((f) => {
            const st = FU_STYLE[f.type] ?? FU_STYLE.reminder;
            const pending = f.status === "pending";
            const late = pending && isOverdue(f.due_at);
            return (
              <li
                key={f.id}
                className={clsx(
                  "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50",
                  !pending && "opacity-60",
                )}
              >
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: st.bg, color: st.c }}
                >
                  <st.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={clsx(
                      "truncate text-[14px] font-semibold",
                      pending ? "text-ink" : "text-slate-500 line-through",
                    )}
                  >
                    {f.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold num",
                        late
                          ? "bg-amber-50 text-amber-700"
                          : pending
                            ? "bg-mist text-slate-600"
                            : "bg-[#DCFCE7] text-[#16A34A]",
                      )}
                      title={fmtDateTime(f.due_at)}
                    >
                      {late ? (
                        <AlertTriangle size={11} />
                      ) : pending ? (
                        <Calendar size={11} />
                      ) : (
                        <Check size={11} />
                      )}
                      {pending
                        ? fmtDateTime(f.due_at)
                        : f.status === "done"
                          ? "Done"
                          : f.status}
                    </span>
                    {f.assignee && (
                      <span className="text-slate-400">
                        {f.assignee.full_name}
                      </span>
                    )}
                  </div>
                  {f.outcome && (
                    <p className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12.5px] text-slate-600">
                      {f.outcome}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                  {pending && (
                    <button
                      className="rounded-lg p-1.5 text-[#16A34A] hover:bg-[#DCFCE7]"
                      title="Mark done"
                      aria-label={`Mark ${f.title} done`}
                      onClick={() => setComplete(f)}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
                    title="Edit"
                    aria-label={`Edit ${f.title}`}
                    onClick={() => setModal(f)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                    title="Delete"
                    aria-label={`Delete ${f.title}`}
                    onClick={() => del.mutate(f.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "new" ? "Schedule follow-up" : "Edit follow-up"}
      >
        {modal && (
          <FollowUpForm
            followUp={modal === "new" ? undefined : modal}
            leadId={parent.lead_id}
            clientId={parent.client_id}
            onDone={() => {
              setModal(null);
              inval();
            }}
          />
        )}
      </Modal>
      <CompleteFollowUpModal
        followUp={complete}
        onClose={() => setComplete(null)}
        onDone={inval}
      />
    </div>
  );
}

export function CompleteFollowUpModal({ followUp, onClose, onDone }) {
  const [outcome, setOutcome] = useState("");
  const [next, setNext] = useState("");
  const [nextTitle, setNextTitle] = useState("");
  const m = useMutation({
    mutationFn: async () => {
      if (!followUp) return;
      await updateFollowUp(followUp.id, { status: "done", outcome });
      if (next) {
        await createFollowUp({
          title: nextTitle || `Follow-up: ${followUp.title}`,
          type: followUp.type,
          due_at: new Date(next).toISOString(),
          lead_id: followUp.lead_id,
          client_id: followUp.client_id,
          assigned_to: followUp.assigned_to,
        });
      }
    },
    onSuccess: () => {
      toast.success("Follow-up completed");
      setOutcome("");
      setNext("");
      setNextTitle("");
      onDone();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <Modal open={!!followUp} onClose={onClose} title="Complete follow-up">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <Field label="Call / meeting notes & outcome">
          <Textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="What happened? What was agreed?"
          />
        </Field>
        <div className="rounded-lg border border-dashed border-mist-3 p-3">
          <p className="mb-2 text-xs font-medium text-slate-600">
            Schedule the next follow-up (optional)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              type="datetime-local"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <Input
              placeholder="Title"
              value={nextTitle}
              onChange={(e) => setNextTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={m.isPending}>
            {m.isPending && <Loader2 size={16} className="animate-spin" />}Mark
            as done
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------- Tasks ----------------
export function TasksPanel(parent) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["tasks", parent],
    queryFn: () => getTasks(parent),
  });
  const [modal, setModal] = useState(null);
  const inval = () => qc.invalidateQueries({ queryKey: ["tasks"] });
  const toggle = useMutation({
    mutationFn: (t) =>
      updateTask(t.id, {
        status: t.status === "done" ? "todo" : "done",
        completed_at: null,
      }),
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      inval();
      toast.success("Task deleted");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const tasks = q.data ?? [];
  const openN = tasks.filter((t) => t.status !== "done").length;
  return (
    <div className="card overflow-hidden">
      <PanelHead
        icon={ListChecks}
        title="Tasks"
        count={openN}
        color="#7C3AED"
        bg="#EDE9FE"
        sub={
          tasks.length
            ? `${tasks.length - openN} of ${tasks.length} done`
            : "Work to do for this record"
        }
        action={
          <HeadBtn onClick={() => setModal("new")}>
            <Plus size={15} /> Add
          </HeadBtn>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : !tasks.length ? (
        <SoftEmpty
          icon={ListChecks}
          title="No tasks yet"
          text="Add things that need doing, like sending a quote."
          action={
            <button
              className="btn-secondary mt-3 py-1.5 text-[13px]"
              onClick={() => setModal("new")}
            >
              <Plus size={14} /> Add task
            </button>
          }
        />
      ) : (
        <ul className="space-y-1 p-2">
          {tasks.map((t) => {
            const done = t.status === "done";
            const [pc, pbg] = PRIO[t.priority] ?? PRIO.medium;
            const late = !done && t.due_at && isOverdue(t.due_at);
            return (
              <li
                key={t.id}
                className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <button
                  onClick={() => toggle.mutate(t)}
                  aria-label={done ? "Mark not done" : "Mark done"}
                  role="checkbox"
                  aria-checked={done}
                  className={clsx(
                    "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition",
                    done
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 hover:border-teal-500 hover:bg-teal-50",
                  )}
                >
                  {done && <Check size={13} strokeWidth={3} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={clsx(
                      "truncate text-[14px] font-semibold",
                      done ? "text-slate-400 line-through" : "text-ink",
                    )}
                  >
                    {t.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
                    <span
                      className="rounded-full px-2 py-0.5 font-bold capitalize"
                      style={{ background: pbg, color: pc }}
                    >
                      {t.priority ?? "medium"}
                    </span>
                    <span
                      className={clsx(
                        "num",
                        late
                          ? "font-semibold text-amber-700"
                          : "text-slate-400",
                      )}
                    >
                      {t.due_at
                        ? `${late ? "Late · " : ""}${fmtDateTime(t.due_at)}`
                        : "No due date"}
                    </span>
                    {t.assignee && (
                      <span className="text-slate-400">
                        · {t.assignee.full_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                  <button
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
                    title="Edit"
                    aria-label={`Edit ${t.title}`}
                    onClick={() => setModal(t)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                    title="Delete"
                    aria-label={`Delete ${t.title}`}
                    onClick={() => del.mutate(t.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "new" ? "New task" : "Edit task"}
      >
        {modal && (
          <TaskForm
            task={modal === "new" ? undefined : modal}
            leadId={parent.lead_id}
            clientId={parent.client_id}
            onDone={() => {
              setModal(null);
              inval();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

// ---------------- Documents ----------------
const fileKind = (mime, name) => {
  const ext = String(name || "")
    .split(".")
    .pop()
    .toLowerCase();
  if (
    mime?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
  )
    return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime?.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext))
    return "video";
  return "file";
};
const KIND_STYLE = {
  image: { icon: ImageIcon, fg: "#7C3AED", bg: "#EDE9FE" },
  pdf: { icon: FileText, fg: "#DC2626", bg: "#FEE2E2" },
  video: { icon: Film, fg: "#DB2777", bg: "#FCE7F3" },
  file: { icon: FileText, fg: "#0284C7", bg: "#E0F2FE" },
};
const sizeText = (b) =>
  !b
    ? ""
    : b > 1024 * 1024
      ? `${(b / 1024 / 1024).toFixed(1)} MB`
      : `${Math.max(1, Math.round(b / 1024))} KB`;
/** Short-lived signed link for a document (refreshed before it expires). */
function useDocUrl(id, enabled = true) {
  return useQuery({
    queryKey: ["doc_url", id],
    queryFn: () => getDocumentUrl(id),
    enabled: !!id && enabled,
    staleTime: 8 * 60_000,
    gcTime: 9 * 60_000,
    refetchInterval: 8 * 60_000,
  });
}
async function downloadDoc(d) {
  try {
    const url = await getDocumentUrl(d.id);
    const a = document.createElement("a");
    a.href = `${url}&download=1`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    toast.error(errMsg(e));
  }
}

function DocTile({ d, onOpen }) {
  const kind = fileKind(d.mime_type, d.name);
  const url = useDocUrl(d.id, kind === "image");
  const [failed, setFailed] = useState(false);
  const st = KIND_STYLE[kind];
  const ext = (d.name.split(".").pop() || "").slice(0, 4).toUpperCase();
  return (
    <button
      type="button"
      onClick={() => onOpen(d)}
      className="group overflow-hidden rounded-xl border border-mist-2 bg-white text-left transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-teal-500/20"
      title={d.name}
    >
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        style={{ background: kind === "image" && !failed ? "#EEF2F6" : st.bg }}
      >
        {kind === "image" && url.data && !failed ? (
          <img
            src={url.data}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : kind === "image" && !failed ? (
          <Loader2 size={20} className="animate-spin text-slate-400" />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card"
              style={{ color: st.fg }}
            >
              <st.icon size={21} />
            </span>
            {ext && (
              <span
                className="text-[11px] font-extrabold tracking-wide"
                style={{ color: st.fg }}
              >
                {failed ? "MISSING" : ext}
              </span>
            )}
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/30 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-card">
            <Eye size={14} /> Preview
          </span>
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold text-ink">{d.name}</p>
        <p className="truncate text-[11.5px] text-slate-500">
          {[sizeText(d.size_bytes), fmtRelative(d.created_at)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </button>
  );
}

/** Full-screen viewer: photos, PDFs and videos open inside the CRM. */
function DocPreview({ doc, canDelete, onDelete, onClose }) {
  const kind = fileKind(doc.mime_type, doc.name);
  const url = useDocUrl(doc.id);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  // check once that the file still exists (old uploads may be gone)
  useEffect(() => {
    if (!url.data) return;
    let stop = false;
    fetch(url.data, { method: "HEAD" })
      .then((r) => !stop && setMissing(r.status === 404))
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, [url.data]);
  const st = KIND_STYLE[kind];
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink-950/90 backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-label={`Preview ${doc.name}`}
    >
      <div
        className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"
          style={{ color: st.bg }}
        >
          <st.icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{doc.name}</p>
          <p className="truncate text-xs text-slate-400">
            {[
              sizeText(doc.size_bytes),
              doc.uploader?.full_name,
              fmtRelative(doc.created_at),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button
          className="btn border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
          onClick={() => downloadDoc(doc)}
          disabled={missing}
        >
          <Download size={15} />{" "}
          <span className="hidden sm:inline">Download</span>
        </button>
        {url.data && !missing && (
          <a
            className="btn border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
            href={url.data}
            target="_blank"
            rel="noreferrer"
            title="Open in new tab"
          >
            <ExternalLink size={15} />
          </a>
        )}
        {canDelete && (
          <button
            className="btn border border-white/15 bg-white/10 px-3 py-2 text-red-300 hover:bg-red-500/20"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        )}
        <button
          className="btn px-2.5 py-2 text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X size={20} />
        </button>
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        {!url.data ? (
          <Loader2 size={28} className="animate-spin text-white/70" />
        ) : missing ? (
          <div
            className="max-w-sm rounded-2xl bg-white p-8 text-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <FileText size={22} />
            </span>
            <h3 className="mt-3 text-lg font-bold text-ink">
              This file is no longer available
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              It was saved on an older server copy and has been removed. Please
              delete this entry and upload the file again.
            </p>
          </div>
        ) : kind === "image" ? (
          <img
            src={url.data}
            alt={doc.name}
            className="max-h-full max-w-full rounded-lg object-contain shadow-pop"
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : kind === "pdf" ? (
          <iframe
            title={doc.name}
            src={url.data}
            className="h-full w-full max-w-5xl rounded-lg bg-white shadow-pop"
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : kind === "video" ? (
          <video
            src={url.data}
            controls
            className="max-h-full max-w-full rounded-lg shadow-pop"
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="max-w-sm rounded-2xl bg-white p-8 text-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: st.bg, color: st.fg }}
            >
              <st.icon size={22} />
            </span>
            <h3 className="mt-3 break-all text-base font-bold text-ink">
              {doc.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              This type of file can't be previewed here. Download it to open it
              on your computer.
            </p>
            <button
              className="btn-primary mt-5 w-full"
              onClick={() => downloadDoc(doc)}
            >
              <Download size={16} /> Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentsPanel(parent) {
  const qc = useQueryClient();
  const { isAdmin, profile } = useAuth();
  const q = useQuery({
    queryKey: ["documents", parent],
    queryFn: () => getDocuments(parent),
  });
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(null); // { done, total }
  const [drag, setDrag] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  async function onFiles(files) {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    const tooBig = list.filter((f) => f.size > 25 * 1024 * 1024);
    if (tooBig.length)
      toast.error(
        `${tooBig.map((f) => f.name).join(", ")} is larger than 25 MB`,
      );
    const ok = list.filter((f) => f.size <= 25 * 1024 * 1024);
    if (!ok.length) return;
    let done = 0;
    let failed = 0;
    setBusy({ done, total: ok.length });
    for (const f of ok) {
      try {
        await uploadDocument(kindOf(parent), idOf(parent), f);
      } catch (e) {
        failed++;
        toast.error(`${f.name}: ${errMsg(e)}`);
      }
      setBusy({ done: ++done, total: ok.length });
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    if (done - failed > 0)
      toast.success(
        `Uploaded ${done - failed} file${done - failed > 1 ? "s" : ""}`,
      );
    qc.invalidateQueries({ queryKey: ["documents"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  }
  const del = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      setConfirmDel(null);
      setViewing(null);
      toast.success("Deleted");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const canDelete = (d) => isAdmin || d.uploaded_by === profile?.id;
  const docs = q.data ?? [];
  return (
    <div
      className={clsx(
        "card relative overflow-hidden transition-colors",
        drag && "border-teal-400 ring-4 ring-teal-500/15",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) =>
        !e.currentTarget.contains(e.relatedTarget) && setDrag(false)
      }
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      <PanelHead
        icon={FolderOpen}
        title="Documents"
        count={docs.length}
        color="#2563EB"
        bg="#DBEAFE"
        sub="Photos, PDFs and files for this record"
        action={
          <label
            className={clsx(
              "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-teal-700 transition hover:bg-slate-100",
              busy && "pointer-events-none opacity-50",
            )}
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {busy
              ? `Uploading ${Math.min(busy.done + 1, busy.total)}/${busy.total}…`
              : "Upload"}
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
        }
      />
      <div className="p-4">
        {q.isLoading ? (
          <Spinner />
        ) : !docs.length ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-mist-3 px-4 py-8 text-center transition-colors hover:border-teal-300 hover:bg-teal-50/40"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Upload size={21} />
            </span>
            <span className="mt-3 text-sm font-bold text-ink">
              Drop files here or click to upload
            </span>
            <span className="mt-0.5 text-xs text-slate-500">
              Photos, PDFs, Word, Excel, videos · up to 25 MB each
            </span>
          </button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {docs.map((d) => (
                <DocTile key={d.id} d={d} onOpen={setViewing} />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Click a file to preview · drag & drop to add more · max 25 MB each
            </p>
          </>
        )}
      </div>
      {drag && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-teal-50/90">
          <p className="flex items-center gap-2 text-sm font-bold text-teal-800">
            <Upload size={18} /> Drop to upload
          </p>
        </div>
      )}
      {viewing && (
        <DocPreview
          key={viewing.id}
          doc={viewing}
          canDelete={canDelete(viewing)}
          onDelete={() => setConfirmDel(viewing)}
          onClose={() => setViewing(null)}
        />
      )}
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Delete this file?"
      >
        <p className="break-all text-sm text-slate-600">
          <b className="text-ink">{confirmDel?.name}</b> will be deleted for
          everyone. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setConfirmDel(null)}>
            Cancel
          </button>
          <button
            className="btn-danger"
            disabled={del.isPending}
            onClick={() => del.mutate(confirmDel)}
          >
            {del.isPending && <Loader2 size={16} className="animate-spin" />}
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Payments (clients only) ----------------
export function PaymentsPanel({ clientId }) {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const q = useQuery({
    queryKey: ["payments", clientId],
    queryFn: () => getPayments(clientId),
  });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    amount: "",
    status: "pending",
    description: "",
    due_at: "",
  });
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["payments"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const add = useMutation({
    mutationFn: () =>
      createPayment({
        client_id: clientId,
        amount: Number(f.amount),
        status: f.status,
        description: f.description || null,
        due_at: f.due_at || null,
      }),
    onSuccess: () => {
      inval();
      setOpen(false);
      setF({ amount: "", status: "pending", description: "", due_at: "" });
      toast.success("Payment recorded");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }) => updatePayment(id, { status }),
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: deletePayment,
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const total = (q.data ?? []).reduce(
    (a, p) => a + (p.status === "paid" ? Number(p.amount) : 0),
    0,
  );
  const outstanding = (q.data ?? []).reduce(
    (a, p) =>
      a +
      (p.status === "pending" || p.status === "overdue" ? Number(p.amount) : 0),
    0,
  );
  return (
    <div className="card overflow-hidden">
      <PanelHead
        icon={Wallet}
        title="Payments"
        count={q.data?.length ?? 0}
        color="#16A34A"
        bg="#DCFCE7"
        sub={`Paid ${money(total)} · Outstanding ${money(outstanding)}`}
        action={
          <HeadBtn onClick={() => setOpen(true)}>
            <Plus size={15} /> Record
          </HeadBtn>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : !q.data?.length ? (
        <SoftEmpty
          icon={Wallet}
          title="No payments recorded"
          text="Record a deposit or payment to track what's been paid."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th>Due</th>
                <th>Paid</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {q.data.map((p) => (
                <tr key={p.id}>
                  <td>{p.description ?? "—"}</td>
                  <td className="text-right font-medium">
                    {money(p.amount, p.currency)}
                  </td>
                  <td>
                    <Select
                      className="w-32 py-1"
                      value={p.status}
                      onChange={(e) =>
                        setStatus.mutate({ id: p.id, status: e.target.value })
                      }
                      options={enumOptions(PAYMENT_STATUSES)}
                    />
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    {p.due_at ? fmtDate(p.due_at) : "—"}
                  </td>
                  <td className="text-xs">
                    {p.paid_at ? fmtDateTime(p.paid_at) : "—"}
                  </td>
                  <td>
                    {isAdmin && (
                      <button
                        className="btn-ghost p-1.5 text-amber-600"
                        onClick={() => del.mutate(p.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Record payment">
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <Field label="Amount (CAD) *">
            <Input
              type="number"
              min={0.01}
              step="0.01"
              required
              value={f.amount}
              onChange={(e) => setF({ ...f, amount: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value })}
              options={enumOptions(PAYMENT_STATUSES)}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Input
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              placeholder="Deposit, final balance…"
            />
          </Field>
          <Field label="Due date">
            <Input
              type="date"
              value={f.due_at}
              onChange={(e) => setF({ ...f, due_at: e.target.value })}
            />
          </Field>
          <div className="flex items-end justify-end">
            <button className="btn-primary" disabled={add.isPending}>
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ---------------- Contact quick actions ----------------
export function ContactActions({ phone, email, dark }) {
  const wa = phone ? `https://wa.me/${phone.replace(/[^\d]/g, "")}` : null;
  const cls = dark
    ? "inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
    : "btn-secondary py-1.5";
  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <a href={`tel:${phone}`} className={cls}>
          <Phone size={15} /> Call
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className={cls}>
          <MessageCircle size={15} className={dark ? "text-[#4ADE80]" : ""} />{" "}
          WhatsApp
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={cls}>
          <Mail size={15} /> Email
        </a>
      )}
      {!phone && !email && (
        <span
          className={
            dark ? "text-[13px] text-white/60" : "text-[13px] text-slate-400"
          }
        >
          No phone or email saved
        </span>
      )}
    </div>
  );
}

// ---------------- Notes attached to a record ----------------
export function NotesPanel(parent) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notes", parent],
    queryFn: () => getNotes(parent),
  });
  const [editing, setEditing] = useState(null);
  return (
    <div className="card overflow-hidden">
      <PanelHead
        icon={NotebookPen}
        title="Notes"
        count={q.data?.length ?? 0}
        color="#9333EA"
        bg="#F3E8FF"
        sub="Sticky notes about this record"
        action={
          <HeadBtn color="#9333EA" onClick={() => setEditing("new")}>
            <Plus size={15} /> Add
          </HeadBtn>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : !q.data?.length ? (
        <SoftEmpty
          icon={NotebookPen}
          title="No notes yet"
          text="Keep details like preferences or budget here."
        />
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {q.data.map((n) => {
            const [bg, fg] = NOTE_BG[n.color] ?? NOTE_BG.yellow;
            return (
              <button
                key={n.id}
                onClick={() => setEditing(n)}
                className="rounded-xl p-3 text-left transition hover:-translate-y-0.5"
                style={{ background: bg }}
              >
                <div className="text-sm font-bold" style={{ color: fg }}>
                  {n.title || "Untitled"}
                </div>
                {n.body && (
                  <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[13px] text-slate-700">
                    {n.body}
                  </p>
                )}
                <div className="mt-2 text-[11px] text-slate-500">
                  {n.owner?.full_name} · {fmtRelative(n.updated_at)}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New note" : "Edit note"}
        wide
      >
        {editing && (
          <NoteEditor
            note={editing === "new" ? undefined : editing}
            leadId={parent.lead_id}
            clientId={parent.client_id}
            onDone={() => {
              setEditing(null);
              qc.invalidateQueries({ queryKey: ["notes"] });
            }}
          />
        )}
      </Modal>
    </div>
  );
}
