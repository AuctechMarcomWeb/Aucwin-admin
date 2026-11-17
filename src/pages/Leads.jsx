import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Papa from "papaparse";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Facebook,
  Globe,
  Mail,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Share2,
  Store,
  Target,
  Trash2,
  Trophy,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  deleteLead,
  exportLeads,
  getDashboardStats,
  getLeads,
  getProfiles,
  importLeads,
} from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { LEAD_SOURCES, LEAD_STATUSES, ACTIVE_LEAD_STATUSES, normalizeLeadStatus, label } from "@/lib/types";
import {
  ConfirmDialog,
  Modal,
  Select,
  Spinner,
  enumOptions,
  fmtDate,
  fmtRelative,
  money,
  Avatar,
  toneOf,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { LeadForm } from "@/components/forms";

const PAGE_SIZE = 25;
const SORTS = [
  { value: "created_at", label: "Date added" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "estimated_value", label: "Value" },
  { value: "updated_at", label: "Last updated" },
];
const SOURCE_ICON = {
  website: Globe,
  referral: Share2,
  social_media: Users,
  facebook: Facebook,
  phone: Phone,
  walk_in: Store,
  advertisement: Megaphone,
  other: MoreHorizontal,
};

function StatusPill({ value }) {
  const c = toneOf(value);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold"
      style={{ color: c, background: c + "17" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {label(value)}
    </span>
  );
}
function SourceChip({ value }) {
  const Icon = SOURCE_ICON[value] ?? MoreHorizontal;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-mist px-2.5 py-1 text-[12.5px] font-semibold text-slate-600">
      <Icon size={13} className="text-slate-400" />
      {label(value)}
    </span>
  );
}

export default function Leads() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const source = params.get("source") ?? "";
  const assigned = params.get("assigned") ?? "";
  const sort = params.get("sort") ?? "created_at";
  const dir = params.get("dir") ?? "desc";
  const page = Number(params.get("page") ?? 0);
  const setP = (k, v) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    if (k !== "page") n.delete("page");
    setParams(n, { replace: true });
  };

  const [modal, setModal] = useState(params.get("new") ? "new" : null);
  // "New lead" in the top bar works even when you are already on this page
  useEffect(() => {
    if (!params.get("new")) return;
    setModal("new");
    const n = new URLSearchParams(params);
    n.delete("new");
    setParams(n, { replace: true });
  }, [params, setParams]);
  const [del, setDel] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const leads = useQuery({
    queryKey: ["leads", { search, status, source, assigned, sort, dir, page }],
    queryFn: () =>
      getLeads({
        search,
        status,
        source,
        assigned_to: assigned,
        sort,
        dir,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (p) => p,
  });
  // counts per stage + money in the pipeline (same numbers as the Overview page)
  const stats = useQuery({
    queryKey: ["dashboard", 30],
    queryFn: () => getDashboardStats(30),
  });
  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: isAdmin,
  });
  const remove = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Lead deleted");
      setDel(null);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const count = leads.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const rows = leads.data?.rows ?? [];
  const by = stats.data?.leads_by_status ?? {};
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  const open = ACTIVE_LEAD_STATUSES.reduce((n, key) => n + (by[key] || 0), 0);
  const filtersOn = !!(search || source || assigned || status);

  async function doExport() {
    try {
      const all = await exportLeads();
      const csv = Papa.unparse(
        all.map((l) => ({
          name: l.name,
          phone: l.phone,
          email: l.email,
          company: l.company,
          address: l.address,
          source: l.source,
          status: l.status,
          estimated_value: l.estimated_value,
          assigned_to: l.assignee?.full_name ?? "",
          notes: l.notes,
          created_at: l.created_at,
        })),
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Exported ${all.length} leads`);
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  const CARDS = [
    {
      icon: Users,
      label: "All leads",
      value: total,
      c: "#DB2777",
      bg: "#FCE7F3",
      hint: `${by.junk || 0} junk leads`,
    },
    {
      icon: Target,
      label: "Open leads",
      value: open,
      c: "#7C3AED",
      bg: "#EDE9FE",
      hint: `${money(stats.data?.pipeline_value ?? 0)} possible`,
    },
    {
      icon: UserPlus,
      label: "New (last 30 days)",
      value: stats.data?.new_leads ?? 0,
      c: "#2563EB",
      bg: "#DBEAFE",
      hint: `${by.new_lead || 0} not contacted yet`,
    },
    {
      icon: Trophy,
      label: "Sale Done",
      value: by.sale_done || 0,
      c: "#16A34A",
      bg: "#DCFCE7",
      hint: `${stats.data?.conversion_rate ?? 0}% conversion`,
    },
  ];

  const actions = (l) => (
    <div
      className="flex justify-end gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
        title="Edit"
        aria-label={`Edit ${l.name}`}
        onClick={() => setModal(l)}
      >
        <Pencil size={15} />
      </button>
      {isAdmin && (
        <button
          className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
          title="Delete"
          aria-label={`Delete ${l.name}`}
          onClick={() => setDel(l)}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <ModuleHeader
        moduleKey="leads"
        title="Leads"
        subtitle="Everyone who asked about your services — from first call to closed deal."
        actions={
          <>
            <button
              className="btn-secondary"
              onClick={() => setImportOpen(true)}
            >
              <Upload size={16} /> Import
            </button>
            <button className="btn-secondary" onClick={doExport}>
              <Download size={16} /> Export
            </button>
            <button className="btn-primary" onClick={() => setModal("new")}>
              <Plus size={16} /> New lead
            </button>
          </>
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
                {stats.isLoading ? "–" : s.value}
              </p>
              <p className="hidden truncate text-[11.5px] text-slate-400 sm:block">
                {s.hint}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {/* ---------- toolbar ---------- */}
        <div className="flex flex-col gap-3 border-b border-mist-2 p-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9 pr-9"
              placeholder="Search name, email, phone, company…"
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
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-44">
              <Select
                value={source}
                onChange={(e) => setP("source", e.target.value)}
                options={enumOptions(LEAD_SOURCES)}
                placeholder="All sources"
              />
            </div>
            {isAdmin && (
              <div className="sm:w-48">
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
            <div className="col-span-2 flex gap-2 sm:col-span-1">
              <div className="flex-1 sm:w-40">
                <Select
                  value={sort}
                  onChange={(e) => setP("sort", e.target.value)}
                  options={SORTS}
                  aria-label="Sort by"
                />
              </div>
              <button
                className="btn-secondary px-3"
                title={
                  dir === "asc"
                    ? "Oldest / smallest first"
                    : "Newest / biggest first"
                }
                aria-label="Toggle sort direction"
                onClick={() => setP("dir", dir === "asc" ? "desc" : "asc")}
              >
                {dir === "asc" ? (
                  <ArrowUpNarrowWide size={16} />
                ) : (
                  <ArrowDownWideNarrow size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* ---------- stage tabs ---------- */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-mist-2 bg-slate-50/60 px-3 py-2 [scrollbar-width:none]">
          {[
            ["", "All", total],
            ...LEAD_STATUSES.map((st) => [st, label(st), by[st] || 0]),
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
          {filtersOn && (
            <button
              onClick={() =>
                setParams(new URLSearchParams(), { replace: true })
              }
              className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-teal-700 hover:bg-teal-50"
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        {/* ---------- list ---------- */}
        {leads.isLoading ? (
          <Spinner />
        ) : leads.error ? (
          <p className="p-4 text-amber-600">{errMsg(leads.error)}</p>
        ) : !rows.length ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCE7F3] text-[#DB2777]">
              <Users size={26} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">
              {filtersOn ? "No leads match" : "No leads yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {filtersOn
                ? "Try a different search, stage or source."
                : "Add your first lead, or import a list from a CSV file."}
            </p>
            <div className="mt-4 flex gap-2">
              {filtersOn && (
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setParams(new URLSearchParams(), { replace: true })
                  }
                >
                  Clear filters
                </button>
              )}
              <button className="btn-primary" onClick={() => setModal("new")}>
                <Plus size={16} /> New lead
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div
              className={clsx(
                "hidden overflow-x-auto transition-opacity lg:block",
                leads.isFetching && "opacity-70",
              )}
            >
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-mist-2 text-[11.5px] font-bold uppercase tracking-[.08em] text-slate-500">
                    <th className="py-3 pl-5 pr-3">Lead</th>
                    <th className="px-3">Contact</th>
                    <th className="px-3">Stage</th>
                    <th className="px-3">Source</th>
                    <th className="px-3 text-right">Value</th>
                    <th className="px-3">Assigned to</th>
                    <th className="px-3">Added</th>
                    <th className="pr-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {rows.map((l) => (
                    <tr
                      key={l.id}
                      className="group cursor-pointer transition-colors hover:bg-teal-50/40"
                      onClick={() => navigate(`/leads/${l.id}`)}
                    >
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={l.name} size={38} />
                          <div className="min-w-0">
                            <Link
                              to={`/leads/${l.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block max-w-[220px] truncate text-[14.5px] font-bold text-ink group-hover:text-teal-700"
                            >
                              {l.name}
                            </Link>
                            {l.company ? (
                              <p className="flex max-w-[220px] items-center gap-1 truncate text-[12.5px] text-slate-500">
                                <Building2
                                  size={12}
                                  className="shrink-0 text-slate-400"
                                />
                                <span className="truncate">{l.company}</span>
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
                        {l.phone || l.email ? (
                          <div className="space-y-0.5 text-[12.5px]">
                            {l.phone && (
                              <a
                                href={`tel:${l.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-teal-700 num"
                              >
                                <Phone size={12} className="text-slate-400" />{" "}
                                {l.phone}
                              </a>
                            )}
                            {l.email && (
                              <a
                                href={`mailto:${l.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex max-w-[230px] items-center gap-1.5 text-slate-500 hover:text-teal-700"
                              >
                                <Mail
                                  size={12}
                                  className="shrink-0 text-slate-400"
                                />{" "}
                                <span className="truncate">{l.email}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">No contact</span>
                        )}
                      </td>
                      <td className="px-3">
                        <StatusPill value={l.status} />
                      </td>
                      <td className="px-3">
                        <SourceChip value={l.source} />
                      </td>
                      <td
                        className={clsx(
                          "px-3 text-right text-[14px] font-bold num",
                          Number(l.estimated_value)
                            ? "text-ink"
                            : "text-slate-300",
                        )}
                      >
                        {money(l.estimated_value)}
                      </td>
                      <td className="px-3">
                        {l.assignee ? (
                          <span className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-slate-700">
                            <Avatar name={l.assignee.full_name} size={24} />
                            {l.assignee.full_name}
                          </span>
                        ) : (
                          <span className="text-[12.5px] text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td
                        className="whitespace-nowrap px-3 text-[12.5px] text-slate-500"
                        title={fmtDate(l.created_at)}
                      >
                        {fmtRelative(l.created_at)}
                      </td>
                      <td className="pr-4">{actions(l)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* phone / tablet cards */}
            <ul className="divide-y divide-mist lg:hidden">
              {rows.map((l) => (
                <li key={l.id}>
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/leads/${l.id}`)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate(`/leads/${l.id}`)
                    }
                    className="flex cursor-pointer items-start gap-3 p-4 active:bg-slate-50"
                  >
                    <Avatar name={l.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">
                            {l.name}
                          </p>
                          <p className="truncate text-[12.5px] text-slate-500">
                            {[l.company, l.phone].filter(Boolean).join(" · ") ||
                              l.email ||
                              "—"}
                          </p>
                        </div>
                        <span className="shrink-0 text-[14px] font-bold text-ink num">
                          {money(l.estimated_value)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusPill value={l.status} />
                        <SourceChip value={l.source} />
                      </div>
                      <p className="mt-1.5 truncate text-[12px] text-slate-400">
                        {fmtRelative(l.created_at)}
                        {l.assignee && (
                          <span className="text-slate-500">
                            {" "}
                            · {l.assignee.full_name}
                          </span>
                        )}
                      </p>
                    </div>
                    {actions(l)}
                  </div>
                </li>
              ))}
            </ul>

            {/* ---------- paging ---------- */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-mist-2 bg-slate-50/60 px-5 py-2.5 text-[12.5px] text-slate-500">
              <span>
                Showing{" "}
                <b className="text-ink num">
                  {page * PAGE_SIZE + 1}–
                  {Math.min(count, (page + 1) * PAGE_SIZE)}
                </b>{" "}
                of <b className="text-ink num">{count}</b> leads
              </span>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-lg p-1.5 hover:bg-white disabled:opacity-40"
                    disabled={page === 0}
                    onClick={() => setP("page", String(page - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pages }, (_, i) => i)
                    .filter(
                      (i) =>
                        i === 0 || i === pages - 1 || Math.abs(i - page) <= 1,
                    )
                    .map((i, idx, arr) => (
                      <span key={i} className="flex items-center gap-1">
                        {idx > 0 && i - arr[idx - 1] > 1 && (
                          <span className="px-1">…</span>
                        )}
                        <button
                          onClick={() => setP("page", i ? String(i) : "")}
                          className={clsx(
                            "h-7 min-w-7 rounded-lg px-2 text-[12.5px] font-bold num",
                            i === page
                              ? "bg-teal-600 text-white"
                              : "hover:bg-white",
                          )}
                        >
                          {i + 1}
                        </button>
                      </span>
                    ))}
                  <button
                    className="rounded-lg p-1.5 hover:bg-white disabled:opacity-40"
                    disabled={page + 1 >= pages}
                    onClick={() => setP("page", String(page + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "new" ? "New lead" : "Edit lead"}
        wide
      >
        {modal && (
          <LeadForm
            lead={modal === "new" ? undefined : modal}
            onDone={(saved) => {
              setModal(null);
              qc.invalidateQueries({ queryKey: ["dashboard"] });
              if (modal === "new") navigate(`/leads/${saved.id}`);
            }}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete lead"
        message={`Delete "${del?.name}" and all its follow-ups, documents and history? This cannot be undone.`}
        onConfirm={() => del && remove.mutate(del.id)}
        busy={remove.isPending}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} profiles={profiles.data ?? []} />
    </div>
  );
}

function ImportModal({ open, onClose, profiles = [] }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const cleanHeader = (value) => String(value ?? "").replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const pickCell = (row, names) => {
    for (const name of names) if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== "") return String(row[name]).trim();
    return "";
  };
  const normaliseRows = (sourceRows) => {
    const staffIndex = new Map();
    profiles.filter((p) => p.is_active !== false).forEach((p) => {
      const key = String(p.full_name || "").trim().toLocaleLowerCase();
      if (key && p.id) staffIndex.set(key, p.id);
    });
    return sourceRows.map((raw) => {
      const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [cleanHeader(k), v]));
      const name = pickCell(r, ["name", "full_name", "owner_name", "contact_name", "lead_name"]);
      const phone = pickCell(r, ["phone", "mobile", "mobile_number", "phone_number", "contact_number"]);
      const staff = pickCell(r, ["staff", "staff_name", "assigned_to", "owner", "agent", "sales_person", "salesperson"]);
      const addressParts = [pickCell(r, ["address", "location"]), pickCell(r, ["building", "building_name"]), pickCell(r, ["unit", "unit_no", "unit_number"]), pickCell(r, ["country"])].filter(Boolean);
      const staffId = staff ? staffIndex.get(staff.toLocaleLowerCase()) : undefined;
      const notes = [pickCell(r, ["notes", "remarks", "comments"]), pickCell(r, ["status", "lead_status", "excel_status"]) ? `Excel Status: ${pickCell(r, ["status", "lead_status", "excel_status"])}` : "", staff ? `Excel Staff: ${staff}${staffId ? "" : " (not matched to a CRM employee; left unassigned)"}` : ""].filter(Boolean).join(" | ");
      return {
        name, phone, email: pickCell(r, ["email", "email_address"]),
        company: pickCell(r, ["company", "organisation", "organization", "developer"]),
        address: addressParts.join(", "),
        source: pickCell(r, ["source", "lead_source"]).toLowerCase().replace(/\s+/g, "_"),
        status: normalizeLeadStatus(pickCell(r, ["crm_status", "lead_stage", "stage"])),
        estimated_value: pickCell(r, ["estimated_value", "value", "amount"]), notes,
        ...(staffId ? { assigned_to: staffId } : {}),
      };
    }).filter((r) => r.name);
  };

  async function unzipXlsx(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const decoder = new TextDecoder();
    const entries = new Map();
    let offset = 0;
    while (offset + 30 < bytes.length && view.getUint32(offset, true) === 0x04034b50) {
      const method = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const nameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);
      const name = decoder.decode(bytes.slice(offset + 30, offset + 30 + nameLength));
      const dataStart = offset + 30 + nameLength + extraLength;
      const compressed = bytes.slice(dataStart, dataStart + compressedSize);
      let content;
      if (method === 0) content = compressed;
      else if (method === 8 && typeof DecompressionStream !== "undefined") {
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        content = new Uint8Array(await new Response(stream).arrayBuffer());
      } else throw new Error("This Excel file uses unsupported compression. Save it as .xlsx or CSV and try again.");
      entries.set(name, decoder.decode(content));
      offset = dataStart + compressedSize;
    }
    const xml = (path) => {
      const value = entries.get(path);
      if (!value) throw new Error(`Excel workbook is missing ${path}`);
      return new DOMParser().parseFromString(value, "application/xml");
    };
    const sharedDoc = entries.has("xl/sharedStrings.xml") ? xml("xl/sharedStrings.xml") : null;
    const shared = sharedDoc ? [...sharedDoc.getElementsByTagName("si")].map((si) => [...si.getElementsByTagName("t")].map((t) => t.textContent).join("")) : [];
    const workbook = xml("xl/workbook.xml");
    const firstSheet = workbook.getElementsByTagName("sheet")[0];
    if (!firstSheet) throw new Error("No worksheet found in this Excel file.");
    const relId = firstSheet.getAttribute("r:id");
    const rels = xml("xl/_rels/workbook.xml.rels");
    const relation = [...rels.getElementsByTagName("Relationship")].find((r) => r.getAttribute("Id") === relId);
    if (!relation) throw new Error("Could not locate the first worksheet in this Excel file.");
    const target = relation.getAttribute("Target").replace(/^\//, "");
    const sheetPath = target.startsWith("xl/") ? target : `xl/${target.replace(/^\.\//, "")}`;
    const sheet = xml(sheetPath);
    const rows = [...sheet.getElementsByTagName("row")];
    if (!rows.length) return [];
    const matrix = rows.map((row) => {
      const values = [];
      [...row.getElementsByTagName("c")].forEach((cell) => {
        const letters = (cell.getAttribute("r") || "A1").match(/[A-Z]+/i)?.[0] || "A";
        let col = 0;
        for (const ch of letters.toUpperCase()) col = col * 26 + ch.charCodeAt(0) - 64;
        const type = cell.getAttribute("t");
        const value = type === "inlineStr" ? [...cell.getElementsByTagName("t")].map((t) => t.textContent).join("") : (cell.getElementsByTagName("v")[0]?.textContent ?? "");
        values[col - 1] = type === "s" ? (shared[Number(value)] ?? "") : value;
      });
      return values;
    });
    const headers = (matrix.shift() || []).map(cleanHeader);
    return matrix.map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])));
  }

  async function parse(file) {
    try {
      const extension = file.name.split(".").pop().toLowerCase();
      let sourceRows;
      if (["xlsx", "xlsm"].includes(extension)) sourceRows = await unzipXlsx(file);
      else if (extension === "csv") {
        const result = await new Promise((resolve, reject) => Papa.parse(file, { header: true, skipEmptyLines: true, complete: resolve, error: reject }));
        sourceRows = result.data;
      } else throw new Error("Please upload an .xlsx or .csv file. Legacy .xls files are not supported; save them as .xlsx first.");
      const normalised = normaliseRows(sourceRows);
      setRows(normalised);
      if (!normalised.length) toast.error("No valid lead rows found. Check for an Owner Name or Name column.");
      else toast.success(`Read ${normalised.length} lead rows`);
    } catch (e) { toast.error(e.message || "Could not read this file"); }
  }
  async function submit() {
    setBusy(true);
    try {
      const n = await importLeads(rows);
      toast.success(`Imported ${n} lead${n === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setRows([]);
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal open={open} onClose={onClose} title="Import leads from Excel or CSV" wide>
      <p className="mb-3 text-sm text-slate-600">
        Upload an Excel (.xlsx) or CSV file with a header row. Recognised columns:{" "}
        <code className="rounded bg-mist px-1">
          Owner Name / name, Mobile / phone, Email, Building, Unit, Country, Staff,
          company, address, source, status, estimated_value, notes
        </code>
        . Staff names are matched to active CRM employees; unmatched staff remain unassigned. Excel status values are preserved in notes.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xlsm,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="input"
        onChange={(e) => e.target.files?.[0] && parse(e.target.files[0])}
      />
      {rows.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">
            {rows.length} rows parsed · preview of first {preview.length}
          </p>
          <div className="overflow-x-auto rounded-lg border border-mist-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Assigned staff</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.phone}</td>
                    <td>{r.email}</td>
                    <td>{r.company}</td>
                    <td>{profiles.find((p) => p.id === r.assigned_to)?.full_name || "Unassigned"}</td>
                    <td>{r.source}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                setRows([]);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear
            </button>
            <button className="btn-primary" onClick={submit} disabled={busy}>
              Import {rows.length} leads
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
