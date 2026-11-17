import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  Facebook,
  Globe,
  Copy,
  RefreshCw,
  Trash2,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  createIntegration,
  deleteIntegration,
  getDepartments,
  getIntegrationEvents,
  getIntegrations,
  getProfiles,
  randomKey,
  updateIntegration,
} from "@/lib/api";
import { API_URL, errMsg } from "@/lib/http";
import {
  Badge,
  Field,
  Input,
  Select,
  Spinner,
  fmtDateTime,
  fmtRelative,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { MODULES } from "@/lib/modules";

export default function IntegrationsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "facebook";
  const q = useQuery({ queryKey: ["integrations"], queryFn: getIntegrations });
  const mod = MODULES.find((m) => m.key === tab);
  return (
    <div>
      <ModuleHeader
        moduleKey={tab}
        subtitle={
          tab === "facebook"
            ? "Leads from Facebook & Instagram Lead Ads land in the CRM within seconds."
            : "Put an enquiry form on your website; every submission becomes a lead."
        }
      />
      <div className="mb-6 flex gap-1 rounded-xl bg-mist-2 p-1 sm:w-fit">
        {["facebook", "website"].map((t) => {
          const m = MODULES.find((x) => x.key === t);
          return (
            <button
              key={t}
              onClick={() => setParams({ tab: t })}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition",
                tab === t ? "bg-white text-ink shadow-ring" : "text-slate-600",
              )}
            >
              <m.icon size={15} style={{ color: m.color }} />{" "}
              {t === "facebook" ? "Facebook / Instagram" : "Website form"}
            </button>
          );
        })}
      </div>
      {q.isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {(q.data ?? [])
              .filter((i) => i.kind === tab)
              .map((i) => (
                <IntegrationCard key={i.id} integ={i} />
              ))}
            <NewIntegration kind={tab} color={mod.color} />
          </div>
          <aside className="card h-fit p-5 text-sm leading-relaxed text-slate-600">
            {tab === "facebook" ? <FacebookGuide /> : <WebsiteGuide />}
          </aside>
        </div>
      )}
    </div>
  );
}

