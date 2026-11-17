// import { useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Plus, Search, Loader2 } from "lucide-react";
// import { createClientRecord, getClients, getProfiles } from "@/lib/api";
// import { errMsg } from "@/lib/http";
// import { useAuth } from "@/lib/auth";
// import { SERVICE_STATUSES } from "@/lib/types";
// import {
//   Avatar,
//   Badge,
//   Empty,
//   Field,
//   Input,
//   Modal,
//   Select,
//   Spinner,
//   Textarea,
//   enumOptions,
//   fmtDate,
//   money,
// } from "@/components/ui";
// import { ModuleHeader } from "@/components/Layout";
// import { AssigneeSelect } from "@/components/forms";

// export default function Clients() {
//   const { isAdmin } = useAuth();
//   const navigate = useNavigate();
//   const [params, setParams] = useSearchParams();
//   const search = params.get("q") ?? "",
//     status = params.get("status") ?? "",
//     assigned = params.get("assigned") ?? "";
//   const setP = (k, v) => {
//     const n = new URLSearchParams(params);
//     if (v) n.set(k, v);
//     else n.delete(k);
//     setParams(n, { replace: true });
//   };
//   const [open, setOpen] = useState(false);
//   const q = useQuery({
//     queryKey: ["clients", { search, status, assigned }],
//     queryFn: () => getClients({ search, status, assigned_to: assigned }),
//     placeholderData: (p) => p,
//   });
//   const profiles = useQuery({
//     queryKey: ["profiles"],
//     queryFn: getProfiles,
//     enabled: isAdmin,
//   });

//   return (
//     <div>
//       <ModuleHeader
//         moduleKey="clients"
//         title="Clients"
//         subtitle={`${q.data?.length ?? 0} clients`}
//         actions={
//           <button className="btn-primary" onClick={() => setOpen(true)}>
//             <Plus size={16} /> New client
//           </button>
//         }
//       />
//       <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
//         <div className="relative lg:col-span-2">
//           <Search
//             size={16}
//             className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
//           />
//           <input
//             className="input pl-9"
//             placeholder="Search clients…"
//             value={search}
//             onChange={(e) => setP("q", e.target.value)}
//           />
//         </div>
//         <Select
//           value={status}
//           onChange={(e) => setP("status", e.target.value)}
//           options={enumOptions(SERVICE_STATUSES)}
//           placeholder="All service statuses"
//         />
//         {isAdmin && (
//           <Select
//             value={assigned}
//             onChange={(e) => setP("assigned", e.target.value)}
//             options={(profiles.data ?? []).map((p) => ({
//               value: p.id,
//               label: p.full_name,
//             }))}
//             placeholder="All employees"
//           />
//         )}
//       </div>
//       <div className="card overflow-hidden">
//         {q.isLoading ? (
//           <Spinner />
//         ) : !q.data?.length ? (
//           <Empty
//             title="No clients yet"
//             hint="Convert a lead or add a client directly."
//           />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Client</th>
//                   <th>Contact</th>
//                   <th>Service</th>
//                   <th>Status</th>
//                   <th className="text-right">Contract</th>
//                   <th>Assigned</th>
//                   <th>Since</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {q.data.map((c) => (
//                   <tr
//                     key={c.id}
//                     className="cursor-pointer"
//                     onClick={() => navigate(`/clients/${c.id}`)}
//                   >
//                     <td>
//                       <div className="flex items-center gap-2">
//                         <Avatar name={c.name} size={28} />
//                         <div>
//                           <Link
//                             to={`/clients/${c.id}`}
//                             className="font-medium text-ink hover:text-teal-700"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             {c.name}
//                           </Link>
//                           <div className="text-xs text-slate-500">
//                             {c.company ?? ""}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <div>{c.phone ?? "—"}</div>
//                       <div className="text-xs text-slate-500">
//                         {c.email ?? ""}
//                       </div>
//                     </td>
//                     <td>{c.service_name ?? "—"}</td>
//                     <td>
//                       <Badge value={c.service_status} />
//                     </td>
//                     <td className="text-right">{money(c.contract_value)}</td>
//                     <td className="text-xs">{c.assignee?.full_name ?? "—"}</td>
//                     <td className="whitespace-nowrap text-xs text-slate-500">
//                       {fmtDate(c.created_at)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       <Modal open={open} onClose={() => setOpen(false)} title="New client" wide>
//         <ClientForm
//           onDone={(c) => {
//             setOpen(false);
//             navigate(`/clients/${c.id}`);
//           }}
//         />
//       </Modal>
//     </div>
//   );
// }

