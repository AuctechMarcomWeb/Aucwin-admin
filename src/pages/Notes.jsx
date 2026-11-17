// import { useEffect, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
// import toast from "react-hot-toast";
// import clsx from "clsx";
// import { Plus, Pin, PinOff, Trash2, Search, Link2 } from "lucide-react";
// import {
//   createNote,
//   deleteNote,
//   getLeads,
//   getClients,
//   getNotes,
//   updateNote,
// } from "@/lib/api";
// import { errMsg } from "@/lib/http";
// import { NOTE_COLORS } from "@/lib/types";
// import {
//   Empty,
//   Modal,
//   Spinner,
//   fmtRelative,
//   Field,
//   Select,
// } from "@/components/ui";
// import { ModuleHeader } from "@/components/Layout";

// export const NOTE_BG = {
//   yellow: ["#FEF9C3", "#A16207"],
//   pink: ["#FCE7F3", "#BE185D"],
//   blue: ["#DBEAFE", "#1D4ED8"],
//   green: ["#DCFCE7", "#15803D"],
//   purple: ["#F3E8FF", "#7E22CE"],
//   orange: ["#FFEDD5", "#C2410C"],
// };

// export default function NotesPage() {
//   const qc = useQueryClient();
//   const [search, setSearch] = useState("");
//   const q = useQuery({
//     queryKey: ["notes", search],
//     queryFn: () => getNotes({ search }),
//     placeholderData: (p) => p,
//   });
//   const [editing, setEditing] = useState(null);
//   const inval = () => {
//     qc.invalidateQueries({ queryKey: ["notes"] });
//     qc.invalidateQueries({ queryKey: ["module_counts"] });
//   };
//   const pin = useMutation({
//     mutationFn: (n) => updateNote(n.id, { pinned: !n.pinned }),
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const del = useMutation({
//     mutationFn: deleteNote,
//     onSuccess: () => {
//       inval();
//       setEditing(null);
//       toast.success("Note deleted");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });

//   return (
//     <div>
//       <ModuleHeader
//         moduleKey="notes"
//         title="Notes"
//         subtitle="Quick notes for yourself, pinned to the top, or attached to a lead or client."
//         actions={
//           <button
//             className="btn-primary"
//             style={{ background: "#9333EA" }}
//             onClick={() => setEditing("new")}
//           >
//             <Plus size={16} /> New note
//           </button>
//         }
//       />
//       <div className="relative mb-5 max-w-md">
//         <Search
//           size={16}
//           className="pointer-events-none absolute left-3 top-3 text-slate-400"
//         />
//         <input
//           className="input pl-9"
//           placeholder="Search notes…"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>
//       {q.isLoading ? (
//         <Spinner />
//       ) : !q.data?.length ? (
//         <div className="card">
//           <Empty
//             title="No notes yet"
//             hint="Notes are great for pricing sheets, scripts, or things to remember about a client."
//           />
//         </div>
//       ) : (
//         <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
//           {q.data.map((n) => {
//             const [bg, fg] = NOTE_BG[n.color] ?? NOTE_BG.yellow;
//             return (
//               <article
//                 key={n.id}
//                 onClick={() => setEditing(n)}
//                 className="group mb-4 break-inside-avoid cursor-pointer rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-pop"
//                 style={{ background: bg }}
//               >
//                 <div className="flex items-start justify-between gap-2">
//                   <h3
//                     className="text-[15px] font-bold leading-snug"
//                     style={{ color: fg }}
//                   >
//                     {n.title || "Untitled"}
//                   </h3>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       pin.mutate(n);
//                     }}
//                     className={clsx(
//                       "rounded-md p-1 transition",
//                       n.pinned
//                         ? "opacity-100"
//                         : "opacity-0 group-hover:opacity-100",
//                     )}
//                     style={{ color: fg }}
//                     aria-label={n.pinned ? "Unpin" : "Pin"}
//                   >
//                     {n.pinned ? (
//                       <Pin size={15} fill="currentColor" />
//                     ) : (
//                       <PinOff size={15} />
//                     )}
//                   </button>
//                 </div>
//                 {n.body && (
//                   <p className="mt-2 line-clamp-8 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">
//                     {n.body}
//                   </p>
//                 )}
//                 <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
//                   <span>
//                     {n.owner?.full_name ?? ""} · {fmtRelative(n.updated_at)}
//                   </span>
//                   {(n.lead || n.client) && (
//                     <Link
//                       onClick={(e) => e.stopPropagation()}
//                       to={
//                         n.lead
//                           ? `/leads/${n.lead.id}`
//                           : `/clients/${n.client.id}`
//                       }
//                       className="inline-flex items-center gap-1 font-semibold hover:underline"
//                       style={{ color: fg }}
//                     >
//                       <Link2 size={12} /> {n.lead?.name ?? n.client?.name}
//                     </Link>
//                   )}
//                 </div>
//               </article>
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
//             onDone={() => {
//               setEditing(null);
//               inval();
//             }}
//             onDelete={
//               editing !== "new" ? () => del.mutate(editing.id) : undefined
//             }
//           />
//         )}
//       </Modal>
//     </div>
//   );
// }

// export function NoteEditor({ note, leadId, clientId, onDone, onDelete }) {
//   const [f, setF] = useState({
//     title: note?.title ?? "",
//     body: note?.body ?? "",
//     color: note?.color ?? "yellow",
//     pinned: note?.pinned ?? false,
//     lead_id: note?.lead_id ?? leadId ?? "",
//     client_id: note?.client_id ?? clientId ?? "",
//   });
//   const leads = useQuery({
//     queryKey: ["leads", "picker"],
//     queryFn: () => getLeads({ pageSize: 200 }),
//     enabled: !leadId && !clientId,
//   });
//   const clients = useQuery({
//     queryKey: ["clients", "picker"],
//     queryFn: () => getClients(),
//     enabled: !leadId && !clientId,
//   });
//   const m = useMutation({
//     mutationFn: () => {
//       const payload = {
//         ...f,
//         lead_id: f.lead_id || null,
//         client_id: f.client_id || null,
//       };
//       return note ? updateNote(note.id, payload) : createNote(payload);
//     },
//     onSuccess: () => {
//       toast.success(note ? "Saved" : "Note added");
//       onDone();
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   useEffect(() => {
//     const t = setTimeout(() => {
//       if (note && (f.title !== note.title || f.body !== note.body))
//         updateNote(note.id, { title: f.title, body: f.body }).catch(() => {});
//     }, 1200);
//     return () => clearTimeout(t);
//   }, [f.title, f.body, note]);
//   const [bg] = NOTE_BG[f.color];
//   return (
//     <div
//       className="-mx-6 -mb-6 -mt-2 rounded-b-2xl p-6"
//       style={{ background: bg }}
//     >
//       <input
//         value={f.title}
//         onChange={(e) => setF({ ...f, title: e.target.value })}
//         placeholder="Title"
//         className="w-full bg-transparent text-xl font-bold text-ink placeholder:text-slate-400 focus:outline-none"
//         autoFocus
//       />
//       <textarea
//         value={f.body}
//         onChange={(e) => setF({ ...f, body: e.target.value })}
//         placeholder="Write your note…"
//         rows={8}
//         className="mt-2 w-full resize-y bg-transparent text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
//       />
//       <div className="mt-3 flex flex-wrap items-center gap-3">
//         <div className="flex gap-1.5">
//           {NOTE_COLORS.map((c) => (
//             <button
//               type="button"
//               key={c}
//               onClick={() => setF({ ...f, color: c })}
//               aria-label={c}
//               className={clsx(
//                 "h-6 w-6 rounded-full border-2 transition",
//                 f.color === c ? "scale-110 border-ink" : "border-white",
//               )}
//               style={{ background: NOTE_BG[c][1] }}
//             />
//           ))}
//         </div>
//         <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
//           <input
//             type="checkbox"
//             checked={f.pinned}
//             onChange={(e) => setF({ ...f, pinned: e.target.checked })}
//           />{" "}
//           Pin to top
//         </label>
//       </div>
//       {!leadId && !clientId && (
//         <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
//           <Field label="Attach to a lead">
//             <Select
//               value={f.lead_id}
//               onChange={(e) =>
//                 setF({
//                   ...f,
//                   lead_id: e.target.value,
//                   client_id: e.target.value ? "" : f.client_id,
//                 })
//               }
//               options={(leads.data?.rows ?? []).map((l) => ({
//                 value: l.id,
//                 label: l.name,
//               }))}
//               placeholder="None"
//             />
//           </Field>
//           <Field label="…or a client">
//             <Select
//               value={f.client_id}
//               onChange={(e) =>
//                 setF({
//                   ...f,
//                   client_id: e.target.value,
//                   lead_id: e.target.value ? "" : f.lead_id,
//                 })
//               }
//               options={(clients.data ?? []).map((c) => ({
//                 value: c.id,
//                 label: c.name,
//               }))}
//               placeholder="None"
//             />
//           </Field>
//         </div>
//       )}
//       <div className="mt-4 flex items-center justify-between">
//         {onDelete ? (
//           <button
//             type="button"
//             className="btn-ghost text-amber-600"
//             onClick={onDelete}
//           >
//             <Trash2 size={15} /> Delete
//           </button>
//         ) : (
//           <span />
//         )}
//         <button
//           className="btn-primary"
//           style={{ background: "#9333EA" }}
//           onClick={() => m.mutate()}
//           disabled={m.isPending || (!f.title.trim() && !f.body.trim())}
//         >
//           {note ? "Save" : "Add note"}
//         </button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  Briefcase,
  Check,
  Loader2,
  Pin,
  Plus,
  Search,
  StickyNote,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  createNote,
  deleteNote,
  getLeads,
  getClients,
  getNotes,
  updateNote,
} from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { NOTE_COLORS } from "@/lib/types";
import {
  Avatar,
  Field,
  Modal,
  Select,
  Spinner,
  fmtRelative,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";

/** [soft background, strong colour, label] for each note colour. */
export const NOTE_BG = {
  yellow: ["#FEF9C3", "#CA8A04", "Yellow"],
  pink: ["#FCE7F3", "#DB2777", "Pink"],
  blue: ["#DBEAFE", "#2563EB", "Blue"],
  green: ["#DCFCE7", "#16A34A", "Green"],
  purple: ["#F3E8FF", "#9333EA", "Purple"],
  orange: ["#FFEDD5", "#EA580C", "Orange"],
};

const FILTERS = [
  { key: "all", label: "All notes" },
  { key: "pinned", label: "Pinned" },
  { key: "mine", label: "Mine" },
  { key: "linked", label: "Linked to a lead / client" },
];

export default function NotesPage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [color, setColor] = useState("");
  const q = useQuery({
    queryKey: ["notes", search],
    queryFn: () => getNotes({ search }),
    placeholderData: (p) => p,
  });
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["notes"] });
    qc.invalidateQueries({ queryKey: ["module_counts"] });
  };
  const pin = useMutation({
    mutationFn: (n) => updateNote(n.id, { pinned: !n.pinned }),
    onSuccess: (_d, n) => {
      inval();
      toast.success(n.pinned ? "Unpinned" : "Pinned to the top");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      inval();
      setEditing(null);
      setConfirmDel(null);
      toast.success("Note deleted");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const all = q.data ?? [];
  const shown = useMemo(
    () =>
      all.filter(
        (n) =>
          (filter === "all" ||
            (filter === "pinned" && n.pinned) ||
            (filter === "mine" && n.assigned_to === profile?.id) ||
            (filter === "linked" && (n.lead_id || n.client_id))) &&
          (!color || n.color === color),
      ),
    [all, filter, color, profile?.id],
  );
  const pinned = shown.filter((n) => n.pinned);
  const others = shown.filter((n) => !n.pinned);
  const count = (key) =>
    key === "all"
      ? all.length
      : key === "pinned"
        ? all.filter((n) => n.pinned).length
        : key === "mine"
          ? all.filter((n) => n.assigned_to === profile?.id).length
          : all.filter((n) => n.lead_id || n.client_id).length;

  const grid = (list) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {list.map((n) => (
        <NoteCard
          key={n.id}
          n={n}
          onOpen={() => setEditing(n)}
          onPin={() => pin.mutate(n)}
          onDelete={() => setConfirmDel(n)}
        />
      ))}
    </div>
  );

  return (
    <div>
      <ModuleHeader
        moduleKey="notes"
        title="Notes"
        subtitle="Quick notes for yourself, pinned to the top, or attached to a lead or client."
        actions={
          <button className="btn-primary" onClick={() => setEditing("new")}>
            <Plus size={16} /> New note
          </button>
        }
      />

      {/* ---------- toolbar ---------- */}
      <div className="card mb-6 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-9 pr-9"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-ink"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                filter === f.key
                  ? "bg-ink text-white"
                  : "text-slate-600 hover:bg-mist hover:text-ink",
              )}
            >
              {f.label}
              <span
                className={clsx(
                  "rounded-full px-1.5 text-[11px] num",
                  filter === f.key ? "bg-white/20" : "bg-mist-2 text-slate-500",
                )}
              >
                {count(f.key)}
              </span>
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-1.5"
          aria-label="Filter by colour"
        >
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(color === c ? "" : c)}
              title={NOTE_BG[c][2]}
              aria-label={`Only ${NOTE_BG[c][2]} notes`}
              className={clsx(
                "flex h-6 w-6 items-center justify-center rounded-full ring-offset-2 transition",
                color === c && "ring-2 ring-ink",
              )}
              style={{ background: NOTE_BG[c][1] }}
            >
              {color === c && (
                <Check size={13} className="text-white" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- notes ---------- */}
      {q.isLoading ? (
        <Spinner />
      ) : !all.length ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600"
            style={{ background: "#F3E8FF", color: "#9333EA" }}
          >
            <StickyNote size={26} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink">
            {search ? "No notes match your search" : "No notes yet"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Keep pricing sheets, call scripts or things to remember about a
            client here.
          </p>
          {!search && (
            <button
              className="btn-primary mt-5"
              onClick={() => setEditing("new")}
            >
              <Plus size={16} /> Write your first note
            </button>
          )}
        </div>
      ) : !shown.length ? (
        <div className="card px-6 py-12 text-center text-sm text-slate-500">
          No notes in this view.{" "}
          <button
            className="font-semibold text-teal-700 hover:underline"
            onClick={() => {
              setFilter("all");
              setColor("");
            }}
          >
            Show all notes
          </button>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <section className="mb-7">
              <h2 className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-slate-500">
                <Pin size={13} /> Pinned
              </h2>
              {grid(pinned)}
            </section>
          )}
          {others.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[.12em] text-slate-500">
                  Other notes
                </h2>
              )}
              {grid(others)}
            </section>
          )}
        </>
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
            onDone={() => {
              setEditing(null);
              inval();
            }}
            onDelete={
              editing !== "new" ? () => setConfirmDel(editing) : undefined
            }
          />
        )}
      </Modal>
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Delete this note?"
      >
        <p className="text-sm text-slate-600">
          <b className="text-ink">{confirmDel?.title || "Untitled note"}</b>{" "}
          will be deleted. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setConfirmDel(null)}>
            Cancel
          </button>
          <button
            className="btn-danger"
            disabled={del.isPending}
            onClick={() => del.mutate(confirmDel.id)}
          >
            {del.isPending && <Loader2 size={16} className="animate-spin" />}
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

