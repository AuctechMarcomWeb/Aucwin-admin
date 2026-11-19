import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  Copy,
  Ban,
  CheckCircle2,
  Loader2,
  Building2,
} from "lucide-react";
import { listCompanies, createCompany, updateCompany } from "@/lib/api";
import { errMsg } from "@/lib/http";
import {
  Modal,
  Field,
  Input,
  PasswordInput,
  PasswordStrength,
  Spinner,
  Empty,
  Badge,
  passwordScore,
  fmtDate,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";

const randomPassword = () => {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 12; i++) p += s[Math.floor(Math.random() * s.length)];
  return p + "@9";
};

export default function Companies() {
  const qc = useQueryClient();
  const companies = useQuery({
    queryKey: ["companies"],
    queryFn: listCompanies,
  });
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState(null); // { name, admin_email, password } to show after creating

  const empty = { company_name: "", full_name: "", email: "", password: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = useMutation({
    mutationFn: () =>
      createCompany({
        company_name: form.company_name.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      }),
    onSuccess: (res) => {
      setCreated({
        name: res.name,
        admin_email: res.admin_email,
        password: form.password,
      });
      setForm(empty);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }) => updateCompany(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
    onError: (e) => toast.error(errMsg(e)),
  });

  function submit(e) {
    e.preventDefault();
    if (!form.company_name.trim()) return toast.error("Enter a company name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return toast.error("Enter a valid admin email.");
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters.");
    create.mutate();
  }

  const copy = (text, what) => {
    navigator.clipboard?.writeText(text).then(
      () => toast.success(`${what} copied`),
      () => toast.error("Could not copy"),
    );
  };

  const rows = companies.data ?? [];

  return (
    <div>
      <ModuleHeader
        moduleKey="companies"
        title="Companies"
        subtitle="Each company is fully separate — its team only ever sees its own data."
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setForm({ ...empty, password: randomPassword() });
              setCreated(null);
              setOpen(true);
            }}
          >
            <Plus size={16} /> New company
          </button>
        }
      />

      {/* credentials shown once, right after creating a company */}
      {created && (
        <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-teal-700" size={22} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">
                Company “{created.name}” is ready
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Share these sign-in details with the company’s admin. Save them
                now — the password is not shown again.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <CredBox
                  label="Admin email"
                  value={created.admin_email}
                  onCopy={copy}
                />
                <CredBox
                  label="Password"
                  value={created.password}
                  onCopy={copy}
                />
              </div>
            </div>
            <button
              className="text-sm font-semibold text-slate-500 hover:text-ink"
              onClick={() => setCreated(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {companies.isLoading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Empty
          title="No companies yet"
          hint="Create your first company and its super admin."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-mist-2 bg-white">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Admin</th>
                <th>Team</th>
                <th>Leads</th>
                <th>Customers</th>
                <th>Created</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <Building2 size={16} className="text-slate-400" />
                      {w.name}
                      {w.is_mine && (
                        <span className="rounded bg-mist px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                          Yours
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-slate-600">
                    {w.super_admins[0]?.email || "—"}
                    {w.super_admins.length > 1 && (
                      <span className="text-slate-400">
                        {" "}
                        +{w.super_admins.length - 1}
                      </span>
                    )}
                  </td>
                  <td>{w.users}</td>
                  <td>{w.leads}</td>
                  <td>{w.clients}</td>
                  <td className="whitespace-nowrap text-slate-500">
                    {fmtDate(w.created_at)}
                  </td>
                  <td>
                    <Badge
                      value={w.is_active ? "Active" : "Suspended"}
                      solid={!w.is_active}
                    />
                  </td>
                  <td className="text-right">
                    {!w.is_mine &&
                      (w.is_active ? (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                          onClick={() =>
                            toggle.mutate({ id: w.id, is_active: false })
                          }
                          disabled={toggle.isPending}
                        >
                          <Ban size={15} /> Suspend
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                          onClick={() =>
                            toggle.mutate({ id: w.id, is_active: true })
                          }
                          disabled={toggle.isPending}
                        >
                          <CheckCircle2 size={15} /> Enable
                        </button>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => !create.isPending && setOpen(false)}
        title="Create a new company"
      >
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Company name">
            <Input
              value={form.company_name}
              onChange={set("company_name")}
              placeholder="e.g. Alpha Realty"
              autoFocus
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Admin name">
              <Input
                value={form.full_name}
                onChange={set("full_name")}
                placeholder="Full name"
              />
            </Field>
            <Field label="Admin email">
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="admin@company.com"
              />
            </Field>
          </div>
          <Field
            label="Password"
            hint="The admin can change this later from their Settings."
          >
            <PasswordInput value={form.password} onChange={set("password")} />
            <PasswordStrength value={passwordScore(form.password)} />
          </Field>
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={create.isPending}
            >
              {create.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Create company
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CredBox({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-mist-2 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </div>
        <div className="truncate font-mono text-sm text-ink">{value}</div>
      </div>
      <button
        className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-mist hover:text-ink"
        onClick={() => onCopy(value, label)}
        title={`Copy ${label}`}
      >
        <Copy size={15} />
      </button>
    </div>
  );
}