// export function ClientForm({ client, onDone, onSave }) {
//   const qc = useQueryClient();
//   const [f, setF] = useState({
//     name: client?.name ?? "",
//     phone: client?.phone ?? "",
//     email: client?.email ?? "",
//     company: client?.company ?? "",
//     address: client?.address ?? "",
//     service_name: client?.service_name ?? "",
//     service_status: client?.service_status ?? "onboarding",
//     contract_value: String(client?.contract_value ?? 0),
//     notes: client?.notes ?? "",
//     assigned_to: client?.assigned_to ?? null,
//   });
//   const m = useMutation({
//     mutationFn: async () => {
//       const payload = {
//         ...f,
//         phone: f.phone || null,
//         email: f.email || null,
//         company: f.company || null,
//         address: f.address || null,
//         service_name: f.service_name || null,
//         notes: f.notes || null,
//         contract_value: Number(f.contract_value) || 0,
//         service_status: f.service_status,
//       };
//       if (client && onSave) {
//         await onSave(payload);
//         return client;
//       }
//       return createClientRecord(payload);
//     },
//     onSuccess: (c) => {
//       qc.invalidateQueries({ queryKey: ["clients"] });
//       qc.invalidateQueries({ queryKey: ["dashboard"] });
//       toast.success(client ? "Client updated" : "Client created");
//       onDone?.(c);
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         m.mutate();
//       }}
//       className="grid grid-cols-1 gap-4 sm:grid-cols-2"
//     >
//       <Field label="Full name *" className="sm:col-span-2">
//         <Input
//           required
//           value={f.name}
//           onChange={(e) => setF({ ...f, name: e.target.value })}
//         />
//       </Field>
//       <Field label="Phone">
//         <Input
//           value={f.phone}
//           onChange={(e) => setF({ ...f, phone: e.target.value })}
//         />
//       </Field>
//       <Field label="Email">
//         <Input
//           type="email"
//           value={f.email}
//           onChange={(e) => setF({ ...f, email: e.target.value })}
//         />
//       </Field>
//       <Field label="Company">
//         <Input
//           value={f.company}
//           onChange={(e) => setF({ ...f, company: e.target.value })}
//         />
//       </Field>
//       <Field label="Address">
//         <Input
//           value={f.address}
//           onChange={(e) => setF({ ...f, address: e.target.value })}
//         />
//       </Field>
//       <Field label="Service / package">
//         <Input
//           value={f.service_name}
//           onChange={(e) => setF({ ...f, service_name: e.target.value })}
//         />
//       </Field>
//       <Field label="Service status">
//         <Select
//           value={f.service_status}
//           onChange={(e) => setF({ ...f, service_status: e.target.value })}
//           options={enumOptions(SERVICE_STATUSES)}
//         />
//       </Field>
//       <Field label="Contract value (CAD)">
//         <Input
//           type="number"
//           min={0}
//           step="0.01"
//           value={f.contract_value}
//           onChange={(e) => setF({ ...f, contract_value: e.target.value })}
//         />
//       </Field>
//       <Field label="Assigned to">
//         <AssigneeSelect
//           value={f.assigned_to}
//           onChange={(v) => setF({ ...f, assigned_to: v })}
//           allowEmpty
//         />
//       </Field>
//       <Field label="Notes" className="sm:col-span-2">
//         <Textarea
//           value={f.notes}
//           onChange={(e) => setF({ ...f, notes: e.target.value })}
//         />
//       </Field>
//       <div className="flex justify-end sm:col-span-2">
//         <button className="btn-primary" disabled={m.isPending}>
//           {m.isPending && <Loader2 size={16} className="animate-spin" />}
//           {client ? "Save changes" : "Create client"}
//         </button>
//       </div>
//     </form>
//   );
// }

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  Briefcase,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { createClientRecord, getClients, getProfiles } from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { SERVICE_STATUSES, label as humanize } from "@/lib/types";
import {
  Avatar,
  Field,
  Input,
  Modal,
  Select,
  Spinner,
  Textarea,
  enumOptions,
  fmtDate,
  money,
  toneOf,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { AssigneeSelect } from "@/components/forms";

/** soft coloured status pill */
function StatusPill({ value }) {
  const c = toneOf(value);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold"
      style={{ color: c, background: c + "17" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {humanize(value)}
    </span>
  );
}

const ACTIVE = ["onboarding", "in_progress"];

export default function Clients() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "",
    status = params.get("status") ?? "",
    assigned = params.get("assigned") ?? "";
  const setP = (k, v) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  };
  const [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: ["clients", { search, status, assigned }],
    queryFn: () => getClients({ search, status, assigned_to: assigned }),
    placeholderData: (p) => p,
  });
  // the same list without the status filter: used for the counts on the tabs and the stat cards
  const base = useQuery({
    queryKey: ["clients", { search, status: "", assigned }],
    queryFn: () => getClients({ search, status: "", assigned_to: assigned }),
    placeholderData: (p) => p,
  });
  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: isAdmin,
  });

  const all = base.data ?? [];
  const rows = q.data ?? [];
  const stats = useMemo(() => {
    const by = {};
    let value = 0,
      activeValue = 0;
    for (const c of all) {
      by[c.service_status] = (by[c.service_status] ?? 0) + 1;
      value += Number(c.contract_value) || 0;
      if (ACTIVE.includes(c.service_status))
        activeValue += Number(c.contract_value) || 0;
    }
    return {
      by,
      value,
      activeValue,
      active: (by.onboarding ?? 0) + (by.in_progress ?? 0),
    };
  }, [all]);
  const filtered = !!(search || assigned);

  const CARDS = [
    {
      label: "Total clients",
      value: all.length,
      icon: Users,
      c: "#0B857D",
      bg: "#E6F7F5",
    },
    {
      label: "Active",
      value: stats.active,
      icon: TrendingUp,
      c: "#1E8F99",
      bg: "#E3F3F5",
      hint: "Onboarding + in progress",
    },
    {
      label: "Completed",
      value: stats.by.completed ?? 0,
      icon: UserCheck,
      c: "#2F7D4A",
      bg: "#E7F4EC",
    },
    {
      label: "Contract value",
      value: money(stats.value),
      icon: CircleDollarSign,
      c: "#B7791F",
      bg: "#FEF3C7",
      hint: `${money(stats.activeValue)} in active work`,
    },
  ];

  return (
    <div>
      <ModuleHeader
        moduleKey="clients"
        title="Clients"
        subtitle="Everyone you are working with — their service, status and contract."
        actions={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> New client
          </button>
        }
      />

      {/* ---------- stats ---------- */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map((s) => (
          <div key={s.label} className="card flex items-center gap-3.5 p-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: s.bg, color: s.c }}
            >
              <s.icon size={21} />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-slate-500">
                {s.label}
              </p>
              <p className="truncate text-[22px] font-extrabold leading-tight text-ink num">
                {s.value}
              </p>
              {s.hint && (
                <p className="hidden truncate text-[11.5px] text-slate-400 sm:block">
                  {s.hint}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {/* ---------- toolbar ---------- */}
        <div className="flex flex-col gap-3 border-b border-mist-2 p-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9 pr-9"
              placeholder="Search by name, company, phone or email…"
              value={search}
              onChange={(e) => setP("q", e.target.value)}
            />
            {search && (
              <button
                onClick={() => setP("q", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {isAdmin && (
            <div className="lg:w-60">
              <Select
                value={assigned}
                onChange={(e) => setP("assigned", e.target.value)}
                options={(profiles.data ?? []).map((p) => ({
                  value: p.id,
                  label: p.full_name,
                }))}
                placeholder="All employees"
              />
            </div>
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-mist-2 bg-slate-50/60 px-3 py-2 [scrollbar-width:none]">
          {[
            ["", "All", all.length],
            ...SERVICE_STATUSES.map((st) => [
              st,
              humanize(st),
              stats.by[st] ?? 0,
            ]),
          ].map(([v, l, n]) => {
            const on = status === v;
            return (
              <button
                key={v || "all"}
                onClick={() => setP("status", v)}
                className={clsx(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition",
                  on
                    ? "bg-white text-ink shadow-card ring-1 ring-mist-2"
                    : "text-slate-500 hover:bg-white/70 hover:text-ink",
                )}
              >
                {v && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: toneOf(v) }}
                  />
                )}
                {l}
                <span
                  className={clsx(
                    "rounded-full px-1.5 text-[11px] font-bold num",
                    on ? "bg-teal-600 text-white" : "bg-mist-2 text-slate-500",
                  )}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        {/* ---------- list ---------- */}
        {q.isLoading ? (
          <Spinner />
        ) : !rows.length ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Briefcase size={26} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">
              {filtered || status ? "No clients match" : "No clients yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {filtered || status
                ? "Try a different search or status."
                : "Convert a won lead into a client, or add one directly."}
            </p>
            {filtered || status ? (
              <button
                className="btn-secondary mt-4"
                onClick={() =>
                  setParams(new URLSearchParams(), { replace: true })
                }
              >
                Clear filters
              </button>
            ) : (
              <button
                className="btn-primary mt-4"
                onClick={() => setOpen(true)}
              >
                <Plus size={16} /> New client
              </button>
            )}
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-mist-2 text-[11.5px] font-bold uppercase tracking-[.08em] text-slate-500">
                    <th className="py-3 pl-5 pr-3">Client</th>
                    <th className="px-3">Contact</th>
                    <th className="px-3">Service</th>
                    <th className="px-3">Status</th>
                    <th className="px-3 text-right">Contract</th>
                    <th className="px-3">Assigned to</th>
                    <th className="px-3">Since</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      className="group cursor-pointer transition-colors hover:bg-teal-50/40"
                      onClick={() => navigate(`/clients/${c.id}`)}
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size={38} />
                          <div className="min-w-0">
                            <Link
                              to={`/clients/${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block truncate text-[14.5px] font-bold text-ink group-hover:text-teal-700"
                            >
                              {c.name}
                            </Link>
                            {c.company ? (
                              <p className="truncate text-[12.5px] text-slate-500">
                                {c.company}
                              </p>
                            ) : (
                              <p className="text-[12.5px] text-slate-300">
                                No company
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3">
                        {c.phone || c.email ? (
                          <div className="space-y-0.5 text-[12.5px]">
                            {c.phone && (
                              <a
                                href={`tel:${c.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-teal-700 num"
                              >
                                <Phone size={12} className="text-slate-400" />{" "}
                                {c.phone}
                              </a>
                            )}
                            {c.email && (
                              <a
                                href={`mailto:${c.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex max-w-[220px] items-center gap-1.5 truncate text-slate-500 hover:text-teal-700"
                              >
                                <Mail
                                  size={12}
                                  className="shrink-0 text-slate-400"
                                />{" "}
                                <span className="truncate">{c.email}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">No contact</span>
                        )}
                      </td>
                      <td className="px-3">
                        {c.service_name ? (
                          <span className="inline-flex max-w-[200px] items-center gap-1.5 truncate rounded-lg bg-mist px-2.5 py-1 text-[12.5px] font-semibold text-slate-700">
                            <Briefcase
                              size={12}
                              className="shrink-0 text-slate-400"
                            />
                            <span className="truncate">{c.service_name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3">
                        <StatusPill value={c.service_status} />
                      </td>
                      <td
                        className={clsx(
                          "px-3 text-right text-[14px] font-bold num",
                          Number(c.contract_value)
                            ? "text-ink"
                            : "text-slate-300",
                        )}
                      >
                        {money(c.contract_value)}
                      </td>
                      <td className="px-3">
                        {c.assignee?.full_name ? (
                          <span className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-slate-700">
                            <Avatar name={c.assignee.full_name} size={24} />
                            {c.assignee.full_name}
                          </span>
                        ) : (
                          <span className="text-[12.5px] text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 text-[12.5px] text-slate-500 num">
                        {fmtDate(c.created_at)}
                      </td>
                      <td className="pr-4">
                        <ChevronRight
                          size={17}
                          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* phone cards */}
            <ul className="divide-y divide-mist md:hidden">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/clients/${c.id}`}
                    className="flex items-start gap-3 p-4 active:bg-slate-50"
                  >
                    <Avatar name={c.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">
                            {c.name}
                          </p>
                          <p className="truncate text-[12.5px] text-slate-500">
                            {[c.company, c.service_name]
                              .filter(Boolean)
                              .join(" · ") ||
                              c.phone ||
                              c.email ||
                              "—"}
                          </p>
                        </div>
                        <span className="shrink-0 text-[14px] font-bold text-ink num">
                          {money(c.contract_value)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusPill value={c.service_status} />
                        {c.assignee?.full_name && (
                          <span className="text-[12px] text-slate-500">
                            {c.assignee.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-mist-2 bg-slate-50/60 px-5 py-2.5 text-[12.5px] text-slate-500">
              Showing <b className="text-ink num">{rows.length}</b>{" "}
              {rows.length === 1 ? "client" : "clients"}
              {status && <> · {humanize(status)}</>}
            </div>
          </>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New client" wide>
        <ClientForm
          onDone={(c) => {
            setOpen(false);
            navigate(`/clients/${c.id}`);
          }}
        />
      </Modal>
    </div>
  );
}

export function ClientForm({ client, onDone, onSave }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    company: client?.company ?? "",
    address: client?.address ?? "",
    service_name: client?.service_name ?? "",
    service_status: client?.service_status ?? "onboarding",
    contract_value: String(client?.contract_value ?? 0),
    notes: client?.notes ?? "",
    assigned_to: client?.assigned_to ?? null,
  });
  const m = useMutation({
    mutationFn: async () => {
      const payload = {
        ...f,
        phone: f.phone || null,
        email: f.email || null,
        company: f.company || null,
        address: f.address || null,
        service_name: f.service_name || null,
        notes: f.notes || null,
        contract_value: Number(f.contract_value) || 0,
        service_status: f.service_status,
      };
      if (client && onSave) {
        await onSave(payload);
        return client;
      }
      return createClientRecord(payload);
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(client ? "Client updated" : "Client created");
      onDone?.(c);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Field label="Full name *" className="sm:col-span-2">
        <Input
          required
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
      </Field>
      <Field label="Company">
        <Input
          value={f.company}
          onChange={(e) => setF({ ...f, company: e.target.value })}
        />
      </Field>
      <Field label="Address">
        <Input
          value={f.address}
          onChange={(e) => setF({ ...f, address: e.target.value })}
        />
      </Field>
      <Field label="Service / package">
        <Input
          value={f.service_name}
          onChange={(e) => setF({ ...f, service_name: e.target.value })}
        />
      </Field>
      <Field label="Service status">
        <Select
          value={f.service_status}
          onChange={(e) => setF({ ...f, service_status: e.target.value })}
          options={enumOptions(SERVICE_STATUSES)}
        />
      </Field>
      <Field label="Contract value (CAD)">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={f.contract_value}
          onChange={(e) => setF({ ...f, contract_value: e.target.value })}
        />
      </Field>
      <Field label="Assigned to">
        <AssigneeSelect
          value={f.assigned_to}
          onChange={(v) => setF({ ...f, assigned_to: v })}
          allowEmpty
        />
      </Field>
      <Field label="Notes" className="sm:col-span-2">
        <Textarea
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <button className="btn-primary" disabled={m.isPending}>
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          {client ? "Save changes" : "Create client"}
        </button>
      </div>
    </form>
  );
}
