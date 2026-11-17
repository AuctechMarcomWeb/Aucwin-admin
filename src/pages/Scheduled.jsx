// Reminders and Meetings share one list implementation (both are follow_ups rows of a given type).
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";
import { deleteFollowUp, getFollowUps, getProfiles } from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import {
  Avatar,
  Modal,
  Spinner,
  fmtDateTime,
  isOverdue,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { FollowUpForm } from "@/components/forms";
import { CompleteFollowUpModal } from "@/components/panels";
import { MODULES } from "@/lib/modules";

export function Reminders() {
  return <ScheduledList type="reminder" moduleKey="reminders" />;
}
export function Meetings() {
  return <ScheduledList type="meeting" moduleKey="meetings" />;
}

const timeOf = (iso) => fmtDateTime(iso).split("· ")[1];
const sameDay = (a, b) => a.toDateString() === b.toDateString();

function ScheduledList({ type, moduleKey }) {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const mod = MODULES.find((m) => m.key === moduleKey);
  const word = type === "reminder" ? "reminder" : "meeting";
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: ["follow_ups", "scheduled", type],
    queryFn: () => getFollowUps({ type }),
  });
  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: isAdmin && type === "meeting",
  });
  const nameOf = (id) =>
    profiles.data?.find((p) => p.id === id)?.full_name ?? "";
  const [modal, setModal] = useState(null);
  const [complete, setComplete] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["follow_ups"] });
    qc.invalidateQueries({ queryKey: ["calendar"] });
    qc.invalidateQueries({ queryKey: ["module_counts"] });
  };
  const del = useMutation({
    mutationFn: deleteFollowUp,
    onSuccess: () => {
      inval();
      setConfirmDel(null);
      toast.success("Deleted");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const all = q.data ?? [];
  const now = new Date();
  const counts = useMemo(() => {
    const pending = all.filter((f) => f.status === "pending");
    return {
      overdue: pending.filter((f) => isOverdue(f.due_at)).length,
      today: pending.filter(
        (f) => sameDay(new Date(f.due_at), new Date()) && !isOverdue(f.due_at),
      ).length,
      upcoming: pending.filter((f) => !isOverdue(f.due_at)).length,
      done: all.filter((f) => f.status !== "pending").length,
    };
  }, [all]);

  const term = search.trim().toLowerCase();
  const rows = all
    .filter((f) =>
      tab === "upcoming"
        ? f.status === "pending" && !isOverdue(f.due_at)
        : tab === "overdue"
          ? f.status === "pending" && isOverdue(f.due_at)
          : f.status !== "pending",
    )
    .filter(
      (f) =>
        !term ||
        [
          f.title,
          f.notes,
          f.location,
          f.lead?.name,
          f.client?.name,
          f.assignee?.full_name,
        ].some((v) => (v ?? "").toLowerCase().includes(term)),
    )
    .sort((a, b) =>
      tab === "past"
        ? new Date(b.due_at) - new Date(a.due_at)
        : new Date(a.due_at) - new Date(b.due_at),
    );
  const groups = groupByDay(rows);

  const STATS = [
    {
      key: "overdue",
      label: "Overdue",
      value: counts.overdue,
      icon: AlertTriangle,
      tone: "text-amber-700 bg-amber-50",
      ring: "ring-amber-600/30",
    },
    {
      key: "today",
      label: "Due today",
      value: counts.today,
      icon: Clock,
      tone: "text-teal-700 bg-teal-50",
      ring: "ring-teal-500/30",
      tab: "upcoming",
    },
    {
      key: "upcoming",
      label: "Upcoming",
      value: counts.upcoming,
      icon: CalendarClock,
      tone: "text-[#2563EB] bg-[#DBEAFE]",
      ring: "ring-[#2563EB]/25",
    },
    {
      key: "past",
      label: "Done & past",
      value: counts.done,
      icon: CheckCircle2,
      tone: "text-moss-700 bg-moss-50",
      ring: "ring-moss-600/25",
    },
  ];
  const TABS = [
    { key: "upcoming", label: "Upcoming", n: counts.upcoming },
    { key: "overdue", label: "Overdue", n: counts.overdue },
    { key: "past", label: "Done & past", n: counts.done },
  ];

  return (
    <div>
      <ModuleHeader
        moduleKey={moduleKey}
        subtitle={
          type === "reminder"
            ? "Personal and team reminders, with push notifications on mobile."
            : "Meetings with time, place, video link and attendees."
        }
        actions={
          <button className="btn-primary" onClick={() => setModal("new")}>
            <Plus size={16} /> New {word}
          </button>
        }
      />

      {/* ---------- summary ---------- */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => {
          const target = s.tab ?? s.key;
          const on = tab === target && s.key !== "today";
          return (
            <button
              key={s.key}
              onClick={() => setTab(target)}
              className={clsx(
                "card flex items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift",
                on && `ring-2 ${s.ring}`,
              )}
            >
              <span
                className={clsx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  s.tone,
                )}
              >
                <s.icon size={20} />
              </span>
              <span>
                <span className="block text-2xl font-extrabold leading-none text-ink num">
                  {q.isLoading ? "–" : s.value}
                </span>
                <span className="mt-1 block text-[13px] font-medium text-slate-500">
                  {s.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- tabs + search ---------- */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-mist-2 p-1 sm:flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "inline-flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-lg px-1.5 py-2 text-center text-[12.5px] font-semibold leading-tight transition sm:flex-none sm:flex-nowrap sm:gap-2 sm:whitespace-nowrap sm:px-4 sm:text-sm",
                tab === t.key
                  ? "bg-white text-ink shadow-card"
                  : "text-slate-600 hover:text-ink",
              )}
            >
              {t.label}
              <span
                className={clsx(
                  "rounded-full px-1.5 text-[11px] font-bold num",
                  t.key === "overdue" && t.n
                    ? "bg-amber-600 text-white"
                    : tab === t.key
                      ? "bg-mist-2 text-slate-600"
                      : "bg-white/70 text-slate-500",
                )}
              >
                {t.n}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-9 pr-9"
            placeholder={`Search ${word}s…`}
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
      </div>

      {/* ---------- list ---------- */}
      {q.isLoading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: mod.bg, color: mod.color }}
          >
            <mod.icon size={26} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink">
            {term
              ? `No ${word}s match your search`
              : tab === "overdue"
                ? "Nothing overdue 🎉"
                : tab === "upcoming"
                  ? `No upcoming ${word}s`
                  : `No completed ${word}s yet`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {type === "reminder"
              ? "Add a reminder for anything — it doesn't need to be tied to a lead."
              : "Schedule a meeting and invite teammates."}
          </p>
          {tab !== "past" && !term && (
            <button
              className="btn-primary mt-5"
              onClick={() => setModal("new")}
            >
              <Plus size={16} /> New {word}
            </button>
          )}
        </div>
      ) : (
        groups.map(([day, items, isLate]) => (
          <section key={day} className="mb-6">
            <h2
              className={clsx(
                "mb-2.5 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[.08em]",
                isLate ? "text-amber-700" : "text-slate-500",
              )}
            >
              {day}
              <span className="h-px flex-1 bg-mist-2" />
              <span className="font-semibold normal-case tracking-normal text-slate-400">
                {items.length} {word}
                {items.length > 1 ? "s" : ""}
              </span>
            </h2>
            <div className="space-y-2.5">
              {items.map((f) => (
                <ItemCard
                  key={f.id}
                  f={f}
                  mod={mod}
                  now={now}
                  attendeeNames={(f.attendees ?? [])
                    .map(nameOf)
                    .filter(Boolean)}
                  onDone={() => setComplete(f)}
                  onEdit={() => setModal(f)}
                  onDelete={() => setConfirmDel(f)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "new" ? `New ${word}` : `Edit ${word}`}
        wide={type === "meeting"}
      >
        {modal && (
          <FollowUpForm
            followUp={modal === "new" ? undefined : modal}
            fixedType={type}
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
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title={`Delete this ${word}?`}
      >
        <p className="text-sm text-slate-600">
          <b className="text-ink">{confirmDel?.title}</b> will be deleted. This
          can't be undone.
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

function ItemCard({ f, mod, now, attendeeNames, onDone, onEdit, onDelete }) {
  const d = new Date(f.due_at);
  const pending = f.status === "pending";
  const late = pending && isOverdue(f.due_at);
  const done = f.status === "done";
  const mins = Math.round((d - now) / 60000);
  const soon = pending && !late && mins <= 60;
  const tone = late
    ? { bg: "#FFF4ED", fg: "#C2410C", bar: "#C2410C" }
    : done
      ? { bg: "#ECF6EF", fg: "#2F7D4A", bar: "#2F7D4A" }
      : { bg: mod.bg, fg: mod.color, bar: mod.color };
  return (
    <article
      className={clsx(
        "group card relative flex flex-col gap-4 overflow-hidden p-4 transition-all hover:shadow-lift sm:flex-row sm:items-center",
        !pending && "opacity-80",
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: tone.bar }}
      />
      {/* date / time block */}
      <div className="flex shrink-0 items-center gap-3 pl-1 sm:w-[190px]">
        <div
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <span className="text-[10px] font-bold uppercase leading-none tracking-wider">
            {d.toLocaleDateString("en-IN", { month: "short" })}
          </span>
          <span className="text-[22px] font-extrabold leading-tight num">
            {d.getDate()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="whitespace-nowrap text-[15px] font-bold text-ink num">
            {timeOf(f.due_at)}
          </p>
          {f.ends_at && (
            <p className="whitespace-nowrap text-[12px] font-medium text-slate-400 num">
              until {timeOf(f.ends_at)}
            </p>
          )}
          {late ? (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              <AlertTriangle size={11} /> Overdue
            </span>
          ) : done ? (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-[11px] font-bold text-moss-700">
              <CheckCircle2 size={11} /> Done
            </span>
          ) : !pending ? (
            <span className="mt-0.5 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold capitalize text-slate-500">
              {f.status}
            </span>
          ) : soon ? (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
              <Clock size={11} /> {mins <= 1 ? "Now" : `In ${mins} min`}
            </span>
          ) : (
            <span className="mt-0.5 block text-[12px] text-slate-400">
              {d.toLocaleDateString("en-IN", { weekday: "long" })}
            </span>
          )}
        </div>
      </div>

      {/* details */}
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            "text-[15.5px] font-bold",
            pending
              ? "text-ink"
              : "text-slate-500 line-through decoration-slate-300",
          )}
        >
          {f.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-slate-500">
          {(f.lead || f.client) && (
            <Link
              to={f.lead ? `/leads/${f.lead.id}` : `/clients/${f.client.id}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold transition hover:brightness-95"
              style={{ background: mod.bg, color: mod.color }}
            >
              {f.lead ? <UserRound size={12} /> : <Briefcase size={12} />}
              {f.lead?.name ?? f.client?.name}
            </Link>
          )}
          {f.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {f.location}
            </span>
          )}
          {f.meeting_link && (
            <a
              href={f.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-[#E0F2FE] px-2 py-0.5 font-semibold text-[#0284C7] hover:bg-[#BAE6FD]"
            >
              <Video size={13} /> Join call
            </a>
          )}
          {f.attendees?.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} />
              <span className="flex -space-x-1.5">
                {attendeeNames.slice(0, 4).map((n) => (
                  <span
                    key={n}
                    className="rounded-full ring-2 ring-white"
                    title={n}
                  >
                    <Avatar name={n} size={20} />
                  </span>
                ))}
              </span>
              {attendeeNames.length
                ? attendeeNames.join(", ")
                : `${f.attendees.length} attendee${f.attendees.length > 1 ? "s" : ""}`}
            </span>
          )}
          {f.assignee && (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={f.assignee.full_name} size={18} />
              {f.assignee.full_name}
            </span>
          )}
        </div>
        {f.notes && (
          <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[13px] text-slate-600">
            {f.notes}
          </p>
        )}
        {f.outcome && (
          <p className="mt-2 rounded-lg bg-moss-50 px-3 py-1.5 text-[13px] text-moss-700">
            <span className="font-bold">Outcome:</span> {f.outcome}
          </p>
        )}
      </div>

      {/* actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:pl-2">
        {pending && (
          <button
            className="btn border border-moss-600/25 bg-moss-50 px-3 py-2 text-moss-700 hover:bg-moss-600 hover:text-white"
            onClick={onDone}
            title="Mark as done"
          >
            <Check size={15} /> Done
          </button>
        )}
        <button
          className="btn-ghost p-2"
          onClick={onEdit}
          title="Edit"
          aria-label="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          className="btn-ghost p-2 hover:bg-amber-50 hover:text-amber-700"
          onClick={onDelete}
          title="Delete"
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

/** [label, items, isOverdueGroup] per day. Overdue items get their own group at the top. */
function groupByDay(rows) {
  const map = new Map();
  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 864e5).toDateString();
  const yesterday = new Date(Date.now() - 864e5).toDateString();
  for (const r of rows) {
    const d = new Date(r.due_at);
    const ds = d.toDateString();
    const key =
      ds === today
        ? "Today"
        : ds === tomorrow
          ? "Tomorrow"
          : ds === yesterday
            ? "Yesterday"
            : d.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
    const late = r.status === "pending" && isOverdue(r.due_at);
    const k = `${late ? "late:" : ""}${key}`;
    if (!map.has(k)) map.set(k, [late ? `Overdue · ${key}` : key, [], late]);
    map.get(k)[1].push(r);
  }
  return [...map.values()];
}