function IntegrationCard({ integ }) {
  const qc = useQueryClient();
  const [showEvents, setShowEvents] = useState(false);
  const events = useQuery({
    queryKey: ["integration_events", integ.id],
    queryFn: () => getIntegrationEvents(integ.id),
    enabled: showEvents,
  });
  const inval = () => qc.invalidateQueries({ queryKey: ["integrations"] });
  const toggle = useMutation({
    mutationFn: () => updateIntegration(integ.id, { enabled: !integ.enabled }),
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const rotate = useMutation({
    mutationFn: () =>
      updateIntegration(integ.id, {
        config: { ...integ.config, api_key: randomKey("wk_live_") },
      }),
    onSuccess: () => {
      inval();
      toast.success("New key generated — update your website snippet");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: () => deleteIntegration(integ.id),
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const Icon = integ.kind === "facebook" ? Facebook : Globe;
  const color = integ.kind === "facebook" ? "#1877F2" : "#0D9488";
  const webhookUrl = `${API_URL}/api/webhooks/meta`;
  const endpoint = `${API_URL}/api/webhooks/website-lead`;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: color + "22", color }}
          >
            <Icon size={20} />
          </span>
          <div>
            <div className="text-[15px] font-bold text-ink">{integ.name}</div>
            <div className="text-[12.5px] text-slate-500">
              {integ.leads_received} lead{integ.leads_received === 1 ? "" : "s"}{" "}
              received
              {integ.last_lead_at
                ? ` · last ${fmtRelative(integ.last_lead_at)}`
                : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={integ.enabled ? "done" : "cancelled"} />
          <button
            className="btn-secondary py-1.5"
            onClick={() => toggle.mutate()}
          >
            {integ.enabled ? "Pause" : "Enable"}
          </button>
          <button
            className="btn-ghost text-amber-600"
            onClick={() => {
              if (confirm("Remove this integration?")) del.mutate();
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {integ.kind === "facebook" ? (
          <>
            <CopyRow
              label="Callback URL (paste in Meta Webhooks)"
              value={webhookUrl}
            />
            <CopyRow
              label="Verify token"
              value={integ.config.verify_token ?? ""}
            />
            <div>
              <dt className="label">Page ID</dt>
              <dd className="num">{integ.config.page_id}</dd>
            </div>
            <div>
              <dt className="label">Page access token</dt>
              <dd className="truncate text-slate-500">
                ••••••••{(integ.config.page_access_token ?? "").slice(-6)}
              </dd>
            </div>
          </>
        ) : (
          <>
            <CopyRow label="Endpoint" value={endpoint} />
            <div>
              <dt className="label">API key</dt>
              <dd className="flex items-center gap-2">
                <code className="truncate rounded bg-mist px-2 py-1 text-[12px]">
                  {integ.config.api_key}
                </code>
                <CopyBtn value={integ.config.api_key} />
                <button
                  className="btn-ghost p-1.5"
                  title="Generate a new key"
                  onClick={() => rotate.mutate()}
                >
                  <RefreshCw size={14} />
                </button>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="label">
                Allowed origins (comma-separated, or * for any)
              </dt>
              <dd>
                <OriginsEditor integ={integ} />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="label">Embed snippet — paste into your website</dt>
              <dd>
                <Snippet endpoint={endpoint} apiKey={integ.config.api_key} />
              </dd>
            </div>
          </>
        )}
      </dl>
      <button
        className="mt-4 text-sm font-semibold text-slate-500 hover:text-ink"
        onClick={() => setShowEvents(!showEvents)}
      >
        {showEvents ? "Hide" : "Show"} recent activity
      </button>
      {showEvents &&
        (events.isLoading ? (
          <Spinner />
        ) : !events.data?.length ? (
          <p className="mt-2 text-sm text-slate-400">No submissions yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-mist rounded-xl border border-mist-2 text-sm">
            {events.data.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-2">
                <Badge
                  value={
                    e.status === "created"
                      ? "done"
                      : e.status === "error"
                        ? "overdue"
                        : "pending"
                  }
                />
                <span className="flex-1 truncate text-slate-600">
                  {e.detail ??
                    (e.status === "created" ? "Lead created" : e.status)}
                </span>
                {e.lead_id && (
                  <Link
                    to={`/leads/${e.lead_id}`}
                    className="text-[12px] font-semibold text-pink-600 hover:underline"
                  >
                    Open lead
                  </Link>
                )}
                <span className="text-[12px] text-slate-400">
                  {fmtDateTime(e.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

function OriginsEditor({ integ }) {
  const qc = useQueryClient();
  const [v, setV] = useState(integ.config.allowed_origins ?? "*");
  const save = useMutation({
    mutationFn: () =>
      updateIntegration(integ.id, {
        config: { ...integ.config, allowed_origins: v.trim() || "*" },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Saved");
    },
  });
  return (
    <div className="flex gap-2">
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="https://www.yoursite.com"
      />
      <button
        className="btn-secondary"
        onClick={() => save.mutate()}
        disabled={v === (integ.config.allowed_origins ?? "*")}
      >
        Save
      </button>
    </div>
  );
}

function NewIntegration({ kind, color }) {
  const qc = useQueryClient();
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: getProfiles });
  const depts = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: kind === "facebook" ? "Facebook page" : "Website contact form",
    page_id: "",
    page_access_token: "",
    assign_to: "",
    department_id: "",
    allowed_origins: "*",
  });
  const m = useMutation({
    mutationFn: () =>
      createIntegration({
        kind,
        name: f.name,
        assign_to: f.assign_to || null,
        department_id: f.department_id || null,
        config:
          kind === "facebook"
            ? {
                page_id: f.page_id.trim(),
                page_access_token: f.page_access_token.trim(),
                verify_token: randomKey("vt_"),
              }
            : {
                api_key: randomKey("wk_live_"),
                allowed_origins: f.allowed_origins.trim() || "*",
              },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      setOpen(false);
      toast.success("Integration added");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  if (!open)
    return (
      <button
        className="btn-primary"
        style={{ background: color }}
        onClick={() => setOpen(true)}
      >
        {kind === "facebook" ? "Connect a Facebook page" : "Add a website form"}
      </button>
    );
  return (
    <form
      className="card grid gap-4 p-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <Field label="Name" className="sm:col-span-2">
        <Input
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          required
        />
      </Field>
      {kind === "facebook" && (
        <>
          <Field label="Facebook Page ID">
            <Input
              value={f.page_id}
              onChange={(e) => setF({ ...f, page_id: e.target.value })}
              required
              placeholder="1234567890"
            />
          </Field>
          <Field
            label="Page access token"
            hint="Long-lived token with leads_retrieval and pages_manage_ads permissions"
          >
            <Input
              value={f.page_access_token}
              onChange={(e) =>
                setF({ ...f, page_access_token: e.target.value })
              }
              required
            />
          </Field>
        </>
      )}
      {kind === "website" && (
        <Field
          label="Allowed website origins"
          className="sm:col-span-2"
          hint="Comma-separated. Use * while testing."
        >
          <Input
            value={f.allowed_origins}
            onChange={(e) => setF({ ...f, allowed_origins: e.target.value })}
          />
        </Field>
      )}
      <Field label="Assign new leads to">
        <Select
          value={f.assign_to}
          onChange={(e) => setF({ ...f, assign_to: e.target.value })}
          options={(profiles.data ?? []).map((p) => ({
            value: p.id,
            label: p.full_name,
          }))}
          placeholder="Unassigned"
        />
      </Field>
      <Field label="Department">
        <Select
          value={f.department_id}
          onChange={(e) => setF({ ...f, department_id: e.target.value })}
          options={(depts.data ?? []).map((d) => ({
            value: d.id,
            label: d.name,
          }))}
          placeholder="None"
        />
      </Field>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          style={{ background: color }}
          disabled={m.isPending}
        >
          Save
        </button>
      </div>
    </form>
  );
}

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost p-1.5"
      title="Copy"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
    >
      {ok ? <Check size={14} className="text-moss-600" /> : <Copy size={14} />}
    </button>
  );
}
function CopyRow({ label, value }) {
  return (
    <div className="sm:col-span-2">
      <dt className="label">{label}</dt>
      <dd className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-mist px-2 py-1 text-[12px]">
          {value}
        </code>
        <CopyBtn value={value} />
      </dd>
    </div>
  );
}
function Snippet({ endpoint, apiKey }) {
  const code = `<form id="crm-form">
  <input name="name" placeholder="Your name" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="phone" placeholder="Phone">
  <textarea name="message" placeholder="How can we help?"></textarea>
  <input name="website_url" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>
<script>
document.getElementById("crm-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.page = location.href;
  const r = await fetch("${endpoint}", { method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": "${apiKey}" },
    body: JSON.stringify(data) });
  const j = await r.json();
  alert(r.ok ? "Thanks! We'll be in touch shortly." : (j.error || "Something went wrong"));
  if (r.ok) e.target.reset();
});
</script>`;
  return (
    <div className="relative">
      <pre className="max-h-64 overflow-auto rounded-xl bg-ink p-3 text-[11.5px] leading-relaxed text-slate-100">
        {code}
      </pre>
      <div className="absolute right-2 top-2 rounded-md bg-white/10 text-white">
        <CopyBtn value={code} />
      </div>
    </div>
  );
}

function FacebookGuide() {
  return (
    <>
      <h3 className="mb-2 text-[15px] font-bold text-ink">
        How to connect Lead Ads
      </h3>
      <ol className="list-decimal space-y-2 pl-4">
        <li>
          Create an app at{" "}
          <a
            className="font-semibold text-sky-600 hover:underline"
            href="https://developers.facebook.com/"
            target="_blank"
            rel="noreferrer"
          >
            developers.facebook.com{" "}
            <ExternalLink size={11} className="inline" />
          </a>{" "}
          and add the <b>Webhooks</b> product.
        </li>
        <li>
          Generate a long-lived <b>Page access token</b> with{" "}
          <code>leads_retrieval</code>, <code>pages_manage_ads</code>,{" "}
          <code>pages_show_list</code> (Graph API Explorer → your page).
        </li>
        <li>
          Click <b>Connect a Facebook page</b> here, enter the Page ID and
          token. A verify token is generated for you.
        </li>
        <li>
          In Meta: Webhooks → Page → <b>Edit subscription</b>: paste the
          Callback URL and Verify token shown above, subscribe to the{" "}
          <code>leadgen</code> field.
        </li>
        <li>
          Subscribe the page to your app: in Graph API Explorer run{" "}
          <code>
            POST /&#123;page-id&#125;/subscribed_apps?subscribed_fields=leadgen
          </code>
          .
        </li>
        <li>
          Test with the{" "}
          <a
            className="font-semibold text-sky-600 hover:underline"
            href="https://developers.facebook.com/tools/lead-ads-testing"
            target="_blank"
            rel="noreferrer"
          >
            Lead Ads Testing Tool
          </a>
          . The lead appears in Leads with source <b>Facebook</b>.
        </li>
      </ol>
      <p className="mt-3 text-[12.5px] text-slate-500">
        Optional: set <code>META_APP_SECRET</code> in the backend <code>.env</code> file to
        verify webhook signatures.
      </p>
    </>
  );
}
function WebsiteGuide() {
  return (
    <>
      <h3 className="mb-2 text-[15px] font-bold text-ink">
        How the website form works
      </h3>
      <ol className="list-decimal space-y-2 pl-4">
        <li>
          Click <b>Add a website form</b>. An API key is created.
        </li>
        <li>
          Copy the embed snippet into any page of your site (WordPress, Wix
          custom code, Webflow, plain HTML).
        </li>
        <li>
          Style the fields to match your site — only the <code>name</code>{" "}
          attributes matter.
        </li>
        <li>
          Every submission creates a lead with source <b>Website</b>, assigned
          to the person you choose. Duplicate emails within 30 days are merged
          into the existing lead as a new enquiry.
        </li>
        <li>
          Restrict <b>Allowed origins</b> to your domain once it's live.
        </li>
      </ol>
      <p className="mt-3 text-[12.5px] text-slate-500">
        Also works from any backend: POST JSON to the endpoint with the{" "}
        <code>X-Api-Key</code> header.
      </p>
    </>
  );
}
