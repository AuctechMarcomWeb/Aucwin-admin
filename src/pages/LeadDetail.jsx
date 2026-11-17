import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Share2,
  StickyNote,
  Trash2,
  UserCheck,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { convertLead, deleteLead, getLead, updateLead } from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { label, LEAD_STATUSES } from "@/lib/types";
import {
  ConfirmDialog,
  Field,
  Input,
  Modal,
  Spinner,
  fmtDateTime,
  fmtRelative,
  money,
  Avatar,
  toneOf,
} from "@/components/ui";
import { LeadForm } from "@/components/forms";
import {
  ActivityPanel,
  ContactActions,
  DocumentsPanel,
  FollowUpsPanel,
  NotesPanel,
  TasksPanel,
} from "@/components/panels";

const STEPS = LEAD_STATUSES.map(key => ({ key, name: label(key) }));

function StagePill({ value, onDark }) {
  const c = toneOf(value);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold"
      style={
        onDark
          ? { background: "rgba(255,255,255,.12)", color: "#fff" }
          : { color: c, background: c + "17" }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: onDark ? "#5EEAD4" : c }}
      />
      {label(value)}
    </span>
  );
}

export default function LeadDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const q = useQuery({ queryKey: ["leads", id], queryFn: () => getLead(id) });
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [convert, setConvert] = useState(false);

  const status = useMutation({
    mutationFn: (s) => updateLead(id, { status: s }),
    onSuccess: (_d, s) => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Stage changed to ${label(s)}`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteLead(id),
    onSuccess: () => {
      toast.success("Lead deleted");
      navigate("/leads");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (q.isLoading) return <Spinner />;
  if (q.error || !q.data)
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <XCircle size={26} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Lead not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          It may have been deleted, or you don't have access to it.
        </p>
        <Link to="/leads" className="btn-secondary mt-4">
          <ArrowLeft size={15} /> Back to leads
        </Link>
      </div>
    );
  const l = q.data;
  const lost = l.status === "junk";
  const stepIdx = STEPS.findIndex((s) => s.key === l.status);
  const setStage = (s) =>
    s !== l.status && !status.isPending && status.mutate(s);

  return (
    <div>
      {/* ---------- breadcrumb ---------- */}
      <nav className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-white hover:text-ink"
        >
          <ArrowLeft size={15} /> Leads
        </Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="truncate text-ink">{l.name}</span>
      </nav>

      {/* ---------- hero ---------- */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative overflow-hidden bg-ink px-5 py-6 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-400/10" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-teal-400/[.07]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="rounded-full ring-4 ring-white/15">
                <Avatar name={l.name} size={64} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
                    {l.name}
                  </h1>
                  <StagePill value={l.status} onDark />
                  {l.converted_client_id && (
                    <Link
                      to={`/clients/${l.converted_client_id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-1 text-[12px] font-bold text-white hover:brightness-110"
                    >
                      <UserCheck size={13} /> View customer
                    </Link>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-white/75">
                  {l.company && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={14} /> {l.company}
                    </span>
                  )}
                  {l.address && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} /> {l.address}
                    </span>
                  )}
                  {l.phone && (
                    <span className="inline-flex items-center gap-1.5 num">
                      <Phone size={14} /> {l.phone}
                    </span>
                  )}
                  {l.email && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail size={14} className="shrink-0" />{" "}
                      <span className="truncate">{l.email}</span>
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <ContactActions phone={l.phone} email={l.email} dark />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {!l.converted_client_id && !lost && (
                <button
                  className="btn-primary"
                  onClick={() => setConvert(true)}
                >
                  <UserCheck size={16} /> Convert to customer
                </button>
              )}
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[14px] font-semibold text-ink transition hover:bg-slate-100"
                onClick={() => setEdit(true)}
              >
                <Pencil size={15} /> Edit
              </button>
              {isAdmin && (
                <button
                  className="rounded-xl bg-white/10 px-3 py-2 text-white ring-1 ring-white/15 transition hover:bg-amber-500/80"
                  title="Delete lead"
                  aria-label="Delete lead"
                  onClick={() => setDel(true)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------- stage stepper ---------- */}
        <div className="border-b border-mist-2 px-5 py-4 sm:px-7">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[.1em] text-slate-500">
              Stage{" "}
              {status.isPending && (
                <Loader2 size={12} className="ml-1 inline animate-spin" />
              )}
            </p>
            {lost ? (
              <button
                onClick={() => setStage("prospect")}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-bold text-teal-700 hover:bg-teal-50"
              >
                <RotateCcw size={13} /> Reopen lead
              </button>
            ) : (
              l.status !== "sale_done" && (
                <button
                  onClick={() => setStage("junk")}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <XCircle size={13} /> Mark as Junk
                </button>
              )
            )}
          </div>
          {lost ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13.5px] text-slate-600">
              <XCircle size={18} className="shrink-0 text-slate-400" />
              This lead was marked <b className="text-ink">Junk</b>.
              Reopen it if they get in touch again.
            </div>
          ) : (
            <ol className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:grid sm:flex sm:overflow-x-auto sm:pb-1">
              {STEPS.map((st, i) => {
                const done = false;
                const cur = i === stepIdx;
                return (
                  <li
                    key={st.key}
                    className="min-w-[118px] shrink-0 sm:min-w-0"
                  >
                    <button
                      onClick={() => setStage(st.key)}
                      title={`Move to ${st.name}`}
                      aria-current={cur ? "step" : undefined}
                      className={clsx(
                        "group flex w-full flex-col items-start rounded-xl px-2.5 py-2 text-left transition sm:px-3",
                        cur
                          ? "bg-teal-600 text-white shadow-brand"
                          : done
                            ? "bg-teal-50 text-teal-800 hover:bg-teal-100"
                            : "bg-mist text-slate-500 hover:bg-mist-2 hover:text-ink",
                      )}
                    >
                      <span className="flex w-full items-center gap-1.5">
                        <span
                          className={clsx(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-extrabold",
                            cur
                              ? "bg-white text-teal-700"
                              : done
                                ? "bg-teal-600 text-white"
                                : "bg-white text-slate-400",
                          )}
                        >
                          {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                        </span>
                        <span className="truncate text-[13px] font-bold">
                          {st.name}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "mt-0.5 hidden truncate text-[11.5px] sm:block",
                          cur ? "text-white/80" : "opacity-70",
                        )}
                      >
                        {st.hint}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* ---------- facts ---------- */}
        <dl className="grid grid-cols-2 gap-px bg-mist-2 sm:grid-cols-3 xl:grid-cols-5">
          {[
            {
              icon: Wallet,
              k: "Estimated value",
              v: (
                <span className="text-[17px] font-extrabold">
                  {money(l.estimated_value)}
                </span>
              ),
              c: "#16A34A",
              bg: "#DCFCE7",
            },
            {
              icon: Share2,
              k: "Source",
              v: label(l.source),
              c: "#2563EB",
              bg: "#DBEAFE",
            },
            {
              icon: UserRound,
              k: "Assigned to",
              v: l.assignee ? (
                <span className="flex items-center gap-1.5">
                  <Avatar name={l.assignee.full_name} size={20} />{" "}
                  <span className="truncate">{l.assignee.full_name}</span>
                </span>
              ) : (
                <span className="text-slate-400">Unassigned</span>
              ),
              c: "#7C3AED",
              bg: "#EDE9FE",
            },
            {
              icon: Clock,
              k: "Last contact",
              v: l.last_contacted_at ? (
                <span title={fmtDateTime(l.last_contacted_at)}>
                  {fmtRelative(l.last_contacted_at)}
                </span>
              ) : (
                <span className="text-slate-400">Not yet</span>
              ),
              c: "#EA580C",
              bg: "#FFEDD5",
            },
            {
              icon: CalendarPlus,
              k: "Added",
              v: (
                <span title={fmtDateTime(l.created_at)}>
                  {fmtRelative(l.created_at)}
                </span>
              ),
              c: "#0B857D",
              bg: "#E6F7F5",
            },
          ].map((x) => (
            <div
              key={x.k}
              className="flex items-center gap-3 bg-white px-5 py-4 last:col-span-2 sm:last:col-span-1"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: x.bg, color: x.c }}
              >
                <x.icon size={17} />
              </span>
              <div className="min-w-0">
                <dt className="text-[12px] font-semibold text-slate-500">
                  {x.k}
                </dt>
                <dd className="truncate text-[14px] font-bold text-ink num">
                  {x.v}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {l.notes && (
          <div className="border-t border-mist-2 px-5 py-4 sm:px-7">
            <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[.1em] text-slate-500">
              <StickyNote size={13} /> About this lead
            </p>
            <p className="whitespace-pre-wrap rounded-xl bg-[#FFFBEB] px-4 py-3 text-[14px] leading-relaxed text-slate-700 ring-1 ring-[#FDE68A]/60">
              {l.notes}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="min-w-0 space-y-5 xl:col-span-2">
          <ActivityPanel lead_id={id} />
          <DocumentsPanel lead_id={id} />
        </div>
        <div className="min-w-0 space-y-5">
          <FollowUpsPanel lead_id={id} />
          <TasksPanel lead_id={id} />
          <NotesPanel lead_id={id} />
        </div>
      </div>

      <Modal open={edit} onClose={() => setEdit(false)} title="Edit lead" wide>
        {edit && <LeadForm lead={l} onDone={() => setEdit(false)} />}
      </Modal>
      <ConfirmDialog
        open={del}
        onClose={() => setDel(false)}
        title="Delete lead"
        message={`Delete "${l.name}" and all its follow-ups, documents and history? This cannot be undone.`}
        onConfirm={() => remove.mutate()}
        busy={remove.isPending}
      />
      <ConvertModal lead={l} open={convert} onClose={() => setConvert(false)} />
    </div>
  );
}

function ConvertModal({ lead, open, onClose }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [value, setValue] = useState(String(lead.estimated_value ?? 0));
  const m = useMutation({
    mutationFn: () =>
      convertLead(lead.id, service || undefined, Number(value) || undefined),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Converted to customer");
      onClose();
      navigate(`/clients/${c.id}`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Convert ${lead.name} to a customer`}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <p className="text-sm text-slate-600">
          The lead will be marked <b>Sale Done</b> and a client record will be created
          with all contact details, documents stay linked to the lead.
        </p>
        <Field label="Service / package">
          <Input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Premium Package"
          />
        </Field>
        <Field label="Contract value (CAD)">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={m.isPending}>
            {m.isPending && <Loader2 size={16} className="animate-spin" />}
            Convert
          </button>
        </div>
      </form>
    </Modal>
  );
}
