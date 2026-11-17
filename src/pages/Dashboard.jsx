// import { useQuery } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
// import {
//   ArrowRight,
//   CheckCircle2,
//   Inbox,
//   UserPlus,
//   Users,
//   Wallet,
//   AlertCircle,
// } from "lucide-react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import {
//   getDashboardStats,
//   getEmployeePerformance,
//   getFollowUps,
// } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import {
//   Spinner,
//   money,
//   fmtDateTime,
//   Avatar,
//   Empty,
//   toneOf,
//   isOverdue,
// } from "@/components/ui";
// import { label, LEAD_STATUSES, ACTIVE_LEAD_STATUSES } from "@/lib/types";
// import { ModuleHeader } from "@/components/Layout";

// /** Lead stages in everyday words, so owners and clients understand them at a glance. */
// const STAGES = [
//   { key: "new", name: "Just came in", hint: "New enquiries, nobody has called yet" },
//   { key: "contacted", name: "We contacted them", hint: "First call or message done" },
//   { key: "qualified", name: "Interested", hint: "They want to know more" },
//   { key: "proposal", name: "Quote sent", hint: "Waiting for their decision" },
//   { key: "won", name: "Became customers", hint: "Deal closed" },
//   { key: "lost", name: "Not interested", hint: "Did not go ahead" },
// ];

// const FOLLOWUP_WORD = { call: "Call", meeting: "Meeting", reminder: "Reminder", email: "Email", whatsapp: "WhatsApp" };

// /** A big, friendly number card with an icon and one line explaining it. */
// function BigNumber({ icon: Icon, color, bg, title, value, explain, to }) {
//   const body = (
//     <div className="flex h-full items-start gap-4 p-5">
//       <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: bg, color }}>
//         <Icon size={22} strokeWidth={2.2} />
//       </span>
//       <div className="min-w-0">
//         <p className="text-sm font-medium text-slate-600">{title}</p>
//         <p className="mt-1 text-[30px] font-bold leading-none tracking-tight text-ink num">{value}</p>
//         <p className="mt-2 text-[13px] leading-snug text-slate-500">{explain}</p>
//       </div>
//     </div>
//   );
//   return to ? (
//     <Link to={to} className="card block transition-colors hover:border-teal-200">{body}</Link>
//   ) : (
//     <div className="card">{body}</div>
//   );
// }

// export default function Dashboard() {
//   const { isAdmin, profile } = useAuth();
//   const stats = useQuery({ queryKey: ["dashboard", 30], queryFn: () => getDashboardStats(30) });
//   const perf = useQuery({ queryKey: ["employee_performance"], queryFn: getEmployeePerformance, enabled: isAdmin });
//   const today = useQuery({ queryKey: ["follow_ups", "today-dash"], queryFn: () => getFollowUps({ scope: "today" }) });
//   const overdue = useQuery({ queryKey: ["follow_ups", "overdue-dash"], queryFn: () => getFollowUps({ scope: "overdue" }) });

//   if (stats.isLoading) return <Spinner />;
//   if (stats.error) return <p className="text-amber-700">Couldn't load the overview: {stats.error.message}</p>;

//   const s = stats.data;
//   const by = s.leads_by_status || {};
//   const inProgress = ACTIVE_LEAD_STATUSES.reduce((n, key) => n + (by[key] || 0), 0);
//   const totalLeads = Object.values(by).reduce((a, b) => a + b, 0);
//   const stageMax = Math.max(1, ...STAGES.map((st) => by[st.key] || 0));
//   const revenue = s.revenue_per_month.map((m) => ({
//     month: new Date(m.month + "-01T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
//     amount: Number(m.amount),
//   }));
//   const sources = Object.entries(s.leads_by_source).sort((a, b) => b[1] - a[1]).slice(0, 5);
//   // late first, then the rest of today (an item from earlier today is in both lists, so de-duplicate)
//   const seen = new Set();
//   const todo = [...(overdue.data ?? []), ...(today.data ?? [])]
//     .filter((f) => (seen.has(f.id) ? false : seen.add(f.id)))
//     .slice(0, 6);
//   const lateCount = s.followups_overdue;