/** One note: coloured card. All cards in a row are the same height; name and date sit at the bottom. */
function NoteCard({ n, onOpen, onPin, onDelete }) {
  const [soft, strong] = NOTE_BG[n.color] ?? NOTE_BG.yellow;
  const linked = n.lead || n.client;
  return (
    <article
      onClick={onOpen}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())
      }
      tabIndex={0}
      role="button"
      aria-label={`Open note ${n.title || "Untitled"}`}
      className="group flex min-h-[170px] cursor-pointer flex-col rounded-2xl p-4 shadow-[0_1px_2px_rgba(15,47,88,.06)] ring-1 ring-black/[.04] transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-teal-500/30"
      style={{ background: soft }}
    >
      <div className="flex items-start gap-2">
        <h3
          className="line-clamp-2 min-w-0 flex-1 text-[15.5px] font-bold leading-snug"
          style={{ color: strong }}
        >
          {n.title || "Untitled"}
        </h3>
        <div className="-mr-1 -mt-1 flex shrink-0 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            title={n.pinned ? "Unpin" : "Pin to top"}
            aria-label={n.pinned ? "Unpin" : "Pin to top"}
            className={clsx(
              "rounded-lg p-1.5 transition hover:bg-white/70",
              n.pinned
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus:opacity-100",
            )}
            style={{ color: strong }}
          >
            <Pin size={15} fill={n.pinned ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
            aria-label="Delete note"
            className="rounded-lg p-1.5 text-slate-500 opacity-0 transition hover:bg-white/70 hover:text-amber-700 group-hover:opacity-100 focus:opacity-100"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {n.body && (
        <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">
          {n.body}
        </p>
      )}
      {/* bottom row always at the bottom of the card */}
      <div className="mt-auto pt-3">
        {linked && (
          <Link
            onClick={(e) => e.stopPropagation()}
            to={n.lead ? `/leads/${n.lead.id}` : `/clients/${n.client.id}`}
            className="mb-2.5 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white/70 px-2 py-1 text-[12px] font-semibold transition hover:bg-white"
            style={{ color: strong }}
          >
            {n.lead ? <UserRound size={12} /> : <Briefcase size={12} />}
            <span className="truncate">
              {n.lead ? "Lead" : "Client"} · {linked.name}
            </span>
          </Link>
        )}
        <div className="flex items-center gap-2 border-t border-black/[.06] pt-2.5 text-[12px] text-slate-600">
          <Avatar name={n.owner?.full_name} size={20} />
          <span className="truncate font-medium">
            {n.owner?.full_name ?? "—"}
          </span>
          <span className="ml-auto shrink-0 text-slate-500">
            {fmtRelative(n.updated_at)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function NoteEditor({ note, leadId, clientId, onDone, onDelete }) {
  const [f, setF] = useState({
    title: note?.title ?? "",
    body: note?.body ?? "",
    color: note?.color ?? "yellow",
    pinned: note?.pinned ?? false,
    lead_id: note?.lead_id ?? leadId ?? "",
    client_id: note?.client_id ?? clientId ?? "",
  });
  const leads = useQuery({
    queryKey: ["leads", "picker"],
    queryFn: () => getLeads({ pageSize: 200 }),
    enabled: !leadId && !clientId,
  });
  const clients = useQuery({
    queryKey: ["clients", "picker"],
    queryFn: () => getClients(),
    enabled: !leadId && !clientId,
  });
  const m = useMutation({
    mutationFn: () => {
      const payload = {
        ...f,
        lead_id: f.lead_id || null,
        client_id: f.client_id || null,
      };
      return note ? updateNote(note.id, payload) : createNote(payload);
    },
    onSuccess: () => {
      toast.success(note ? "Note saved" : "Note added");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const [soft, strong] = NOTE_BG[f.color] ?? NOTE_BG.yellow;
  const empty = !f.title.trim() && !f.body.trim();

  // Ctrl/Cmd + Enter saves
  useEffect(() => {
    const onKey = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        !empty &&
        !m.isPending
      )
        m.mutate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [empty, m]);

  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border border-mist-2 transition-colors"
        style={{ background: soft }}
      >
        <div className="h-1.5" style={{ background: strong }} />
        <div className="p-4">
          <input
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="Title"
            maxLength={120}
            className="w-full bg-transparent text-xl font-bold text-ink placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <textarea
            value={f.body}
            onChange={(e) => setF({ ...f, body: e.target.value })}
            placeholder="Write your note…"
            rows={8}
            className="mt-2 w-full resize-y bg-transparent text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-600">
            Colour
          </span>
          {NOTE_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setF({ ...f, color: c })}
              aria-label={NOTE_BG[c][2]}
              title={NOTE_BG[c][2]}
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition",
                f.color === c ? "ring-2 ring-ink" : "hover:scale-110",
              )}
              style={{ background: NOTE_BG[c][1] }}
            >
              {f.color === c && (
                <Check size={14} className="text-white" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setF({ ...f, pinned: !f.pinned })}
          className={clsx(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors",
            f.pinned
              ? "border-teal-200 bg-teal-50 text-teal-800"
              : "border-mist-3 bg-white text-slate-600 hover:text-ink",
          )}
          aria-pressed={f.pinned}
        >
          <Pin size={14} fill={f.pinned ? "currentColor" : "none"} />
          {f.pinned ? "Pinned to top" : "Pin to top"}
        </button>
      </div>

      {!leadId && !clientId && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Attach to a lead (optional)">
            <Select
              value={f.lead_id}
              onChange={(e) =>
                setF({
                  ...f,
                  lead_id: e.target.value,
                  client_id: e.target.value ? "" : f.client_id,
                })
              }
              options={(leads.data?.rows ?? []).map((l) => ({
                value: l.id,
                label: l.name,
              }))}
              placeholder="None"
            />
          </Field>
          <Field label="…or a client (optional)">
            <Select
              value={f.client_id}
              onChange={(e) =>
                setF({
                  ...f,
                  client_id: e.target.value,
                  lead_id: e.target.value ? "" : f.lead_id,
                })
              }
              options={(clients.data ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              placeholder="None"
            />
          </Field>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-mist-2 pt-4">
        {onDelete ? (
          <button
            type="button"
            className="btn-ghost text-amber-700 hover:bg-amber-50 hover:text-amber-700"
            onClick={onDelete}
          >
            <Trash2 size={15} /> Delete
          </button>
        ) : (
          <span className="hidden text-xs text-slate-400 sm:block">
            Tip: Ctrl + Enter to save
          </span>
        )}
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onDone}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => m.mutate()}
            disabled={m.isPending || empty}
          >
            {m.isPending && <Loader2 size={16} className="animate-spin" />}
            {note ? "Save note" : "Add note"}
          </button>
        </div>
      </div>
    </div>
  );
}
