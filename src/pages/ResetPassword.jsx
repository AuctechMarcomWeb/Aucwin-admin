import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Field, PasswordInput, PasswordStrength, passwordScore } from "@/components/ui";
import { Logo } from "@/components/Layout";
import { resetPassword } from "@/lib/api";
import { errMsg } from "@/lib/http";

/** Opened from the "reset your password" email: /reset-password?token=… */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { score } = passwordScore(pw);
  const matches = pw2.length > 0 && pw === pw2;
  const valid = pw.length >= 8 && score >= 2 && matches;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!valid) return;
    setBusy(true);
    try {
      await resetPassword(token, pw);
      setDone(true);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex justify-center">
          <Logo tagline className="h-12" />
        </div>
        <div className="rounded-3xl border border-mist-2 bg-white p-7 shadow-lift sm:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <KeyRound size={22} />
          </span>
          <h1 className="mt-4 text-[24px] font-extrabold tracking-tight text-ink">Choose a new password</h1>
          {!token ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This link is incomplete. Open the link from your email again, or ask for a new one on the{" "}
              <Link className="font-semibold text-teal-700 hover:underline" to="/login">
                sign-in page
              </Link>
              .
            </p>
          ) : done ? (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-2.5 rounded-xl border border-moss-600/20 bg-moss-50 px-4 py-3 text-sm text-moss-700">
                <CheckCircle2 size={18} />
                Your password has been changed.
              </div>
              <Link to="/login" className="btn-primary w-full py-3">
                Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
              <p className="-mt-3 text-sm text-slate-500">Pick something you haven't used before. The link works for 1 hour.</p>
              <Field label="New password">
                <PasswordInput autoComplete="new-password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
                <PasswordStrength value={pw} />
              </Field>
              <Field label="Confirm new password">
                <PasswordInput
                  autoComplete="new-password"
                  required
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="Type it again"
                  className={clsx(pw2 && !matches && "border-amber-600")}
                />
                {pw2 && !matches && <p className="mt-1.5 text-xs font-medium text-amber-700">Passwords don't match</p>}
              </Field>
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3 text-sm text-amber-700">
                  <AlertCircle size={17} className="mt-px shrink-0" />
                  {error}
                </div>
              )}
              <button className="btn-primary w-full py-3" disabled={busy || !valid}>
                {busy && <Loader2 size={16} className="animate-spin" />}
                Save new password
              </button>
              <p className="text-center text-[13px] text-slate-500">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-teal-700 hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