//   return (
//     <div className="space-y-6">
//       <ModuleHeader
//         moduleKey="overview"
//         title="Overview"
//         subtitle={`Hello ${profile?.full_name?.split(" ")[0] ?? ""} — here is how things are going.`}
//         actions={<Link to="/leads" className="btn-secondary">See all enquiries <ArrowRight size={15} /></Link>}
//       />

//       {/* ---- 4 numbers that matter ---- */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <BigNumber icon={Inbox} color="#DB2777" bg="#FCE7F3" title="Enquiries in progress" value={inProgress}
//           explain="People who are interested but haven't bought yet" to="/leads" />
//         <BigNumber icon={UserPlus} color="#2563EB" bg="#DBEAFE" title="New enquiries (last 30 days)" value={s.new_leads}
//           explain="Fresh leads that came in this month" to="/leads" />
//         <BigNumber icon={Users} color="#16A34A" bg="#DCFCE7" title="Became customers" value={s.converted_leads}
//           explain={totalLeads ? `${s.conversion_rate}% of all enquiries turned into customers` : "No enquiries yet"} to="/clients" />
//         <BigNumber icon={Wallet} color="#0E7C86" bg="#E6F4F5" title="Money received" value={money(s.revenue_paid)}
//           explain={s.revenue_pending > 0 ? `${money(s.revenue_pending)} still to be collected` : "Nothing pending to collect"} />
//       </div>

//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
//         {/* ---- What needs attention ---- */}
//         <section className="card xl:col-span-3">
//           <div className="flex items-center justify-between px-5 pt-5">
//             <div>
//               <h2 className="text-[16px] font-bold text-ink">Needs attention today</h2>
//               <p className="text-[13px] text-slate-500">
//                 {lateCount > 0 ? `${lateCount} late · ` : ""}{s.followups_today} due today
//               </p>
//             </div>
//             <Link to="/follow-ups" className="text-sm font-semibold text-teal-700 hover:underline">See all</Link>
//           </div>
//           {today.isLoading || overdue.isLoading ? <Spinner /> : todo.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <CheckCircle2 size={34} className="text-moss-600" />
//               <p className="mt-3 text-[15px] font-semibold text-ink">All caught up</p>
//               <p className="mt-1 text-[13px] text-slate-500">No calls or meetings due today.</p>
//             </div>
//           ) : (
//             <ul className="mt-3 divide-y divide-mist">
//               {todo.map((f) => {
//                 const late = isOverdue(f.due_at);
//                 const to = f.lead_id ? `/leads/${f.lead_id}` : f.client_id ? `/clients/${f.client_id}` : f.type === "meeting" ? "/meetings" : "/reminders";
//                 return (
//                   <li key={f.id}>
//                     <Link to={to} className="flex items-center gap-4 px-5 py-3 hover:bg-mist/60">
//                       {late
//                         ? <AlertCircle size={18} className="shrink-0 text-amber-600" />
//                         : <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600 mx-[4px]" />}
//                       <div className="min-w-0 flex-1">
//                         <p className="truncate text-sm font-semibold text-ink">
//                           {FOLLOWUP_WORD[f.type] ?? "Task"}: {f.lead?.name ?? f.client?.name ?? f.title}
//                         </p>
//                         <p className="truncate text-[13px] text-slate-500">
//                           {f.title}{f.assignee ? ` · ${f.assignee.full_name}` : ""}
//                         </p>
//                       </div>
//                       <span className={`shrink-0 text-[13px] num ${late ? "font-semibold text-amber-600" : "text-slate-500"}`}>
//                         {late ? "Late" : fmtDateTime(f.due_at).split("· ")[1]}
//                       </span>
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </section>

