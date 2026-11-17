// import { useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { ArrowLeft, Pencil, Trash2, Building2, MapPin } from "lucide-react";
// import { deleteClient, getClient, updateClient } from "@/lib/api";
// import { errMsg } from "@/lib/http";
// import { useAuth } from "@/lib/auth";
// import { SERVICE_STATUSES } from "@/lib/types";
// import {
//   Avatar,
//   Badge,
//   ConfirmDialog,
//   Modal,
//   Select,
//   Spinner,
//   enumOptions,
//   fmtDateTime,
//   money,
// } from "@/components/ui";
// import {
//   ActivityPanel,
//   ContactActions,
//   DocumentsPanel,
//   FollowUpsPanel,
//   NotesPanel,
//   PaymentsPanel,
//   TasksPanel,
// } from "@/components/panels";
// import { ClientForm } from "./Clients";

// export default function ClientDetail() {
//   const { id = "" } = useParams();
//   const navigate = useNavigate();
//   const qc = useQueryClient();
//   const { isAdmin } = useAuth();
//   const q = useQuery({
//     queryKey: ["clients", id],
//     queryFn: () => getClient(id),
//   });
//   const [edit, setEdit] = useState(false);
//   const [del, setDel] = useState(false);
//   const inval = () => {
//     qc.invalidateQueries({ queryKey: ["clients"] });
//     qc.invalidateQueries({ queryKey: ["dashboard"] });
//   };
//   const status = useMutation({
//     mutationFn: (s) => updateClient(id, { service_status: s }),
//     onSuccess: inval,
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   const remove = useMutation({
//     mutationFn: () => deleteClient(id),
//     onSuccess: () => {
//       toast.success("Client deleted");
//       navigate("/clients");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });

//   if (q.isLoading) return <Spinner />;
//   if (q.error || !q.data)
//     return (
//       <div className="card p-6 text-sm text-slate-600">
//         Client not found or you don't have access.{" "}
//         <Link to="/clients" className="text-teal-700">
//           Back
//         </Link>
//       </div>
//     );
//   const c = q.data;

//   return (
//     <div>
//       <Link
//         to="/clients"
//         className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-ink"
//       >
//         <ArrowLeft size={15} /> Clients
//       </Link>
//       <div className="card mb-5 p-6">
//         <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
//           <div className="flex items-start gap-4">
//             <Avatar name={c.name} size={56} />
//             <div>
//               <div className="flex flex-wrap items-center gap-2">
//                 <h1 className="text-[24px] font-bold tracking-tight text-ink">
//                   {c.name}
//                 </h1>
//                 <Badge value={c.service_status} />
//                 {c.lead_id && (
//                   <Link
//                     to={`/leads/${c.lead_id}`}
//                     className="text-xs text-slate-500 hover:underline"
//                   >
//                     Original lead →
//                   </Link>
//                 )}
//               </div>
//               <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
//                 {c.company && (
//                   <span className="inline-flex items-center gap-1">
//                     <Building2 size={14} /> {c.company}
//                   </span>
//                 )}
//                 {c.address && (
//                   <span className="inline-flex items-center gap-1">
//                     <MapPin size={14} /> {c.address}
//                   </span>
//                 )}
//               </div>
//               <div className="mt-2 text-sm text-slate-700">
//                 {c.phone && <span className="mr-4">{c.phone}</span>}
//                 {c.email && <span>{c.email}</span>}
//               </div>
//               <div className="mt-3">
//                 <ContactActions phone={c.phone} email={c.email} />
//               </div>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button className="btn-secondary" onClick={() => setEdit(true)}>
//               <Pencil size={16} /> Edit
//             </button>
//             {isAdmin && (
//               <button
//                 className="btn-secondary text-amber-600"
//                 onClick={() => setDel(true)}
//               >
//                 <Trash2 size={16} />
//               </button>
//             )}
//           </div>
//         </div>
//         <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-mist pt-5 text-sm sm:grid-cols-3 lg:grid-cols-5">
//           <div>
//             <dt className="label">Service status</dt>
//             <dd>
//               <Select
//                 className="py-1"
//                 value={c.service_status}
//                 onChange={(e) => status.mutate(e.target.value)}
//                 options={enumOptions(SERVICE_STATUSES)}
//               />
//             </dd>
//           </div>
//           <div>
//             <dt className="label">Service</dt>
//             <dd className="text-slate-800">{c.service_name ?? "—"}</dd>
//           </div>
//           <div>
//             <dt className="label">Contract value</dt>
//             <dd className="font-medium text-slate-800">
//               {money(c.contract_value)}
//             </dd>
//           </div>
//           <div>
//             <dt className="label">Assigned</dt>
//             <dd className="text-slate-800">
//               {c.assignee?.full_name ?? "Unassigned"}
//             </dd>
//           </div>
//           <div>
//             <dt className="label">Client since</dt>
//             <dd className="text-slate-800">{fmtDateTime(c.created_at)}</dd>
//           </div>
//         </dl>
//         {c.notes && (
//           <p className="mt-4 whitespace-pre-wrap rounded-lg bg-mist p-4 text-sm text-slate-700">
//             {c.notes}
//           </p>
//         )}
//       </div>

//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
//         <div className="space-y-6 xl:col-span-2">
//           <PaymentsPanel clientId={id} />
//           <ActivityPanel client_id={id} lead_id={c.lead_id ?? undefined} />
//           <NotesPanel client_id={id} />
//           <DocumentsPanel client_id={id} />
//         </div>
//         <div className="space-y-6">
//           <FollowUpsPanel client_id={id} />
//           <TasksPanel client_id={id} />
//         </div>
//       </div>

//       <Modal
//         open={edit}
//         onClose={() => setEdit(false)}
//         title="Edit client"
//         wide
//       >
//         {edit && (
//           <ClientForm
//             client={c}
//             onSave={(patch) => updateClient(id, patch)}
//             onDone={() => {
//               setEdit(false);
//               inval();
//             }}
//           />
//         )}
//       </Modal>
//       <ConfirmDialog
//         open={del}
//         onClose={() => setDel(false)}
//         title="Delete client"
//         message="This permanently deletes the client, payments, documents and history."
//         onConfirm={() => remove.mutate()}
//         busy={remove.isPending}
//       />
//     </div>
//   );
// }
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  PauseCircle,
  Pencil,
  Phone,
  PlayCircle,
  StickyNote,
  Trash2,
  UserRound,
  Wallet,
  XCircle,
  Target,
} from "lucide-react";
import { deleteClient, getClient, getPayments, updateClient } from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { label } from "@/lib/types";
import {
  Avatar,
  ConfirmDialog,
  Modal,
  Spinner,
  fmtDateTime,
  fmtRelative,
  money,
  toneOf,
} from "@/components/ui";
import {
  ActivityPanel,
  ContactActions,
  DocumentsPanel,
  FollowUpsPanel,
  NotesPanel,
  PaymentsPanel,
  TasksPanel,
} from "@/components/panels";
import { ClientForm } from "./Clients";

const STEPS = [
  { key: "onboarding", name: "Onboarding", hint: "Getting started" },
  { key: "in_progress", name: "In progress", hint: "Work under way" },
  { key: "completed", name: "Completed", hint: "Service delivered" },
];

export default function ClientDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const q = useQuery({
    queryKey: ["clients", id],
    queryFn: () => getClient(id),
  });
  // same query as the Payments box, so it is fetched only once
  const pay = useQuery({
    queryKey: ["payments", id],
    queryFn: () => getPayments(id),
  });
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };
  const status = useMutation({
    mutationFn: (s) => updateClient(id, { service_status: s }),
    onSuccess: (_d, s) => {
      inval();
      toast.success(`Status changed to ${label(s)}`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteClient(id),
    onSuccess: () => {
      toast.success("Customer deleted");
      navigate("/clients");
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
        <h2 className="mt-4 text-lg font-bold text-ink">Customer not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          It may have been deleted, or you don't have access to it.
        </p>
        <Link to="/clients" className="btn-secondary mt-4">
          <ArrowLeft size={15} /> Back to customers
        </Link>
      </div>
    );
  const c = q.data;
  const st = c.service_status;
  const paused = st === "on_hold";
  const cancelled = st === "cancelled";
  const stepIdx = STEPS.findIndex((s) => s.key === st);
  const setStatus = (s) => s !== st && !status.isPending && status.mutate(s);

  const payments = pay.data ?? [];
  const paid = payments.reduce(
    (a, p) => a + (p.status === "paid" ? Number(p.amount) : 0),
    0,
  );
  const due = payments.reduce(
    (a, p) =>
      a +
      (p.status === "pending" || p.status === "overdue" ? Number(p.amount) : 0),
    0,
  );
  const contract = Number(c.contract_value) || 0;
  const paidPct = contract
    ? Math.min(100, Math.round((paid / contract) * 100))
    : 0;
  const sc = toneOf(st);

  return (
    <div>
      {/* ---------- breadcrumb ---------- */}
      <nav className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
        <Link
          to="/clients"
          className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-white hover:text-ink"
        >
          <ArrowLeft size={15} /> Customers
        </Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="truncate text-ink">{c.name}</span>
      </nav>

      {/* ---------- hero ---------- */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative overflow-hidden bg-ink px-5 py-6 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-400/10" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-teal-400/[.07]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="rounded-full ring-4 ring-white/15">
                <Avatar name={c.name} size={64} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
                    {c.name}
                  </h1>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-bold"
                    style={{ background: "rgba(255,255,255,.12)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                    {label(st)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-1 text-[12px] font-bold">
                    <Check size={12} strokeWidth={3} /> Customer
                  </span>
                  {c.lead_id && (
                    <Link
                      to={`/leads/${c.lead_id}`}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold text-white/80 ring-1 ring-white/20 hover:bg-white/10"
                    >
                      <Target size={12} /> Original lead
                    </Link>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-white/75">
                  {c.company && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={14} /> {c.company}
                    </span>
                  )}
                  {c.address && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} /> {c.address}
                    </span>
                  )}
                  {c.phone && (
                    <span className="inline-flex items-center gap-1.5 num">
                      <Phone size={14} /> {c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail size={14} className="shrink-0" />{" "}
                      <span className="truncate">{c.email}</span>
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <ContactActions phone={c.phone} email={c.email} dark />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[14px] font-semibold text-ink transition hover:bg-slate-100"
                onClick={() => setEdit(true)}
              >
                <Pencil size={15} /> Edit
              </button>
              {isAdmin && (
                <button
                  className="rounded-xl bg-white/10 px-3 py-2 text-white ring-1 ring-white/15 transition hover:bg-amber-500/80"
                  title="Delete customer"
                  aria-label="Delete customer"
                  onClick={() => setDel(true)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------- service progress ---------- */}
        <div className="border-b border-mist-2 px-5 py-4 sm:px-7">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-[.1em] text-slate-500">
              Service progress{" "}
              {status.isPending && (
                <Loader2 size={12} className="ml-1 inline animate-spin" />
              )}
            </p>
            <div className="flex gap-1">
              {paused || cancelled ? (
                <button
                  onClick={() => setStatus("in_progress")}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-bold text-teal-700 hover:bg-teal-50"
                >
                  <PlayCircle size={14} /> Resume work
                </button>
              ) : (
                st !== "completed" && (
                  <>
                    <button
                      onClick={() => setStatus("on_hold")}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <PauseCircle size={14} /> Put on hold
                    </button>
                    <button
                      onClick={() => setStatus("cancelled")}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <XCircle size={14} /> Cancel service
                    </button>
                  </>
                )
              )}
            </div>
          </div>
          {paused || cancelled ? (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13.5px] ring-1"
              style={{
                background: sc + "12",
                color: "#475569",
                boxShadow: `inset 0 0 0 1px ${sc}33`,
              }}
            >
              {paused ? (
                <PauseCircle
                  size={18}
                  style={{ color: sc }}
                  className="shrink-0"
                />
              ) : (
                <XCircle size={18} style={{ color: sc }} className="shrink-0" />
              )}
              {paused ? (
                <span>
                  This service is <b className="text-ink">on hold</b>. Resume it
                  when work starts again.
                </span>
              ) : (
                <span>
                  This service was <b className="text-ink">cancelled</b>. Resume
                  it if the customer comes back.
                </span>
              )}
            </div>
          ) : (
            <ol className="grid grid-cols-3 gap-1.5">
              {STEPS.map((s, i) => {
                const done = i < stepIdx || st === "completed";
                const cur = i === stepIdx;
                return (
                  <li key={s.key}>
                    <button
                      onClick={() => setStatus(s.key)}
                      title={`Move to ${s.name}`}
                      aria-current={cur ? "step" : undefined}
                      className={clsx(
                        "flex w-full flex-col items-start rounded-xl px-2.5 py-2 text-left transition sm:px-3",
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
                          {done && !cur ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            i + 1
                          )}
                        </span>
                        <span className="truncate text-[13px] font-bold">
                          {s.name}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "mt-0.5 hidden truncate text-[11.5px] sm:block",
                          cur ? "text-white/80" : "opacity-70",
                        )}
                      >
                        {s.hint}
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
          <div className="col-span-2 flex items-center gap-3 bg-white px-5 py-4 sm:col-span-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
              <Wallet size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[12px] font-semibold text-slate-500">
                Contract value
              </dt>
              <dd className="text-[17px] font-extrabold text-ink num">
                {money(contract)}
              </dd>
              {contract > 0 && (
                <div
                  className="mt-1.5"
                  title={`${money(paid)} paid · ${money(due)} still due`}
                >
                  <div className="h-1.5 overflow-hidden rounded-full bg-mist-2">
                    <div
                      className="h-full rounded-full bg-[#16A34A] transition-all duration-700"
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11.5px] text-slate-500 num">
                    {paidPct}% paid{due > 0 ? ` · ${money(due)} due` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
          {[
            {
              icon: Briefcase,
              k: "Service / package",
              v: c.service_name || (
                <span className="text-slate-400">Not set</span>
              ),
              c: "#2563EB",
              bg: "#DBEAFE",
            },
            {
              icon: UserRound,
              k: "Assigned to",
              v: c.assignee ? (
                <span className="flex items-center gap-1.5">
                  <Avatar name={c.assignee.full_name} size={20} />{" "}
                  <span className="truncate">{c.assignee.full_name}</span>
                </span>
              ) : (
                <span className="text-slate-400">Unassigned</span>
              ),
              c: "#7C3AED",
              bg: "#EDE9FE",
            },
            {
              icon: Wallet,
              k: "Paid so far",
              v: <span className="text-[#16A34A]">{money(paid)}</span>,
              c: "#0B857D",
              bg: "#E6F7F5",
            },
            {
              icon: CalendarCheck,
              k: "Customer since",
              v: (
                <span title={fmtDateTime(c.created_at)}>
                  {fmtRelative(c.created_at)}
                </span>
              ),
              c: "#EA580C",
              bg: "#FFEDD5",
            },
          ].map((x) => (
            <div
              key={x.k}
              className="flex items-center gap-3 bg-white px-5 py-4"
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

        {c.notes && (
          <div className="border-t border-mist-2 px-5 py-4 sm:px-7">
            <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[.1em] text-slate-500">
              <StickyNote size={13} /> About this customer
            </p>
            <p className="whitespace-pre-wrap rounded-xl bg-[#FFFBEB] px-4 py-3 text-[14px] leading-relaxed text-slate-700 ring-1 ring-[#FDE68A]/60">
              {c.notes}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="min-w-0 space-y-5 xl:col-span-2">
          <PaymentsPanel clientId={id} />
          <ActivityPanel client_id={id} lead_id={c.lead_id ?? undefined} />
          <DocumentsPanel client_id={id} />
        </div>
        <div className="min-w-0 space-y-5">
          <FollowUpsPanel client_id={id} />
          <TasksPanel client_id={id} />
          <NotesPanel client_id={id} />
        </div>
      </div>

      <Modal
        open={edit}
        onClose={() => setEdit(false)}
        title="Edit customer"
        wide
      >
        {edit && (
          <ClientForm
            client={c}
            onSave={(patch) => updateClient(id, patch)}
            onDone={() => {
              setEdit(false);
              inval();
            }}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={del}
        onClose={() => setDel(false)}
        title="Delete customer"
        message={`Delete "${c.name}" with all payments, documents and history? This cannot be undone.`}
        onConfirm={() => remove.mutate()}
        busy={remove.isPending}
      />
    </div>
  );
}
