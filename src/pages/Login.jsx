import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, BellRing, CheckCircle2, Loader2, Lock, Mail, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Field, Input, PasswordInput } from "@/components/ui";
import { errMsg } from "@/lib/http";
import { requestPasswordReset } from "@/lib/api";
import { Logo } from "@/components/Layout";

const POINTS = [
  { icon: TrendingUp, title: "Every lead in one pipeline", text: "From Facebook, your website, calls and walk-ins." },
  { icon: BellRing, title: "Never miss a follow-up", text: "Reminders and meetings for the whole team." },
  { icon: Smartphone, title: "Desk and phone in sync", text: "Changes on the app show up here within a second." },
];

export default function Login() {
  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err === "Invalid login credentials" ? "That email and password don't match. Check both and try again." : err);
    else navigate("/");
  }

  async function sendReset() {
    if (!email.trim()) return setError("Enter your email above first, then click “Forgot password?”.");
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setResetSent(true);
    } catch (e) {
      setError(errMsg(e));
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- left: brand panel ---------- */}
      <div className="relative hidden overflow-hidden bg-ink-900 px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-ink-3/40 blur-3xl" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[.07]" aria-hidden>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#fff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <Logo light tagline className="relative h-[76px]" />

        <div className="relative max-w-lg">
          <h2 className="text-[38px] font-extrabold leading-[1.1] tracking-tight">
            Turn every enquiry into a <span className="text-teal-400">customer</span>.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            AucWin keeps your leads, follow-ups, customers and team chat together, so nothing slips through the cracks.
          </p>
          <ul className="mt-9 space-y-5">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.08] text-teal-300 ring-1 ring-white/10">
                  <p.icon size={19} />
                </span>
                <span>
                  <span className="block text-[15px] font-bold">{p.title}</span>
                  <span className="block text-sm text-slate-400">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[13px] text-slate-400">
          <ShieldCheck size={15} className="text-teal-400" />
          Secure sign-in · each person only sees what they're allowed to
        </p>
      </div>

      {/* ---------- right: the form ---------- */}
      <div className="flex items-center justify-center bg-mist px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo tagline className="h-12" />
          </div>
          <div className="rounded-3xl border border-mist-2 bg-white p-7 shadow-lift sm:p-9">
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in with the email and password your administrator gave you.</p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <Field label="Email address">
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="py-3 pl-10"
                  />
                </div>
              </Field>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-600" htmlFor="login-password">
                    Password
                  </label>
                  <button type="button" onClick={sendReset} className="text-[13px] font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400" />
                  <PasswordInput
                    id="login-password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="py-3 pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3 text-sm text-amber-700" role="alert">
                  <AlertCircle size={17} className="mt-px shrink-0" />
                  {error}
                </div>
              )}
              {resetSent && (
                <div className="flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50 px-3.5 py-3 text-sm text-teal-800" role="status">
                  <CheckCircle2 size={17} className="mt-px shrink-0" />
                  If that email has an account, a reset link is on its way. Check your inbox.
                </div>
              )}

              <button className="btn-primary w-full py-3 text-[15px]" disabled={busy}>
                {busy && <Loader2 size={17} className="animate-spin" />}
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-[13px] text-slate-500">
            New here? Your administrator creates your account in <span className="font-semibold text-ink">Team</span>.
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">© {new Date().getFullYear()} AucWin</p>
        </div>
      </div>
    </div>
  );
}