//         {/* ---- Where everyone is ---- */}
//         <section className="card p-5 xl:col-span-2">
//           <h2 className="text-[16px] font-bold text-ink">Where your enquiries are</h2>
//           <p className="text-[13px] text-slate-500">{totalLeads} enquiries in total</p>
//           <ul className="mt-4 space-y-3.5">
//             {STAGES.map((st) => {
//               const n = by[st.key] || 0;
//               return (
//                 <li key={st.key}>
//                   <Link to={`/leads?status=${st.key}`} className="group block">
//                     <div className="flex items-baseline justify-between gap-3">
//                       <span className="text-sm font-semibold text-slate-700 group-hover:text-ink">{st.name}</span>
//                       <span className="text-sm font-bold text-ink num">{n}</span>
//                     </div>
//                     <div className="mt-1 h-2 rounded-full bg-mist">
//                       <div className="h-full rounded-full" style={{ width: `${(n / stageMax) * 100}%`, background: toneOf(st.key), minWidth: n ? 8 : 0 }} />
//                     </div>
//                     <p className="mt-0.5 text-[12px] text-slate-400">{st.hint}</p>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </section>
//       </div>

//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
//         {/* ---- Money by month ---- */}
//         <section className="card p-5 xl:col-span-3">
//           <h2 className="text-[16px] font-bold text-ink">Money received each month</h2>
//           <p className="text-[13px] text-slate-500">Payments marked as paid</p>
//           <div className="mt-4 h-56">
//             {revenue.length === 0 ? <Empty title="No payments received yet" /> : (
//               <ResponsiveContainer>
//                 <BarChart data={revenue} margin={{ left: 0, right: 4, top: 4 }}>
//                   <CartesianGrid vertical={false} stroke="#EEF2F6" />
//                   <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => money(v)} />
//                   <Tooltip formatter={(v) => [money(Number(v)), "Received"]} contentStyle={{ borderRadius: 12, border: "1px solid #E3E9F0", fontSize: 13 }} />
//                   <Bar dataKey="amount" fill="#0E7C86" radius={[6, 6, 0, 0]} maxBarSize={40} />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </section>

//         {/* ---- Where enquiries come from ---- */}
//         <section className="card p-5 xl:col-span-2">
//           <h2 className="text-[16px] font-bold text-ink">Where enquiries come from</h2>
//           <p className="text-[13px] text-slate-500">Top sources</p>
//           {sources.length === 0 ? <Empty title="No enquiries yet" /> : (
//             <ul className="mt-4 divide-y divide-mist">
//               {sources.map(([k, v]) => (
//                 <li key={k} className="flex items-center justify-between py-2.5">
//                   <span className="text-sm text-slate-700">{label(k)}</span>
//                   <span className="text-sm font-bold text-ink num">{v} <span className="font-normal text-slate-400">({totalLeads ? Math.round((v / totalLeads) * 100) : 0}%)</span></span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//       </div>

