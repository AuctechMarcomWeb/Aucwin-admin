import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ChevronDown,
  Home,
  KeyRound,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { getModuleCounts } from "@/lib/api";
import { EXTRA_NAV, MODULES } from "@/lib/modules";
import { Avatar } from "./ui";
import { label } from "@/lib/types";

/**
 * AucWin logo.
 *  - default: full colour (for light backgrounds)
 *  - light:   white + teal (for the navy sidebar / dark panels)
 *  - mark:    the icon only
 */
export function Logo({ light, mark, className, tagline }) {
  if (mark)
    return (
      <img
        src={light ? "/brand/aucwin-mark-white.png" : "/brand/aucwin-mark.png"}
        alt="AucWin"
        className={clsx(
          "h-8 w-auto self-start object-contain select-none",
          className,
        )}
        draggable={false}
      />
    );
  if (tagline)
    return (
      <img
        src={light ? "/brand/aucwin-logo-white.png" : "/brand/aucwin-logo.png"}
        alt="AucWin — Manage Leads. Win Customers."
        className={clsx(
          "h-14 w-auto max-w-full self-start object-contain select-none",
          className,
        )}
        draggable={false}
      />
    );
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center gap-2.5 self-start",
        className,
      )}
    >
      <img
        src={light ? "/brand/aucwin-mark-white.png" : "/brand/aucwin-mark.png"}
        alt=""
        className="h-7 w-auto select-none"
        draggable={false}
      />
      <img
        src={light ? "/brand/aucwin-name-white.png" : "/brand/aucwin-name.png"}
        alt="AucWin"
        className="h-[22px] w-auto select-none"
        draggable={false}
      />
    </div>
  );
}

const NAV_NAME = {
  "Lead Management": "Leads",
  "Meeting Management": "Meetings",
  "Customer Management": "Customers",
  "Notes Management": "Notes",
  "To-Do Management": "To-Do",
  "Task Management": "Tasks",
};
const shortLabel = (l) =>
  NAV_NAME[l] ?? l.replace(" Management", "").replace(" Integration", "");

