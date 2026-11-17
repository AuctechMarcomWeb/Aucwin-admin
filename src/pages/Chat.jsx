import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  ArrowLeft,
  Check,
  Hash,
  Link2,
  Loader2,
  Megaphone,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  createGroupChannel,
  deleteMessage,
  getChannels,
  getChatPeople,
  getLeads,
  getMessages,
  markChannelRead,
  openDirectChannel,
  sendMessage,
} from "@/lib/api";
import { errMsg } from "@/lib/http";
import { onServerChange } from "@/lib/realtime";
import { useAuth } from "@/lib/auth";
import { label } from "@/lib/types";
import {
  Avatar,
  Field,
  Input,
  Modal,
  Spinner,
  fmtRelative,
} from "@/components/ui";

const ROLE_ORDER = { super_admin: 0, admin: 1, employee: 2 };
const SUBTITLE = {
  direct: "Direct message",
  general: "Everyone in the company",
  department: "Department channel",
  group: "Group",
};
const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
const dayLabel = (iso) => {
  const d = new Date(iso);
  const t = new Date();
  const y = new Date();
  y.setDate(t.getDate() - 1);
  if (d.toDateString() === t.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};
const shortWhen = (iso) =>
  new Date(iso).toDateString() === new Date().toDateString()
    ? timeOf(iso)
    : fmtRelative(iso).replace(" ago", "").replace("about ", "");

/** Makes the chat box fill the screen exactly down to the bottom (no extra space, no page scroll). */
function useFillHeight() {
  const ref = useRef(null);
  const [h, setH] = useState(null);
  const [pad, setPad] = useState(0);
  useLayoutEffect(() => {
    const fit = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // the box goes right down to the bottom edge of the screen (it covers the page's bottom padding)
      const main = el.closest("main");
      const padB = main
        ? parseFloat(getComputedStyle(main).paddingBottom) || 0
        : 0;
      setPad(padB);
      setH(
        Math.max(
          460,
          Math.floor(window.innerHeight - (r.top + window.scrollY)),
        ),
      );
    };
    fit();
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 50);
    return () => {
      window.removeEventListener("resize", fit);
      clearTimeout(t);
    };
  }, []);
  return [ref, h, pad];
}

function ChannelIcon({ c, size = 40 }) {
  if (c.type === "direct") return <Avatar name={c.name} size={size} />;
  const Icon =
    c.type === "group" ? Users : c.type === "general" ? Megaphone : Hash;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.42} />
    </span>
  );
}