//       {/* ---- Team (admins only), simple ---- */}
//       {isAdmin && (
//         <section className="card overflow-hidden">
//           <div className="flex items-center justify-between px-5 py-4">
//             <div>
//               <h2 className="text-[16px] font-bold text-ink">How the team is doing</h2>
//               <p className="text-[13px] text-slate-500">Everyone's enquiries, customers and money collected</p>
//             </div>
//             <Link to="/employees" className="text-sm font-semibold text-teal-700 hover:underline">Manage team</Link>
//           </div>
//           <div className="overflow-x-auto">
//             {perf.isLoading ? <Spinner /> : (
//               <table className="table">
//                 <thead>
//                   <tr>
//                     <th>Person</th>
//                     <th className="text-right">Enquiries handling</th>
//                     <th className="text-right">Became customers</th>
//                     <th className="text-right">Money collected</th>
//                     <th className="text-right">Late follow-ups</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {perf.data?.map((p) => (
//                     <tr key={p.id}>
//                       <td>
//                         <div className="flex items-center gap-3">
//                           <Avatar name={p.full_name} size={30} />
//                           <div>
//                             <div className="font-semibold text-ink">{p.full_name}</div>
//                             <div className="text-[13px] text-slate-500">{p.department_name ?? label(p.role)}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="text-right num">{p.leads_assigned}</td>
//                       <td className="text-right font-semibold text-moss-700 num">{p.leads_won}</td>
//                       <td className="text-right num">{money(p.revenue_collected)}</td>
//                       <td className={`text-right num ${p.followups_overdue ? "font-semibold text-amber-600" : "text-slate-400"}`}>
//                         {p.followups_overdue || "None"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Target,
  Trophy,
  UserPlus,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getDashboardStats,
  getEmployeePerformance,
  getFollowUps,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Spinner,
  money,
  fmtDateTime,
  fmtRelative,
  Avatar,
  toneOf,
  isOverdue,
} from "@/components/ui";
import { label, LEAD_STATUSES, ACTIVE_LEAD_STATUSES } from "@/lib/types";
import { ModuleHeader } from "@/components/Layout";

/** Lead stages in everyday words, so owners and clients understand them at a glance. */
const STAGES = LEAD_STATUSES.map(key => ({ key, name: label(key), hint: "" }));
const FU = {
  call: { word: "Call", icon: Phone, c: "#DB2777", bg: "#FCE7F3" },
  meeting: { word: "Meeting", icon: Video, c: "#EA580C", bg: "#FFEDD5" },
  reminder: { word: "Reminder", icon: Bell, c: "#D97706", bg: "#FEF3C7" },
  email: { word: "Email", icon: Mail, c: "#2563EB", bg: "#DBEAFE" },
  whatsapp: {
    word: "WhatsApp",
    icon: MessageCircle,
    c: "#16A34A",
    bg: "#DCFCE7",
  },
};
const SOURCE_COLORS = [
  "#12ACA2",
  "#0F2F58",
  "#7C3AED",
  "#EA580C",
  "#DB2777",
  "#94A3B8",
];
const PERIODS = [7, 30, 90];

const tip = {
  borderRadius: 12,
  border: "1px solid #E4E9F0",
  fontSize: 13,
  boxShadow: "0 10px 30px -12px rgba(15,47,88,.25)",
};

function Card({ title, sub, action, children, className }) {
  return (
    <section
      className={clsx("card flex min-w-0 flex-col overflow-hidden", className)}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-[16px] font-bold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-[13px] text-slate-500">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
const SeeAll = ({ to, children = "See all" }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-50"
  >
    {children} <ChevronRight size={15} />
  </Link>
);

/** A big, friendly number card with an icon and one line explaining it. */
function StatCard({ icon: Icon, color, bg, title, value, explain, to, extra }) {
  const body = (
    <div className="relative flex h-full flex-col overflow-hidden p-5">
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40"
        style={{ background: bg }}
      />
      <div className="relative flex items-center justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: bg, color }}
        >
          <Icon size={21} strokeWidth={2.2} />
        </span>
        {to && (
          <ArrowRight
            size={17}
            className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600"
          />
        )}
      </div>
      <p className="relative mt-4 text-[13px] font-semibold text-slate-500">
        {title}
      </p>
      <p className="relative mt-1 text-[30px] font-extrabold leading-none tracking-tight text-ink num">
        {value}
      </p>
      <div className="relative mt-auto pt-3">
        {extra}
        <p className="mt-1.5 text-[12.5px] leading-snug text-slate-500">
          {explain}
        </p>
      </div>
    </div>
  );
  return to ? (
    <Link
      to={to}
      className="group card block transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      {body}
    </Link>
  ) : (
    <div className="card">{body}</div>
  );
}
const Meter = ({ pct, color }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-mist-2">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${Math.min(100, Math.max(pct, pct > 0 ? 3 : 0))}%`,
        background: color,
      }}
    />
  </div>
);

