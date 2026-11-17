// import { useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import toast from "react-hot-toast";
// import clsx from "clsx";
// import {
//   CheckCircle2,
//   KeyRound,
//   Loader2,
//   ShieldCheck,
//   UserRound,
//   XCircle,
// } from "lucide-react";
// import { errMsg, setToken } from "@/lib/http";
// import { changePassword, updateProfile } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import { label } from "@/lib/types";
// import {
//   Avatar,
//   Field,
//   Input,
//   PageHeader,
//   PasswordInput,
//   PasswordStrength,
//   passwordScore,
// } from "@/components/ui";

// const TABS = [
//   { key: "profile", label: "Profile", icon: UserRound },
//   { key: "security", label: "Password & security", icon: ShieldCheck },
// ];

// export default function Settings() {
//   const [params, setParams] = useSearchParams();
//   const tab = TABS.some((t) => t.key === params.get("tab"))
//     ? params.get("tab")
//     : "profile";

//   return (
//     <div className="max-w-4xl">
//       <PageHeader
//         title="Settings"
//         subtitle="Manage your profile and keep your account secure."
//       />
//       <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
//         {/* side tabs */}
//         <nav
//           className="flex gap-1 overflow-x-auto lg:flex-col"
//           aria-label="Settings sections"
//         >
//           {TABS.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => setParams({ tab: t.key }, { replace: true })}
//               className={clsx(
//                 "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
//                 tab === t.key
//                   ? "bg-white text-ink shadow-card ring-1 ring-mist-2"
//                   : "text-slate-500 hover:bg-white/70 hover:text-ink",
//               )}
//             >
//               <t.icon
//                 size={17}
//                 className={tab === t.key ? "text-teal-600" : ""}
//               />
//               {t.label}
//             </button>
//           ))}
//         </nav>
//         <div>
//           {tab === "profile" ? <ProfileSection /> : <SecuritySection />}
//         </div>
//       </div>
//     </div>
//   );
// }

// function ProfileSection() {
//   const { profile, refreshProfile } = useAuth();
//   const [name, setName] = useState(profile?.full_name ?? "");
//   const [phone, setPhone] = useState(profile?.phone ?? "");
//   const [email, setEmail] = useState(profile?.email ?? "");
//   const [pw, setPw] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState(null);
//   const emailChanged = email.trim().toLowerCase() !== (profile?.email ?? "");
//   const changed =
//     name.trim() !== (profile?.full_name ?? "") ||
//     (phone || "") !== (profile?.phone ?? "") ||
//     emailChanged;