function NavItem({ m, count, onClick }) {
  const loc = useLocation();
  // "/integrations?tab=facebook" style links: active only when the tab matches too
  const [path, query] = m.to.split("?");
  const queryActive = query
    ? loc.pathname === path && loc.search.includes(query)
    : true;
  return (
    <NavLink
      to={m.to}
      onClick={onClick}
      end={m.to === "/"}
      className={({ isActive }) =>
        clsx(
          "group relative flex min-h-[38px] max-h-[50px] flex-1 items-center gap-3 rounded-xl px-2.5 py-1 text-[14.5px] font-semibold transition-colors",
          isActive && queryActive
            ? "bg-white/[.13] text-white"
            : "text-white/90 hover:bg-white/[.07] hover:text-white",
        )
      }
    >
      {({ isActive }) => {
        const on = isActive && queryActive;
        return (
          <>
            {on && (
              <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-teal-500" />
            )}
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              style={
                on
                  ? { background: "#12ACA2", color: "#fff" }
                  : {
                      background: m.bg ?? "#EEF2F6",
                      color: m.color ?? "#0F2F58",
                    }
              }
            >
              <m.icon size={16} strokeWidth={2.3} />
            </span>
            <span className="flex-1 truncate">{shortLabel(m.label)}</span>
            {!!count && (
              <span
                className={clsx(
                  "min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold num",
                  on ? "bg-teal-500 text-white" : "bg-white/15 text-white",
                )}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-1 mt-3 shrink-0 px-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#9FB3CC]">
      {children}
    </p>
  );
}

/** Account menu in the top bar. */
function UserMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const go = (to) => {
    setOpen(false);
    navigate(to);
  };
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar name={profile?.full_name} size={34} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[160px] truncate text-[13.5px] font-bold leading-tight text-white">
            {profile?.full_name}
          </span>
          <span className="block text-[11.5px] leading-tight text-[#B8C7DA]">
            {profile ? label(profile.role) : ""}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={clsx(
            "text-[#B8C7DA] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-mist-2 bg-white shadow-pop"
        >
          <div className="border-b border-mist-2 px-4 py-3.5">
            <p className="truncate text-sm font-bold text-ink">
              {profile?.full_name}
            </p>
            <p className="truncate text-xs text-slate-500">{profile?.email}</p>
          </div>
          <div className="p-1.5">
            {[
              {
                icon: UserRound,
                text: "My profile",
                to: "/settings?tab=profile",
              },
              {
                icon: KeyRound,
                text: "Change password",
                to: "/settings?tab=security",
              },
              { icon: Settings, text: "Settings", to: "/settings" },
            ].map((i) => (
              <button
                key={i.text}
                role="menuitem"
                onClick={() => go(i.to)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-mist hover:text-ink"
              >
                <i.icon size={16} className="text-slate-400" />
                {i.text}
              </button>
            ))}
          </div>
          <div className="border-t border-mist-2 p-1.5">
            <button
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await signOut();
                navigate("/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Search box in the top bar: searches leads (Enter). */
function TopSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    // Ctrl/Cmd + K focuses search
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <form
      role="search"
      className="relative hidden w-full max-w-md md:block"
      onSubmit={(e) => {
        e.preventDefault();
        if (!q.trim()) return;
        navigate(`/leads?q=${encodeURIComponent(q.trim())}`);
        setQ("");
        ref.current?.blur();
      }}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9FB3CC]"
      />
      <input
        ref={ref}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search leads by name, phone or email…"
        aria-label="Search leads"
        className="w-full rounded-xl border border-white/10 bg-white/[.08] py-2.5 pl-10 pr-14 text-sm text-white placeholder:text-[#9FB3CC] transition-colors hover:bg-white/[.12] focus:border-teal-400 focus:bg-white/[.14] focus:outline-none focus:ring-4 focus:ring-teal-500/20"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-[#B8C7DA]">
        Ctrl K
      </kbd>
    </form>
  );
}

export default function Layout() {
  const { profile, signOut, isAdmin, isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const counts = useQuery({
    queryKey: ["module_counts"],
    queryFn: getModuleCounts,
    refetchInterval: 60_000,
  });
  const c = counts.data ?? {};
  const visible = MODULES.filter(
    (m) =>
      (!m.superOnly || isSuperAdmin) &&
      (!m.adminOnly || isAdmin) &&
      !["facebook", "website", "tasks"].includes(m.key),
  );
  const close = () => setOpen(false);
  useEffect(close, [loc.pathname]);

  const sidebar = (
    <div className="flex h-full flex-col bg-ink">
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <Link to="/" aria-label="AucWin home">
          <Logo light />
        </Link>
        <button
          className="rounded-lg p-1 text-white/70 hover:text-white lg:hidden"
          onClick={close}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      {/* menu scrolls only if the screen is very short, and never shows a scrollbar */}
      <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavItem
          m={{
            key: "home",
            label: "Home",
            to: "/",
            icon: Home,
            color: "#0F2F58",
            bg: "#DCE6F2",
          }}
          onClick={close}
        />
        <NavItem m={EXTRA_NAV[0]} onClick={close} />
        <SectionLabel>Workspace</SectionLabel>
        {visible.map((m) => (
          <NavItem
            key={m.key}
            m={m}
            count={m.countKey ? c[m.countKey] : undefined}
            onClick={close}
          />
        ))}
        {isSuperAdmin && (
          <>
            <SectionLabel>Connect</SectionLabel>
            <NavItem
              m={{
                ...MODULES.find((m) => m.key === "facebook"),
                to: "/integrations?tab=facebook",
              }}
              onClick={close}
            />
            <NavItem
              m={{
                ...MODULES.find((m) => m.key === "website"),
                to: "/integrations?tab=website",
              }}
              onClick={close}
            />
          </>
        )}
        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <NavItem m={EXTRA_NAV[1]} onClick={close} />
          </>
        )}
        <div className="mt-auto flex min-h-[46px] max-h-[62px] flex-1 flex-col justify-end pt-2">
          <NavItem
            m={{
              key: "settings",
              label: "Settings",
              to: "/settings",
              icon: Settings,
              color: "#475569",
              bg: "#EEF2F6",
            }}
            onClick={close}
          />
        </div>
      </nav>
      <div className="m-3 mt-1 flex items-center gap-3 rounded-2xl bg-white/[.08] p-2.5 ring-1 ring-white/10">
        <Avatar name={profile?.full_name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-white">
            {profile?.full_name}
          </div>
          <div className="truncate text-[12px] font-medium text-[#B8C7DA]">
            {profile ? label(profile.role) : ""}
            {profile?.department?.name ? ` · ${profile.department.name}` : ""}
          </div>
        </div>
        <button
          title="Sign out"
          aria-label="Sign out"
          className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-mist">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 lg:block">
        <div className="relative h-full">{sidebar}</div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]"
            onClick={close}
          />
          <aside className="absolute inset-y-0 left-0 w-[290px] shadow-pop">
            <div className="relative h-full">{sidebar}</div>
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-ink px-4 shadow-[0_6px_20px_-12px_rgba(15,47,88,.6)] sm:px-5 lg:px-7">
          <button
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="lg:hidden" aria-label="AucWin home">
            <Logo light />
          </Link>
          <TopSearch />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {loc.pathname !== "/leads" && (
              <>
                <Link
                  to="/leads?new=1"
                  className="btn-primary hidden px-3.5 py-2 sm:inline-flex"
                >
                  <Plus size={16} />
                  New lead
                </Link>
                <span className="hidden h-8 w-px bg-white/15 sm:block" />
              </>
            )}
            <UserMenu />
          </div>
        </header>
        <main className="w-full min-w-0 flex-1 p-4 sm:p-5 lg:px-7 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Coloured page title used by every module page. */
export function ModuleHeader({ moduleKey, title, subtitle, actions }) {
  const m = [...MODULES, ...EXTRA_NAV].find((x) => x.key === moduleKey);
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-card ring-1 ring-black/[.03]"
          style={{ background: m.bg, color: m.color }}
        >
          <m.icon size={23} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
            {title ?? m.label}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