export default function Dashboard() {
  const { isAdmin, profile } = useAuth();
  const [days, setDays] = useState(30);
  const stats = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => getDashboardStats(days),
    placeholderData: (p) => p,
  });
  const perf = useQuery({
    queryKey: ["employee_performance"],
    queryFn: getEmployeePerformance,
    enabled: isAdmin,
  });
  const today = useQuery({
    queryKey: ["follow_ups", "today-dash"],
    queryFn: () => getFollowUps({ scope: "today" }),
  });
  const overdue = useQuery({
    queryKey: ["follow_ups", "overdue-dash"],
    queryFn: () => getFollowUps({ scope: "overdue" }),
  });

  const s = stats.data;
  const daily = useMemo(() => {
    if (!s) return [];
    const map = Object.fromEntries(
      (s.leads_per_day ?? []).map((d) => [d.day, d.count]),
    );
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({
        day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        count: map[k] ?? 0,
      });
    }
    return out;
  }, [s, days]);

  if (stats.isLoading) return <Spinner />;
  if (stats.error)
    return (
      <p className="text-amber-700">
        Couldn't load the overview: {stats.error.message}
      </p>
    );

  const by = s.leads_by_status || {};
  const inProgress = ACTIVE_LEAD_STATUSES.reduce((n, key) => n + (by[key] || 0), 0);
  const totalLeads = Object.values(by).reduce((a, b) => a + b, 0);
  const stageMax = Math.max(1, ...STAGES.map((st) => by[st.key] || 0));
  const revenue = s.revenue_per_month.map((m) => ({
    month: new Date(m.month + "-01T00:00:00").toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    }),
    amount: Number(m.amount),
  }));
  const srcAll = Object.entries(s.leads_by_source).sort((a, b) => b[1] - a[1]);
  const sources = srcAll.slice(0, 5);
  if (srcAll.length > 5)
    sources.push(["other", srcAll.slice(5).reduce((a, [, v]) => a + v, 0)]);
  const seen = new Set();
  const todo = [...(overdue.data ?? []), ...(today.data ?? [])]
    .filter((f) => (seen.has(f.id) ? false : seen.add(f.id)))
    .slice(0, 6);
  const lateCount = s.followups_overdue;
  const collected =
    s.revenue_paid + s.revenue_pending
      ? (s.revenue_paid / (s.revenue_paid + s.revenue_pending)) * 100
      : 0;
  const newInPeriod = daily.reduce((a, d) => a + d.count, 0);
  const hour = new Date().getHours();
  const hello =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const ranked = [...(perf.data ?? [])].sort(
    (a, b) =>
      b.revenue_collected - a.revenue_collected || b.leads_won - a.leads_won,
  );
  const topRevenue = Math.max(
    1,
    ...ranked.map((p) => p.revenue_collected || 0),
  );

  return (
    <div className="space-y-5">
      <ModuleHeader
        moduleKey="overview"
        title="Overview"
        subtitle={`${hello}, ${profile?.full_name?.split(" ")[0] ?? ""} — here is how things are going today, ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}.`}
        actions={
          <>
            <div
              className="flex rounded-xl bg-mist-2 p-1"
              role="group"
              aria-label="Time period"
            >
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setDays(p)}
                  className={clsx(
                    "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition",
                    days === p
                      ? "bg-white text-ink shadow-card"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  {p} days
                </button>
              ))}
            </div>
            <Link to="/leads" className="btn-primary">
              See all enquiries <ArrowRight size={15} />
            </Link>
          </>
        }
      />

      {/* ---- 4 numbers that matter ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Inbox}
          color="#DB2777"
          bg="#FCE7F3"
          title="Enquiries in progress"
          value={inProgress}
          to="/leads"
          extra={
            <Meter
              pct={totalLeads ? (inProgress / totalLeads) * 100 : 0}
              color="#DB2777"
            />
          }
          explain={`Interested but not bought yet · ${money(s.pipeline_value)} possible`}
        />
        <StatCard
          icon={UserPlus}
          color="#2563EB"
          bg="#DBEAFE"
          title={`New enquiries (last ${days} days)`}
          value={s.new_leads}
          to="/leads"
          extra={
            <div className="h-9">
              <ResponsiveContainer>
                <BarChart
                  data={daily}
                  margin={{ top: 2, bottom: 0, left: 0, right: 0 }}
                  barCategoryGap={days > 30 ? 1 : 2}
                >
                  <Bar
                    dataKey="count"
                    fill="#2563EB"
                    radius={[2, 2, 0, 0]}
                    minPointSize={2}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
          explain="Fresh leads that came in"
        />
        <StatCard
          icon={Trophy}
          color="#16A34A"
          bg="#DCFCE7"
          title="Became customers"
          value={s.converted_leads}
          to="/clients"
          extra={<Meter pct={s.conversion_rate} color="#16A34A" />}
          explain={
            totalLeads
              ? `${s.conversion_rate}% of all enquiries turned into customers`
              : "No enquiries yet"
          }
        />
        <StatCard
          icon={Wallet}
          color="#0B857D"
          bg="#E6F7F5"
          title="Money received"
          value={money(s.revenue_paid)}
          extra={<Meter pct={collected} color="#12ACA2" />}
          explain={
            s.revenue_pending > 0
              ? `${money(s.revenue_pending)} still to be collected`
              : "Nothing pending to collect"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* ---- What needs attention ---- */}
        <Card
          className="xl:col-span-3"
          title="Needs attention today"
          sub={
            <span className="flex flex-wrap items-center gap-2">
              {lateCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-bold text-amber-700">
                  <AlertTriangle size={12} /> {lateCount} late
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[12px] font-bold text-teal-700">
                <CalendarClock size={12} /> {s.followups_today} due today
              </span>
            </span>
          }
          action={<SeeAll to="/follow-ups" />}
        >
          {today.isLoading || overdue.isLoading ? (
            <Spinner />
          ) : todo.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A]">
                <CheckCircle2 size={28} />
              </span>
              <p className="mt-3 text-[15px] font-bold text-ink">
                All caught up 🎉
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                No calls or meetings due today.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-1 px-3 pb-3">
              {todo.map((f) => {
                const late = isOverdue(f.due_at);
                const k = FU[f.type] ?? {
                  word: "Task",
                  icon: BriefcaseBusiness,
                  c: "#7C3AED",
                  bg: "#EDE9FE",
                };
                const to = f.lead_id
                  ? `/leads/${f.lead_id}`
                  : f.client_id
                    ? `/clients/${f.client_id}`
                    : f.type === "meeting"
                      ? "/meetings"
                      : "/reminders";
                return (
                  <li key={f.id}>
                    <Link
                      to={to}
                      className="group flex items-center gap-3.5 rounded-xl px-2.5 py-2.5 transition hover:bg-slate-50"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: k.bg, color: k.c }}
                      >
                        <k.icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          <span style={{ color: k.c }}>{k.word}</span> ·{" "}
                          {f.lead?.name ?? f.client?.name ?? f.title}
                        </p>
                        <p className="truncate text-[12.5px] text-slate-500">
                          {f.title}
                          {f.assignee ? ` · ${f.assignee.full_name}` : ""}
                        </p>
                      </div>
                      {f.assignee && (
                        <span
                          className="hidden sm:block"
                          title={f.assignee.full_name}
                        >
                          <Avatar name={f.assignee.full_name} size={26} />
                        </span>
                      )}
                      <span
                        className={clsx(
                          "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold num",
                          late
                            ? "bg-amber-50 text-amber-700"
                            : "bg-teal-50 text-teal-700",
                        )}
                        title={fmtDateTime(f.due_at)}
                      >
                        {late
                          ? `Late · ${fmtRelative(f.due_at).replace(" ago", "")}`
                          : fmtDateTime(f.due_at).split("· ")[1]}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* ---- Where everyone is ---- */}
        <Card
          className="xl:col-span-2"
          title="Where your enquiries are"
          sub={`${totalLeads} enquiries in total`}
          action={<SeeAll to="/leads">Open</SeeAll>}
        >
          <ul className="mt-3 space-y-1 px-3 pb-4">
            {STAGES.map((st) => {
              const n = by[st.key] || 0;
              const pct = totalLeads ? Math.round((n / totalLeads) * 100) : 0;
              const c = toneOf(st.key);
              return (
                <li key={st.key}>
                  <Link
                    to={`/leads?status=${st.key}`}
                    className="group block rounded-xl px-2.5 py-2 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: c }}
                      />
                      <span className="text-[13.5px] font-semibold text-slate-700 group-hover:text-ink">
                        {st.name}
                      </span>
                      <span className="hidden text-[12px] text-slate-400 sm:inline">
                        · {st.hint}
                      </span>
                      <span className="ml-auto text-[14px] font-extrabold text-ink num">
                        {n}
                      </span>
                      <span className="w-9 text-right text-[11.5px] font-semibold text-slate-400 num">
                        {pct}%
                      </span>
                    </div>
                    <div className="ml-5 mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(n / stageMax) * 100}%`,
                          background: `linear-gradient(90deg, ${c}B3, ${c})`,
                          minWidth: n ? 8 : 0,
                        }}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* ---- New enquiries per day ---- */}
        <Card
          className="xl:col-span-3"
          title="New enquiries each day"
          sub={`${newInPeriod} in the last ${days} days`}
        >
          <div className="h-60 px-3 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={daily} margin={{ left: -18, right: 8, top: 6 }}>
                <defs>
                  <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12ACA2" />
                    <stop offset="100%" stopColor="#0B857D" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF2F6" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11.5, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11.5, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [v, "New enquiries"]}
                  contentStyle={tip}
                  cursor={{ fill: "#F1F4F8" }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#leadsFill)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ---- Where enquiries come from ---- */}
        <Card
          className="xl:col-span-2"
          title="Where enquiries come from"
          sub="All enquiries, by source"
        >
          {sources.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">
              No enquiries yet.
            </p>
          ) : (
            <div className="flex flex-1 flex-col items-center gap-4 px-5 pb-5 pt-3 sm:flex-row">
              <div className="relative h-40 w-40 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={sources.map(([k, v]) => ({
                        name: label(k),
                        value: v,
                      }))}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={74}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {sources.map(([k], i) => (
                        <Cell
                          key={k}
                          fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-extrabold text-ink num">
                    {totalLeads}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    enquiries
                  </span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-2">
                {sources.map(([k, v], i) => (
                  <li key={k} className="flex items-center gap-2.5 text-[13px]">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{
                        background: SOURCE_COLORS[i % SOURCE_COLORS.length],
                      }}
                    />
                    <span className="truncate text-slate-700">{label(k)}</span>
                    <span className="ml-auto font-bold text-ink num">{v}</span>
                    <span className="w-9 text-right text-[12px] text-slate-400 num">
                      {totalLeads ? Math.round((v / totalLeads) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* ---- Money by month ---- */}
        <Card
          className="xl:col-span-3"
          title="Money received each month"
          sub="Payments marked as paid · last 12 months"
        >
          <div className="h-60 px-3 pb-4 pt-4">
            {revenue.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <Wallet size={22} />
                </span>
                <p className="mt-3 font-bold text-ink">
                  No payments received yet
                </p>
                <p className="text-[13px] text-slate-500">
                  Paid payments on customers will show here.
                </p>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={revenue} margin={{ left: 0, right: 8, top: 6 }}>
                  <defs>
                    <linearGradient id="moneyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#12ACA2" />
                      <stop offset="100%" stopColor="#0B857D" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#EEF2F6" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tickFormatter={(v) => money(v)}
                  />
                  <Tooltip
                    formatter={(v) => [money(Number(v)), "Received"]}
                    contentStyle={tip}
                    cursor={{ fill: "#F1F4F8" }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="url(#moneyFill)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* ---- Quick facts ---- */}
        <Card
          className="xl:col-span-2"
          title="At a glance"
          sub="Other numbers worth knowing"
        >
          <div className="grid flex-1 grid-cols-2 gap-3 p-5">
            {[
              {
                icon: Target,
                c: "#7C3AED",
                bg: "#EDE9FE",
                k: "Possible deals",
                v: money(s.pipeline_value),
                to: "/leads",
              },
              {
                icon: Users,
                c: "#0B857D",
                bg: "#E6F7F5",
                k: "Active customers",
                v: `${s.active_clients} of ${s.total_clients}`,
                to: "/clients",
              },
              {
                icon: CalendarClock,
                c: "#EA580C",
                bg: "#FFEDD5",
                k: "Follow-ups pending",
                v: s.followups_pending,
                to: "/follow-ups",
              },
              {
                icon: AlertTriangle,
                c: "#B45309",
                bg: "#FEF3C7",
                k: "Late follow-ups",
                v: lateCount,
                to: "/follow-ups",
              },
            ].map((x) => (
              <Link
                key={x.k}
                to={x.to}
                className="group flex flex-col justify-between rounded-xl border border-mist-2 p-3.5 transition hover:border-slate-300 hover:shadow-card"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: x.bg, color: x.c }}
                >
                  <x.icon size={17} />
                </span>
                <div className="mt-3">
                  <p className="text-[12px] font-semibold text-slate-500">
                    {x.k}
                  </p>
                  <p className="truncate text-[19px] font-extrabold text-ink num">
                    {x.v}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ---- Team (admins only) ---- */}
      {isAdmin && (
        <Card
          title="How the team is doing"
          sub="Ranked by money collected"
          action={<SeeAll to="/employees">Manage team</SeeAll>}
        >
          {perf.isLoading ? (
            <Spinner />
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13.5px]">
                <thead>
                  <tr className="border-y border-mist-2 bg-slate-50/60 text-[11.5px] font-bold uppercase tracking-[.08em] text-slate-500">
                    <th className="py-2.5 pl-5 pr-3">Person</th>
                    <th className="px-3 text-right">Enquiries</th>
                    <th className="px-3 text-right">Customers</th>
                    <th className="px-3">Money collected</th>
                    <th className="px-3 pr-5 text-right">Late follow-ups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {ranked.map((p, i) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold num",
                              i === 0
                                ? "bg-[#FEF3C7] text-[#B45309]"
                                : i === 1
                                  ? "bg-slate-100 text-slate-600"
                                  : i === 2
                                    ? "bg-[#FFEDD5] text-[#C2410C]"
                                    : "text-slate-400",
                            )}
                          >
                            {i + 1}
                          </span>
                          <Avatar name={p.full_name} size={34} />
                          <div className="min-w-0">
                            <div className="truncate font-bold text-ink">
                              {p.full_name}
                            </div>
                            <div className="text-[12.5px] text-slate-500">
                              {p.department_name ?? label(p.role)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 text-right font-semibold text-ink num">
                        {p.leads_assigned}
                      </td>
                      <td className="px-3 text-right font-bold text-[#16A34A] num">
                        {p.leads_won}
                      </td>
                      <td className="px-3">
                        <div className="flex items-center gap-3">
                          <span className="w-20 text-right font-bold text-ink num">
                            {money(p.revenue_collected)}
                          </span>
                          <div className="w-28">
                            <Meter
                              pct={(p.revenue_collected / topRevenue) * 100}
                              color="#12ACA2"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 pr-5 text-right">
                        {p.followups_overdue ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-700 num">
                            {p.followups_overdue}
                          </span>
                        ) : (
                          <span className="text-[12.5px] text-slate-400">
                            None
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