//   async function save(e) {
//     e.preventDefault();
//     setError(null);
//     if (!name.trim()) return setError("Name is required.");
//     if (emailChanged && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
//       return setError("Enter a valid email address.");
//     if (emailChanged && !pw)
//       return setError("Enter your current password to change your email.");
//     setBusy(true);
//     try {
//       const patch = { full_name: name.trim(), phone: phone.trim() || null };
//       if (emailChanged)
//         Object.assign(patch, {
//           email: email.trim().toLowerCase(),
//           current_password: pw,
//         });
//       await updateProfile(profile.id, patch);
//       await refreshProfile();
//       setPw("");
//       toast.success(
//         emailChanged
//           ? "Profile saved — sign in with your new email next time"
//           : "Profile saved",
//       );
//     } catch (err) {
//       setError(errMsg(err));
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="card overflow-hidden">
//       <div className="flex items-center gap-4 border-b border-mist-2 bg-gradient-to-r from-ink to-ink-2 px-6 py-5 text-white">
//         <div className="rounded-full ring-4 ring-white/15">
//           <Avatar name={profile?.full_name} size={56} />
//         </div>
//         <div className="min-w-0">
//           <p className="truncate text-lg font-bold">{profile?.full_name}</p>
//           <p className="truncate text-sm text-slate-300">{profile?.email}</p>
//           <span className="mt-1.5 inline-flex rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-100">
//             {profile ? label(profile.role) : ""}
//             {profile?.department?.name ? ` · ${profile.department.name}` : ""}
//           </span>
//         </div>
//       </div>
//       <form
//         className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2"
//         onSubmit={save}
//       >
//         <Field label="Full name">
//           <Input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             maxLength={80}
//           />
//         </Field>
//         <Field label="Phone">
//           <Input
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             placeholder="+91 98765 43210"
//             maxLength={30}
//           />
//         </Field>
//         <Field label="Email" hint="This is the email you sign in with.">
//           <Input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             autoComplete="email"
//             maxLength={120}
//           />
//         </Field>
//         <Field label="Role" hint="Set by your administrator.">
//           <Input
//             value={
//               profile
//                 ? `${label(profile.role)}${profile.department?.name ? ` · ${profile.department.name}` : ""}`
//                 : ""
//             }
//             disabled
//           />
//         </Field>
//         {emailChanged && (
//           <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 sm:col-span-2">
//             <Field
//               label="Current password"
//               hint="For your security, confirm it's you before changing your sign-in email."
//             >
//               <PasswordInput
//                 value={pw}
//                 onChange={(e) => setPw(e.target.value)}
//                 autoComplete="current-password"
//                 placeholder="Enter your current password"
//               />
//             </Field>
//           </div>
//         )}
//         {error && (
//           <p
//             className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700 sm:col-span-2"
//             role="alert"
//           >
//             {error}
//           </p>
//         )}
//         <div className="flex justify-end gap-2 border-t border-mist-2 pt-5 sm:col-span-2">
//           <button
//             type="button"
//             className="btn-secondary"
//             disabled={!changed || busy}
//             onClick={() => {
//               setName(profile?.full_name ?? "");
//               setPhone(profile?.phone ?? "");
//               setEmail(profile?.email ?? "");
//               setPw("");
//               setError(null);
//             }}
//           >
//             Cancel
//           </button>
//           <button className="btn-primary" disabled={!changed || busy}>
//             {busy && <Loader2 size={16} className="animate-spin" />}
//             Save changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// function SecuritySection() {
//   const [current, setCurrent] = useState("");
//   const [pw, setPw] = useState("");
//   const [pw2, setPw2] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState(null);
//   const [done, setDone] = useState(false);
//   const { score } = passwordScore(pw);
//   const matches = pw2.length > 0 && pw === pw2;
//   const sameAsOld = pw.length > 0 && pw === current;
//   const valid =
//     current.length > 0 && pw.length >= 8 && score >= 2 && matches && !sameAsOld;

//   async function submit(e) {
//     e.preventDefault();
//     setError(null);
//     if (!valid) return;
//     setBusy(true);
//     try {
//       const res = await changePassword(current, pw);
//       if (res?.token) setToken(res.token); // other devices are signed out; keep this one signed in
//       setCurrent("");
//       setPw("");
//       setPw2("");
//       setDone(true);
//       toast.success("Password changed");
//     } catch (err) {
//       setError(errMsg(err));
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="card overflow-hidden">
//       <div className="flex items-start gap-4 border-b border-mist-2 px-6 py-5">
//         <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
//           <KeyRound size={21} />
//         </span>
//         <div>
//           <h2 className="text-base font-bold text-ink">Change password</h2>
//           <p className="mt-0.5 text-sm text-slate-500">
//             For your security, enter your current password first. Changing it
//             signs you out on every other device, including the phone app.
//           </p>
//         </div>
//       </div>

