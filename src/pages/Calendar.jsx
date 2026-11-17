import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
} from "lucide-react";
import { getCalendarEvents } from "@/lib/api";
import { Modal, Spinner, fmtDateTime } from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { FollowUpForm } from "@/components/forms";
import { kindStyle, linkFor } from "./Home";

const KIND_LABEL = {
  meeting: "Meeting",
  reminder: "Reminder",
  followup: "Follow-up",
  task: "Task",
  todo: "To-do",
};
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeOf = (iso) => fmtDateTime(iso).split("· ")[1];
const isDone = (e) => ["done", "completed", "cancelled"].includes(e.status);
const STATUS = {
  done: ["Done", "#0B857D", "#E6F7F5"],
  completed: ["Done", "#0B857D", "#E6F7F5"],
  cancelled: ["Cancelled", "#64748B", "#EEF2F6"],
  in_progress: ["In progress", "#2563EB", "#DBEAFE"],
};

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  // week view shows the week of this date (kept apart from the selection)
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  // true only while the user has clicked a day; clicking anywhere else clears it
  const [picked, setPicked] = useState(false);
  const gridRef = useRef(null);
  const asideRef = useRef(null);
  const [create, setCreate] = useState(null);
  const [filters, setFilters] = useState({
    meeting: true,
    reminder: true,
    followup: true,
    task: true,
    todo: true,
  });

  const range = useMemo(() => {
    const s = startOfWeek(view === "week" ? anchor : cursor);
    const e = new Date(s);
    e.setDate(s.getDate() + (view === "week" ? 7 : 42));
    return [s, e];
  }, [cursor, anchor, view]);
  const q = useQuery({
    queryKey: ["calendar", range[0].toISOString(), range[1].toISOString()],
    queryFn: () => getCalendarEvents(range[0], range[1]),
    placeholderData: (p) => p,
  });
  const counts = useMemo(() => {
    const c = {};
    for (const e of q.data ?? []) c[e.kind] = (c[e.kind] ?? 0) + 1;
    return c;
  }, [q.data]);
  const byDay = useMemo(() => {
    const m = new Map();
    for (const e of q.data ?? []) {
      if (!filters[e.kind]) continue;
      const k = new Date(e.starts_at).toDateString();
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return m;
  }, [q.data, filters]);

  const days = useMemo(
    () =>
      Array.from({ length: view === "week" ? 7 : 42 }, (_, i) => {
        const d = new Date(range[0]);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [range, view],
  );
  const todayKey = new Date().toDateString();
  const weekEnd = new Date(range[0]);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const title =
    view === "week"
      ? `${range[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const move = (n) => {
    if (view === "week") {
      const d = new Date(anchor);
      d.setDate(d.getDate() + 7 * n);
      setAnchor(d);
      setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      const d = new Date(cursor);
      d.setMonth(d.getMonth() + n);
      setCursor(d);
    }
  };
  const today0 = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const goToday = () => {
    const d = today0();
    setSelected(d);
    setAnchor(d);
    setPicked(false);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };
  const unselect = () => {
    setPicked(false);
    setSelected(today0());
  };
  const switchView = (v) => {
    if (v === "week") {
      const t = today0();
      const sameMonth =
        t.getMonth() === cursor.getMonth() &&
        t.getFullYear() === cursor.getFullYear();
      setAnchor(picked ? selected : sameMonth ? t : cursor);
    }
    setView(v);
  };
  // click outside the calendar / day panel (or press Esc) -> clear the selected day
  useEffect(() => {
    const onDown = (ev) => {
      const t = ev.target;
      if (!(t instanceof Element)) return;
      if (gridRef.current?.contains(t) || asideRef.current?.contains(t)) return;
      if (t.closest(".fixed, [role=dialog], [data-keep-day]")) return; // forms / pop-ups
      unselect();
    };
    const onKey = (ev) =>
      ev.key === "Escape" &&
      !document.querySelector("[role=dialog]") &&
      unselect();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pick = (d) => {
    if (picked && d.toDateString() === selected.toDateString())
      return unselect(); // click again = unselect
    setSelected(d);
    setAnchor(d);
    setPicked(true);
    if (view === "month" && d.getMonth() !== cursor.getMonth())
      setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const selectedEvents = byDay.get(selected.toDateString()) ?? [];
  const isSelToday = selected.toDateString() === todayKey;
  const isSelPast = !isSelToday && selected < new Date();
  // default time for "add on this day": today → in 1 hour, another day → 10:00 AM
  const defaultDue = useMemo(() => {
    if (isSelToday) return undefined;
    const d = new Date(selected);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  }, [selected, isSelToday]);
  const upcoming = useMemo(
    () =>
      (q.data ?? [])
        .filter(
          (e) =>
            filters[e.kind] &&
            !isDone(e) &&
            new Date(e.starts_at) >= new Date() &&
            new Date(e.starts_at).toDateString() !== selected.toDateString(),
        )
        .slice(0, 5),
    [q.data, filters, selected],
  );
  const maxChips = view === "week" ? 14 : 3;

  return (
    <div>
      <ModuleHeader
        moduleKey="calendar"
        title="Calendar"
        subtitle="Meetings, reminders, follow-ups, tasks and to-dos on one calendar."
        actions={
          <>
            <button
              data-keep-day
              className="btn-secondary"
              onClick={() => setCreate("reminder")}
            >
              <Bell size={15} /> Reminder
            </button>
            <button
              data-keep-day
              className="btn-primary"
              onClick={() => setCreate("meeting")}
            >
              <Plus size={16} /> Meeting
            </button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div ref={gridRef} className="card min-w-0 self-start overflow-hidden">
          {/* ---------- toolbar ---------- */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist-2 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-xl border border-mist-3">
                <button
                  onClick={() => move(-1)}
                  className="px-2.5 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                  aria-label="Previous"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  onClick={goToday}
                  className="border-x border-mist-3 px-3.5 text-[13px] font-bold text-ink transition hover:bg-slate-50"
                >
                  Today
                </button>
                <button
                  onClick={() => move(1)}
                  className="px-2.5 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                  aria-label="Next"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
              <h2 className="ml-1 text-[16px] font-extrabold tracking-tight text-ink sm:ml-2 sm:text-[19px]">
                {title}
              </h2>
              {q.isFetching && !q.isLoading && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
              )}
            </div>
            <div className="flex rounded-xl bg-mist-2 p-1">
              {["month", "week"].map((v) => (
                <button
                  key={v}
                  onClick={() => switchView(v)}
                  className={clsx(
                    "rounded-lg px-4 py-1.5 text-[13px] font-semibold capitalize transition",
                    view === v
                      ? "bg-white text-ink shadow-card"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          {/* ---------- type filters ---------- */}
          <div className="flex flex-wrap items-center gap-2 border-b border-mist-2 bg-slate-50/60 px-4 py-2.5">
            <span className="mr-1 text-[12px] font-semibold text-slate-500">
              Show:
            </span>
            {Object.keys(KIND_LABEL).map((k) => {
              const st = kindStyle(k);
              const on = filters[k];
              return (
                <button
                  key={k}
                  onClick={() => setFilters({ ...filters, [k]: !on })}
                  aria-pressed={on}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-semibold transition",
                    on
                      ? "border-transparent"
                      : "border-mist-3 bg-white text-slate-400 line-through decoration-slate-300",
                  )}
                  style={
                    on
                      ? { background: st.background, color: st.color }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: on ? st.color : "#CBD5E1" }}
                  />
                  {KIND_LABEL[k]}
                  <span className="num opacity-70">{counts[k] ?? 0}</span>
                </button>
              );
            })}
          </div>

          {/* ---------- grid ---------- */}
          <div className="relative">
            {q.isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <Spinner />
              </div>
            )}
            <div className="grid grid-cols-7 border-b border-mist-2 text-center text-[11.5px] font-bold uppercase tracking-[.08em] text-slate-500">
              {DOW.map((d, i) => {
                const dd = days[i];
                return (
                  <div
                    key={d}
                    className={clsx("py-2.5", i >= 5 && "text-slate-400")}
                  >
                    {d}
                    {view === "week" && (
                      <span
                        className={clsx(
                          "ml-1.5 normal-case tracking-normal",
                          dd.toDateString() === todayKey
                            ? "text-teal-600"
                            : "text-ink",
                        )}
                      >
                        {dd.getDate()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={clsx(
                "grid grid-cols-7",
                view === "week"
                  ? "auto-rows-[minmax(420px,auto)]"
                  : "auto-rows-[minmax(112px,auto)]",
              )}
            >
              {days.map((d, i) => {
                const key = d.toDateString();
                const evs = byDay.get(key) ?? [];
                const other =
                  view === "month" && d.getMonth() !== cursor.getMonth();
                const isSel = picked && key === selected.toDateString();
                const isToday = key === todayKey;
                const weekend = i % 7 >= 5;
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => pick(d)}
                    onKeyDown={(e) => e.key === "Enter" && pick(d)}
                    data-day={key}
                    className={clsx(
                      "group relative flex cursor-pointer flex-col border-b border-r border-mist p-1.5 text-left outline-none transition-colors",
                      i % 7 === 6 && "border-r-0",
                      other
                        ? "bg-slate-50/70"
                        : weekend
                          ? "bg-[#FAFBFD]"
                          : "bg-white",
                      isSel
                        ? "z-[1] !bg-teal-50/50 ring-2 ring-inset ring-teal-500/70"
                        : "hover:bg-slate-50",
                    )}
                  >
                    {view === "month" && (
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={clsx(
                            "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[13px] font-bold num",
                            isToday
                              ? "bg-teal-600 text-white shadow-brand"
                              : other
                                ? "text-slate-300"
                                : "text-ink",
                          )}
                        >
                          {d.getDate()}
                          {d.getDate() === 1 && !isToday && (
                            <span className="ml-1 hidden sm:inline">
                              {d.toLocaleDateString("en-GB", {
                                month: "short",
                              })}
                            </span>
                          )}
                        </span>
                        {evs.length > 0 && (
                          <span className="mr-1 hidden text-[10.5px] font-bold text-slate-400 num sm:inline">
                            {evs.length}
                          </span>
                        )}
                      </div>
                    )}
                    {view === "month" && evs.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-1 sm:hidden">
                        {evs.slice(0, 6).map((e) => (
                          <span
                            key={e.kind + e.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: kindStyle(e.kind).color }}
                          />
                        ))}
                      </div>
                    )}
                    <div
                      className={clsx(
                        "space-y-1",
                        other && "opacity-60",
                        view === "month" && "hidden sm:block",
                      )}
                    >
                      {evs.slice(0, maxChips).map((e) => {
                        const st = kindStyle(e.kind);
                        const done = isDone(e);
                        return (
                          <div
                            key={e.kind + e.id}
                            title={`${KIND_LABEL[e.kind]} · ${timeOf(e.starts_at)} · ${e.title}`}
                            className={clsx(
                              "flex items-center gap-1.5 truncate rounded-md border-l-[3px] px-1.5 py-[3px] text-[11.5px] font-semibold",
                              done && "opacity-50",
                              view === "week" &&
                                "flex-col items-start gap-0 py-1.5",
                            )}
                            style={{
                              background: st.background,
                              color: st.color,
                              borderColor: st.color,
                            }}
                          >
                            {view === "week" && (
                              <span className="shrink-0 font-bold num">
                                {timeOf(e.starts_at)}
                              </span>
                            )}
                            <span
                              className={clsx(
                                "truncate",
                                done && "line-through",
                                view === "week" &&
                                  "w-full whitespace-normal leading-snug text-ink/80",
                              )}
                            >
                              {e.title}
                            </span>
                          </div>
                        );
                      })}
                      {evs.length > maxChips && (
                        <div className="px-1.5 text-[11px] font-bold text-teal-700">
                          +{evs.length - maxChips} more
                        </div>
                      )}
                      {view === "week" && evs.length === 0 && (
                        <p className="px-1 pt-2 text-[12px] text-slate-300">
                          No plans
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------- day panel ---------- */}
        <aside ref={asideRef} className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3.5 bg-ink px-5 py-4 text-white">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal-300">
                  {selected.toLocaleDateString("en-GB", { month: "short" })}
                </span>
                <span className="text-[22px] font-extrabold leading-none num">
                  {selected.getDate()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-bold">
                  {isSelToday
                    ? "Today"
                    : selected.toLocaleDateString("en-GB", { weekday: "long" })}
                </p>
                <p className="text-[13px] text-white/70">
                  {selected.toLocaleDateString("en-GB", {
                    weekday: isSelToday ? "long" : undefined,
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-bold num">
                {selectedEvents.length}
              </span>
            </div>

            <div className="p-4">
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <CalendarDays size={22} />
                  </span>
                  <p className="mt-3 font-bold text-ink">Nothing planned</p>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {isSelPast
                      ? "No activity on this day."
                      : "Your day is free — add something below."}
                  </p>
                </div>
              ) : (
                <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[65px] before:top-2 before:w-px before:bg-mist-2">
                  {selectedEvents.map((e) => (
                    <DayItem key={e.kind + e.id} e={e} />
                  ))}
                </ol>
              )}
              {!isSelPast && (
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-mist pt-4">
                  <button
                    className="btn-secondary justify-center py-2 text-[13px]"
                    onClick={() => setCreate("reminder")}
                  >
                    <Bell size={14} /> Reminder
                  </button>
                  <button
                    className="btn-primary justify-center py-2 text-[13px]"
                    onClick={() => setCreate("meeting")}
                  >
                    <Users size={14} /> Meeting
                  </button>
                </div>
              )}
            </div>
          </div>

          {upcoming.length > 0 && (
            <div className="card p-4">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-[.1em] text-slate-500">
                Coming up
              </p>
              <ul className="space-y-1">
                {upcoming.map((e) => {
                  const st = kindStyle(e.kind);
                  const d = new Date(e.starts_at);
                  return (
                    <li key={e.kind + e.id}>
                      <button
                        onClick={() => {
                          const x = new Date(d);
                          x.setHours(0, 0, 0, 0);
                          pick(x);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl"
                          style={{ background: st.background, color: st.color }}
                        >
                          <span className="text-[9.5px] font-bold uppercase">
                            {d.toLocaleDateString("en-GB", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="text-[14px] font-extrabold leading-none num">
                            {d.getDate()}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-semibold text-ink">
                            {e.title}
                          </span>
                          <span className="text-[12px] text-slate-500 num">
                            {KIND_LABEL[e.kind]} · {timeOf(e.starts_at)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <Modal
        open={!!create}
        onClose={() => setCreate(null)}
        title={create === "meeting" ? "New meeting" : "New reminder"}
        wide={create === "meeting"}
      >
        {create && (
          <FollowUpForm
            fixedType={create}
            defaultDue={defaultDue}
            onDone={() => setCreate(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function DayItem({ e }) {
  const st = kindStyle(e.kind);
  const done = isDone(e);
  const late = !done && new Date(e.starts_at) < new Date();
  const s =
    STATUS[e.status] ??
    (late
      ? ["Overdue", "#B45309", "#FEF3C7"]
      : ["Pending", "#475569", "#EEF2F6"]);
  return (
    <li className="relative flex gap-3">
      <span className="w-[48px] shrink-0 pt-2.5 text-right text-[11.5px] font-bold leading-tight text-slate-500 num">
        {timeOf(e.starts_at)}
      </span>
      <span
        className="relative z-[1] mt-3 h-[11px] w-[11px] shrink-0 rounded-full ring-[3px] ring-white"
        style={{ background: st.color }}
      />
      <Link
        to={linkFor(e)}
        className="min-w-0 flex-1 rounded-xl border border-mist-2 p-3 transition hover:border-slate-300 hover:shadow-card"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={st}
          >
            {KIND_LABEL[e.kind]}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ color: s[1], background: s[2] }}
          >
            {done ? <CheckCircle2 size={11} /> : <Clock size={11} />}
            {s[0]}
          </span>
        </div>
        <p
          className={clsx(
            "mt-1.5 text-[14px] font-semibold text-ink",
            done && "text-slate-400 line-through",
          )}
        >
          {e.title}
        </p>
        {e.ends_at && (
          <p className="mt-0.5 text-[12px] text-slate-500 num">
            until {timeOf(e.ends_at)}
          </p>
        )}
      </Link>
    </li>
  );
}

function startOfWeek(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  const day = (s.getDay() + 6) % 7;
  s.setDate(s.getDate() - day);
  return s;
}