export default function ChatPage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const active = params.get("c");
  const [boxRef, boxH, boxPad] = useFillHeight();
  const channels = useQuery({
    queryKey: ["chat_channels"],
    queryFn: getChannels,
    refetchInterval: 30_000,
  });
  const people = useQuery({
    queryKey: ["chat_people"],
    queryFn: getChatPeople,
  });
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState(false);
  const [newGroup, setNewGroup] = useState(false);
  const select = (id) => setParams({ c: id });

  // open the first conversation automatically on wide screens
  useEffect(() => {
    if (!active && channels.data?.length && window.innerWidth >= 768)
      select(channels.data[0].id);
  }, [active, channels.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const team = useMemo(
    () =>
      (people.data ?? [])
        .filter((p) => p.id !== profile?.id && p.is_active !== false)
        .sort(
          (a, b) =>
            (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) ||
            a.full_name.localeCompare(b.full_name, undefined, {
              numeric: true,
            }),
        ),
    [people.data, profile?.id],
  );
  const dm = useMutation({
    mutationFn: (p) => openDirectChannel(p.id),
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["chat_channels"] });
      setNewMsg(false);
      select(id);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const term = search.trim().toLowerCase();
  const rows = (channels.data ?? []).filter(
    (c) =>
      !term ||
      c.name.toLowerCase().includes(term) ||
      (c.last_message ?? "").toLowerCase().includes(term),
  );
  const direct = rows.filter((c) => c.type === "direct");
  const groups = rows.filter((c) => c.type !== "direct");
  const totalUnread = (channels.data ?? []).reduce(
    (a, c) => a + (c.unread || 0),
    0,
  );
  const current = channels.data?.find((c) => c.id === active);
  const phoneOf = (c) =>
    c?.type === "direct"
      ? team.find((p) => p.id === c.other_user_id)?.phone
      : null;

  const row = (c) => {
    const on = active === c.id;
    const unread = c.unread > 0;
    return (
      <button
        key={c.id}
        onClick={() => select(c.id)}
        className={clsx(
          "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
          on ? "bg-teal-50" : "hover:bg-mist",
        )}
      >
        {on && (
          <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-teal-500" />
        )}
        <ChannelIcon c={c} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "flex-1 truncate text-[14px]",
                unread
                  ? "font-extrabold text-ink"
                  : "font-semibold text-slate-800",
              )}
            >
              {c.type === "department" || c.type === "general"
                ? `# ${c.name}`
                : c.name}
            </span>
            {c.last_message_at && (
              <span
                className={clsx(
                  "shrink-0 text-[11px]",
                  unread ? "font-bold text-teal-700" : "text-slate-400",
                )}
              >
                {shortWhen(c.last_message_at)}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={clsx(
                "flex-1 truncate text-[12.5px]",
                unread ? "font-semibold text-slate-700" : "text-slate-500",
              )}
            >
              {c.last_message ??
                (c.type === "direct" ? "Say hello 👋" : "No messages yet")}
            </span>
            {unread && (
              <span className="min-w-[20px] rounded-full bg-teal-600 px-1.5 text-center text-[11px] font-bold leading-5 text-white num">
                {c.unread > 99 ? "99+" : c.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      ref={boxRef}
      style={boxH ? { height: boxH, marginBottom: -boxPad } : undefined}
      className="card flex min-h-[460px] overflow-hidden rounded-b-none border-b-0"
    >
      {/* ================= conversation list ================= */}
      <aside
        className={clsx(
          "flex w-full shrink-0 flex-col border-r border-mist-2 bg-white md:w-[320px]",
          active && "hidden md:flex",
        )}
      >
        <div className="border-b border-mist-2 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-ink">
                Chat
              </h1>
              <p className="text-xs text-slate-500">
                {totalUnread
                  ? `${totalUnread} unread message${totalUnread === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </p>
            </div>
            <button
              className="btn-primary px-3 py-2"
              onClick={() => setNewMsg(true)}
            >
              <Plus size={15} /> New
            </button>
          </div>
          <div className="relative mt-3">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input py-2 pl-9"
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* quick: team row */}
          {!term && team.length > 0 && (
            <div className="mb-1 px-2 pb-2 pt-1">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">
                Team
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {team.slice(0, 15).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => dm.mutate(p)}
                    title={`Message ${p.full_name}`}
                    className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-lg py-1 hover:bg-mist"
                  >
                    <Avatar name={p.full_name} size={40} />
                    <span className="w-full truncate text-center text-[11.5px] font-semibold text-slate-700">
                      {p.full_name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {channels.isLoading ? (
            <Spinner />
          ) : !rows.length ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              {term ? "No conversations match." : "No conversations yet."}
            </p>
          ) : (
            <>
              {direct.length > 0 && (
                <>
                  <p className="mb-1 mt-2 px-3 text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">
                    Direct messages
                  </p>
                  {direct.map(row)}
                </>
              )}
              {groups.length > 0 && (
                <>
                  <p className="mb-1 mt-3 px-3 text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">
                    Channels & groups
                  </p>
                  {groups.map(row)}
                </>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ================= conversation ================= */}
      {current ? (
        <Thread
          key={current.id}
          c={current}
          phone={phoneOf(current)}
          meId={profile?.id}
          onBack={() => setParams({})}
        />
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center bg-slate-50 text-center md:flex">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <MessageCircle size={28} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink">
            Pick a conversation
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose one on the left, or start a new message.
          </p>
          <button className="btn-primary mt-5" onClick={() => setNewMsg(true)}>
            <Plus size={15} /> New message
          </button>
        </div>
      )}

      {/* ================= new message ================= */}
      <Modal open={newMsg} onClose={() => setNewMsg(false)} title="New message">
        <NewMessage
          team={team}
          loading={people.isLoading}
          onPick={(p) => dm.mutate(p)}
          onGroup={() => {
            setNewMsg(false);
            setNewGroup(true);
          }}
        />
      </Modal>
      <Modal
        open={newGroup}
        onClose={() => setNewGroup(false)}
        title="New group"
      >
        <GroupForm
          team={team}
          onDone={(id) => {
            setNewGroup(false);
            if (!id) return; // cancelled
            qc.invalidateQueries({ queryKey: ["chat_channels"] });
            select(id);
          }}
        />
      </Modal>
    </div>
  );
}

function NewMessage({ team, loading, onPick, onGroup }) {
  const [q, setQ] = useState("");
  const list = team.filter(
    (p) =>
      !q.trim() ||
      `${p.full_name} ${p.department?.name ?? ""} ${p.role}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  return (
    <div>
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          autoFocus
          className="input pl-9"
          placeholder="Search people"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <button
        onClick={onGroup}
        className="mt-3 flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-mist"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <Users size={18} />
        </span>
        <span className="flex-1 text-sm font-bold text-teal-700">
          Create a group
        </span>
      </button>
      <div className="mt-1 max-h-[50vh] overflow-y-auto">
        {loading ? (
          <Spinner />
        ) : !list.length ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Nobody found.
          </p>
        ) : (
          list.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-mist"
            >
              <Avatar name={p.full_name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">
                  {p.full_name}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {[label(p.role), p.department?.name]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <MessageCircle size={17} className="text-teal-600" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Thread({ c, phone, meId, onBack }) {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const channelId = c.id;
  const q = useQuery({
    queryKey: ["chat_messages", channelId],
    queryFn: () => getMessages(channelId),
  });
  const [text, setText] = useState("");
  const [attach, setAttach] = useState(null);
  const [showLeads, setShowLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const leads = useQuery({
    queryKey: ["leads", "picker"],
    queryFn: () => getLeads({ pageSize: 200 }),
    enabled: showLeads,
  });
  const scroller = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    const off = onServerChange((p) => {
      if (p.table !== "chat_messages" || p.channel_id !== channelId) return;
      qc.invalidateQueries({ queryKey: ["chat_messages", channelId] });
      qc.invalidateQueries({ queryKey: ["chat_channels"] });
      markChannelRead(channelId);
    });
    markChannelRead(channelId).then(() => {
      qc.invalidateQueries({ queryKey: ["chat_channels"] });
      qc.invalidateQueries({ queryKey: ["module_counts"] });
    });
    input.current?.focus();
    return () => {
      off();
    };
  }, [channelId, qc]);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [q.data]);
  // grow the message box with the text (up to 5 lines)
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 132) + "px";
  }, [text]);

  const send = useMutation({
    mutationFn: () =>
      sendMessage(
        channelId,
        text.trim(),
        attach ? { lead_id: attach.id } : undefined,
      ),
    onSuccess: () => {
      setText("");
      setAttach(null);
      qc.invalidateQueries({ queryKey: ["chat_messages", channelId] });
      qc.invalidateQueries({ queryKey: ["chat_channels"] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat_messages", channelId] });
      qc.invalidateQueries({ queryKey: ["chat_channels"] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const msgs = q.data ?? [];
  const leadList = (leads.data?.rows ?? []).filter(
    (l) =>
      !leadSearch.trim() ||
      l.name.toLowerCase().includes(leadSearch.trim().toLowerCase()),
  );

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-mist-2 px-4 py-3">
        <button
          className="btn-ghost -ml-1 p-2 md:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>
        <ChannelIcon c={c} size={40} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15.5px] font-bold text-ink">
            {c.type === "department" || c.type === "general"
              ? `# ${c.name}`
              : c.name}
          </h2>
          <p className="truncate text-xs text-slate-500">
            {SUBTITLE[c.type] ?? ""}
          </p>
        </div>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="btn-secondary px-3 py-2"
            title={`Call ${phone}`}
          >
            <Phone size={15} /> <span className="hidden lg:inline">Call</span>
          </a>
        )}
      </header>

      {/* messages */}
      <div
        ref={scroller}
        className="min-h-0 flex-1 overflow-y-auto bg-[#F6F8FB] px-4 py-4 sm:px-6"
      >
        {q.isLoading ? (
          <Spinner />
        ) : !msgs.length ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ChannelIcon c={c} size={56} />
            <h3 className="mt-3 text-base font-bold text-ink">
              No messages yet
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">Say hello 👋</p>
          </div>
        ) : (
          msgs.map((m, i) => {
            const prev = msgs[i - 1];
            const next = msgs[i + 1];
            const newDay =
              !prev ||
              new Date(prev.created_at).toDateString() !==
                new Date(m.created_at).toDateString();
            const sameAsPrev =
              prev &&
              !newDay &&
              prev.user_id === m.user_id &&
              new Date(m.created_at) - new Date(prev.created_at) < 5 * 60_000;
            const sameAsNext =
              next &&
              next.user_id === m.user_id &&
              new Date(next.created_at) - new Date(m.created_at) < 5 * 60_000 &&
              new Date(next.created_at).toDateString() ===
                new Date(m.created_at).toDateString();
            const mine = m.user_id === meId;
            const canDel = mine || isAdmin;
            return (
              <div key={m.id}>
                {newDay && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-white px-3 py-1 text-[11.5px] font-semibold text-slate-500 shadow-card ring-1 ring-mist-2">
                      {dayLabel(m.created_at)}
                    </span>
                  </div>
                )}
                <div
                  className={clsx(
                    "group flex items-end gap-2",
                    mine ? "justify-end" : "justify-start",
                    sameAsPrev ? "mt-0.5" : "mt-3",
                  )}
                >
                  {!mine && (
                    <div className="w-8 shrink-0">
                      {!sameAsNext && (
                        <Avatar name={m.user?.full_name} size={32} />
                      )}
                    </div>
                  )}
                  {mine && canDel && (
                    <button
                      onClick={() => remove.mutate(m.id)}
                      title="Delete message"
                      aria-label="Delete message"
                      className="mb-1 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-amber-700 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div
                    className={clsx(
                      "flex max-w-[72%] flex-col",
                      mine ? "items-end" : "items-start",
                    )}
                  >
                    {!mine && !sameAsPrev && (
                      <span className="mb-1 ml-1 text-[12px] font-bold text-slate-600">
                        {m.user?.full_name}
                      </span>
                    )}
                    <div
                      className={clsx(
                        "rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed shadow-[0_1px_2px_rgba(15,47,88,.08)]",
                        mine
                          ? "bg-teal-600 text-white"
                          : "bg-white text-ink ring-1 ring-mist-2",
                        mine && !sameAsNext && "rounded-br-md",
                        !mine && !sameAsNext && "rounded-bl-md",
                      )}
                    >
                      {m.lead && (
                        <Link
                          to={`/leads/${m.lead.id}`}
                          className={clsx(
                            "mb-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold",
                            mine
                              ? "bg-white/20 text-white hover:bg-white/30"
                              : "bg-teal-50 text-teal-700 hover:bg-teal-100",
                          )}
                        >
                          <Link2 size={12} /> {m.lead.name}
                        </Link>
                      )}
                      <span className="whitespace-pre-wrap break-words">
                        {m.body}
                      </span>
                    </div>
                    {!sameAsNext && (
                      <span className="mx-1 mt-1 text-[10.5px] text-slate-400">
                        {timeOf(m.created_at)}
                      </span>
                    )}
                  </div>
                  {!mine && canDel && (
                    <button
                      onClick={() => remove.mutate(m.id)}
                      title="Delete message"
                      aria-label="Delete message"
                      className="mb-1 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-amber-700 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* composer */}
      <form
        className="relative border-t border-mist-2 bg-white px-3 py-3 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim() && !send.isPending) send.mutate();
        }}
      >
        {showLeads && (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-mist-2 bg-white shadow-pop sm:left-4 sm:right-auto sm:w-80">
            <div className="flex items-center gap-2 border-b border-mist-2 p-2">
              <Search size={14} className="ml-1 text-slate-400" />
              <input
                autoFocus
                className="flex-1 bg-transparent py-1 text-sm focus:outline-none"
                placeholder="Find a lead to share"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
              />
              <button
                type="button"
                className="rounded-md p-1 text-slate-400 hover:text-ink"
                onClick={() => setShowLeads(false)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {leads.isLoading ? (
                <Spinner />
              ) : !leadList.length ? (
                <p className="p-3 text-center text-xs text-slate-500">
                  No leads found.
                </p>
              ) : (
                leadList.map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => {
                      setAttach({ id: l.id, name: l.name });
                      setShowLeads(false);
                      setLeadSearch("");
                      input.current?.focus();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-mist"
                  >
                    <Avatar name={l.name} size={26} />
                    <span className="truncate font-medium text-ink">
                      {l.name}
                    </span>
                    {l.company && (
                      <span className="truncate text-xs text-slate-400">
                        {l.company}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        {attach && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[12px] font-bold text-teal-700">
            <Link2 size={12} /> Sharing lead: {attach.name}
            <button
              type="button"
              onClick={() => setAttach(null)}
              aria-label="Remove lead"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-mist-3 bg-white p-1.5 transition-colors focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/15">
          <button
            type="button"
            title="Share a lead"
            aria-label="Share a lead"
            className={clsx(
              "rounded-xl p-2.5 transition-colors",
              showLeads
                ? "bg-teal-50 text-teal-700"
                : "text-slate-400 hover:bg-mist hover:text-ink",
            )}
            onClick={() => setShowLeads((v) => !v)}
          >
            <Link2 size={18} />
          </button>
          <textarea
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim() && !send.isPending) send.mutate();
              }
            }}
            placeholder={`Message ${c.name}…`}
            rows={1}
            maxLength={4000}
            className="max-h-[132px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] text-ink placeholder:text-slate-400 focus:outline-none"
          />
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-brand transition hover:bg-teal-700 disabled:opacity-40 disabled:shadow-none"
            disabled={!text.trim() || send.isPending}
            aria-label="Send"
          >
            {send.isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </div>
        <p className="mt-1.5 hidden px-2 text-[11px] text-slate-400 sm:block">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </section>
  );
}

function GroupForm({ team, onDone }) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const m = useMutation({
    mutationFn: () => createGroupChannel(name.trim(), members),
    onSuccess: onDone,
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim() && members.length) m.mutate();
      }}
    >
      <Field label="Group name">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sales team, Project Alpha"
          maxLength={60}
        />
      </Field>
      <div>
        <p className="label">Add people ({members.length} selected)</p>
        <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-mist-2 p-1">
          {team.map((p) => {
            const on = members.includes(p.id);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() =>
                  setMembers(
                    on ? members.filter((x) => x !== p.id) : [...members, p.id],
                  )
                }
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left",
                  on ? "bg-teal-50" : "hover:bg-mist",
                )}
              >
                <Avatar name={p.full_name} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">
                    {p.full_name}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {[label(p.role), p.department?.name]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                <span
                  className={clsx(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    on
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300",
                  )}
                >
                  {on && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onDone(null)}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          disabled={!name.trim() || !members.length || m.isPending}
        >
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          Create group{members.length ? ` (${members.length + 1} people)` : ""}
        </button>
      </div>
    </form>
  );
}