//       <form className="space-y-5 p-6" onSubmit={submit} noValidate>
//         {done && (
//           <div className="flex items-center gap-2.5 rounded-xl border border-moss-600/20 bg-moss-50 px-4 py-3 text-sm text-moss-700">
//             <CheckCircle2 size={18} />
//             Your password was changed. Use the new password next time you sign
//             in.
//           </div>
//         )}
//         <Field label="Current password">
//           <PasswordInput
//             autoComplete="current-password"
//             value={current}
//             onChange={(e) => {
//               setCurrent(e.target.value);
//               setError(null);
//               setDone(false);
//             }}
//             placeholder="Enter your current password"
//           />
//         </Field>
//         <div className="grid gap-5 sm:grid-cols-2">
//           <Field label="New password">
//             <PasswordInput
//               autoComplete="new-password"
//               value={pw}
//               onChange={(e) => {
//                 setPw(e.target.value);
//                 setDone(false);
//               }}
//               placeholder="At least 8 characters"
//             />
//           </Field>
//           <Field label="Confirm new password">
//             <PasswordInput
//               autoComplete="new-password"
//               value={pw2}
//               onChange={(e) => setPw2(e.target.value)}
//               placeholder="Type it again"
//               className={clsx(
//                 pw2 &&
//                   !matches &&
//                   "border-amber-600 focus:border-amber-600 focus:ring-amber-50",
//               )}
//             />
//             {pw2 && (
//               <p
//                 className={clsx(
//                   "mt-1.5 flex items-center gap-1 text-xs font-medium",
//                   matches ? "text-moss-700" : "text-amber-700",
//                 )}
//               >
//                 {matches ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
//                 {matches ? "Passwords match" : "Passwords don't match"}
//               </p>
//             )}
//           </Field>
//         </div>
//         <PasswordStrength value={pw} />
//         {sameAsOld && (
//           <p className="text-sm font-medium text-amber-700">
//             The new password must be different from your current one.
//           </p>
//         )}
//         {error && (
//           <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
//             <XCircle size={18} />
//             {error}
//           </div>
//         )}
//         <div className="flex flex-col-reverse gap-3 border-t border-mist-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
//           <p className="text-xs text-slate-400">
//             Tip: a short sentence like “Blue-Mango-Rides-2026!” is strong and
//             easy to remember.
//           </p>
//           <button className="btn-primary shrink-0" disabled={!valid || busy}>
//             {busy && <Loader2 size={16} className="animate-spin" />}
//             Update password
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Info,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  UserRound,
  XCircle,
} from "lucide-react";
import { errMsg, setToken } from "@/lib/http";
import { changePassword, updateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { label } from "@/lib/types";
import {
  Avatar,
  Field,
  PageHeader,
  PasswordInput,
  PasswordStrength,
  fmtDate,
  passwordScore,
} from "@/components/ui";

const TABS = [
  {
    key: "profile",
    label: "Profile",
    hint: "Name, phone and email",
    icon: UserRound,
  },
  {
    key: "security",
    label: "Password & security",
    hint: "Change your password",
    icon: ShieldCheck,
  },
];
const ROLE_TONE = {
  super_admin: "bg-teal-400/20 text-teal-100 ring-teal-300/30",
  admin: "bg-violet-400/20 text-violet-100 ring-violet-300/30",
  employee: "bg-white/15 text-white ring-white/20",
};

/** input with an icon on the left */
function IconInput({ icon: Icon, className, ...props }) {
  return (
    <div className="relative">
      <Icon
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input {...props} className={clsx("input pl-10", className)} />
    </div>
  );
}

export default function Settings() {
  const [params, setParams] = useSearchParams();
  const { profile, signOut } = useAuth();
  const tab = TABS.some((t) => t.key === params.get("tab"))
    ? params.get("tab")
    : "profile";

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and keep your account secure."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ---------- left: who you are + menu ---------- */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="card overflow-hidden">
            <div className="relative overflow-hidden bg-ink px-5 pb-5 pt-6 text-white">
              <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-teal-400/15" />
              <div className="pointer-events-none absolute -bottom-16 right-10 h-28 w-28 rounded-full bg-teal-400/10" />
              <div className="relative flex items-center gap-3.5">
                <div className="rounded-full ring-4 ring-white/15">
                  <Avatar name={profile?.full_name} size={60} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-bold">
                    {profile?.full_name}
                  </p>
                  <p className="truncate text-[13px] text-white/70">
                    {profile?.email}
                  </p>
                  {profile && (
                    <span
                      className={clsx(
                        "mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ring-1",
                        ROLE_TONE[profile.role] ?? ROLE_TONE.employee,
                      )}
                    >
                      <BadgeCheck size={12} /> {label(profile.role)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <dl className="divide-y divide-mist px-5 text-[13px]">
              {[
                { icon: Phone, k: "Phone", v: profile?.phone },
                {
                  icon: Building2,
                  k: "Department",
                  v: profile?.department?.name,
                },
                {
                  icon: CalendarDays,
                  k: "Member since",
                  v: profile?.created_at ? fmtDate(profile.created_at) : null,
                },
              ].map((r) => (
                <div key={r.k} className="flex items-center gap-3 py-3">
                  <r.icon size={15} className="shrink-0 text-slate-400" />
                  <dt className="text-slate-500">{r.k}</dt>
                  <dd
                    className={clsx(
                      "ml-auto truncate font-semibold",
                      r.v ? "text-ink" : "text-slate-300",
                    )}
                  >
                    {r.v || "Not set"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <nav
            className="card flex gap-1 overflow-x-auto p-1.5 lg:flex-col"
            aria-label="Settings sections"
          >
            {TABS.map((t) => {
              const on = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setParams({ tab: t.key }, { replace: true })}
                  className={clsx(
                    "group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors lg:w-full",
                    on
                      ? "bg-teal-50 text-ink"
                      : "text-slate-600 hover:bg-slate-50 hover:text-ink",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                      on
                        ? "bg-teal-600 text-white shadow-brand"
                        : "bg-mist text-slate-500 group-hover:text-ink",
                    )}
                  >
                    <t.icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold">
                      {t.label}
                    </span>
                    <span className="hidden text-[12px] text-slate-500 sm:block">
                      {t.hint}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className={clsx(
                      "ml-auto hidden shrink-0 lg:block",
                      on ? "text-teal-600" : "text-slate-300",
                    )}
                  />
                </button>
              );
            })}
          </nav>

          <button
            onClick={signOut}
            className="hidden w-full items-center justify-center gap-2 rounded-xl border border-mist-3 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 lg:flex"
          >
            <LogOut size={16} /> Sign out of this device
          </button>
        </div>

        {/* ---------- right: the section ---------- */}
        <div className="min-w-0">
          {tab === "profile" ? <ProfileSection /> : <SecuritySection />}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-4 border-b border-mist-2 px-6 py-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        <Icon size={21} />
      </span>
      <div>
        <h2 className="text-[16px] font-bold text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const emailChanged = email.trim().toLowerCase() !== (profile?.email ?? "");
  const changed =
    name.trim() !== (profile?.full_name ?? "") ||
    (phone || "") !== (profile?.phone ?? "") ||
    emailChanged;

  async function save(e) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required.");
    if (emailChanged && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return setError("Enter a valid email address.");
    if (emailChanged && !pw)
      return setError("Enter your current password to change your email.");
    setBusy(true);
    try {
      const patch = { full_name: name.trim(), phone: phone.trim() || null };
      if (emailChanged)
        Object.assign(patch, {
          email: email.trim().toLowerCase(),
          current_password: pw,
        });
      await updateProfile(profile.id, patch);
      await refreshProfile();
      setPw("");
      toast.success(
        emailChanged
          ? "Profile saved — sign in with your new email next time"
          : "Profile saved",
      );
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }
  const reset = () => {
    setName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setEmail(profile?.email ?? "");
    setPw("");
    setError(null);
  };

  return (
    <div className="space-y-5">
      <form className="card overflow-hidden" onSubmit={save}>
        <SectionHead
          icon={UserRound}
          title="Personal details"
          text="This is how you appear to your team in chats, tasks and lead history."
        />
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          <Field label="Full name">
            <IconInput
              icon={UserRound}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              placeholder="Your name"
            />
          </Field>
          <Field label="Phone">
            <IconInput
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              maxLength={30}
            />
          </Field>
          <Field
            label="Email"
            hint="This is the email you sign in with."
            className="sm:col-span-2"
          >
            <IconInput
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={120}
            />
          </Field>
          {emailChanged && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 sm:col-span-2">
              <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-teal-800">
                <Info size={15} /> You are changing your sign-in email
              </p>
              <Field
                label="Current password"
                hint="For your security, confirm it's you before changing your sign-in email."
              >
                <PasswordInput
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                />
              </Field>
            </div>
          )}
          {error && (
            <p
              className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700 sm:col-span-2"
              role="alert"
            >
              <XCircle size={17} /> {error}
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-mist-2 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={clsx(
              "text-[13px]",
              changed ? "font-semibold text-amber-700" : "text-slate-400",
            )}
          >
            {changed ? "● You have unsaved changes" : "All changes saved"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={!changed || busy}
              onClick={reset}
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={!changed || busy}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </form>

      <div className="card overflow-hidden">
        <SectionHead
          icon={BadgeCheck}
          title="Role & access"
          text="Your role decides what you can see and change. Only an administrator can change it."
        />
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              k: "Role",
              v: profile ? label(profile.role) : "—",
            },
            {
              icon: Building2,
              k: "Department",
              v: profile?.department?.name || "None",
            },
            { icon: CheckCircle2, k: "Account", v: "Active" },
          ].map((r) => (
            <div
              key={r.k}
              className="flex items-center gap-3 rounded-xl border border-mist-2 bg-slate-50/50 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 ring-1 ring-mist-2">
                <r.icon size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-slate-500">{r.k}</p>
                <p className="truncate text-[14px] font-bold text-ink">{r.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const { score } = passwordScore(pw);
  const matches = pw2.length > 0 && pw === pw2;
  const sameAsOld = pw.length > 0 && pw === current;
  const valid =
    current.length > 0 && pw.length >= 8 && score >= 2 && matches && !sameAsOld;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!valid) return;
    setBusy(true);
    try {
      const res = await changePassword(current, pw);
      if (res?.token) setToken(res.token); // other devices are signed out; keep this one signed in
      setCurrent("");
      setPw("");
      setPw2("");
      setDone(true);
      toast.success("Password changed");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="card overflow-hidden">
        <SectionHead
          icon={KeyRound}
          title="Change password"
          text="Enter your current password first, then choose a new one."
        />

        <form className="space-y-5 p-6" onSubmit={submit} noValidate>
          {done && (
            <div className="flex items-center gap-2.5 rounded-xl border border-moss-600/20 bg-moss-50 px-4 py-3 text-sm text-moss-700">
              <CheckCircle2 size={18} />
              Your password was changed. Use the new password next time you sign
              in.
            </div>
          )}
          <Field label="Current password">
            <PasswordInput
              autoComplete="current-password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                setError(null);
                setDone(false);
              }}
              placeholder="Enter your current password"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New password">
              <PasswordInput
                autoComplete="new-password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setDone(false);
                }}
                placeholder="At least 8 characters"
              />
            </Field>
            <Field label="Confirm new password">
              <PasswordInput
                autoComplete="new-password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Type it again"
                className={clsx(
                  pw2 &&
                    !matches &&
                    "border-amber-600 focus:border-amber-600 focus:ring-amber-50",
                )}
              />
              {pw2 && (
                <p
                  className={clsx(
                    "mt-1.5 flex items-center gap-1 text-xs font-medium",
                    matches ? "text-moss-700" : "text-amber-700",
                  )}
                >
                  {matches ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {matches ? "Passwords match" : "Passwords don't match"}
                </p>
              )}
            </Field>
          </div>
          <PasswordStrength value={pw} />
          {sameAsOld && (
            <p className="text-sm font-medium text-amber-700">
              The new password must be different from your current one.
            </p>
          )}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <XCircle size={18} />
              {error}
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-mist-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Tip: a short sentence like “Blue-Mango-Rides-2026!” is strong and
              easy to remember.
            </p>
            <button className="btn-primary shrink-0" disabled={!valid || busy}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              Update password
            </button>
          </div>
        </form>
      </div>
      <div className="space-y-4">
        <div className="card p-5">
          <p className="mb-3 flex items-center gap-2 text-[14px] font-bold text-ink">
            <ShieldCheck size={17} className="text-teal-600" /> Keep your
            account safe
          </p>
          <ul className="space-y-2.5 text-[13px] leading-relaxed text-slate-600">
            {[
              "Use a password you don't use on any other website.",
              "Mix upper and lower case letters, numbers and a symbol.",
              "Never share your password — admins can reset it if you forget.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-teal-500"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card flex gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Smartphone size={19} />
          </span>
          <p className="text-[13px] leading-relaxed text-slate-600">
            <b className="text-ink">Other devices sign out.</b> After you change
            your password, the phone app and other browsers will ask you to sign
            in again. This device stays signed in.
          </p>
        </div>
      </div>
    </div>
  );
}
