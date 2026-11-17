// import { useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import {
//   Plus,
//   Loader2,
//   Pencil,
//   UserX,
//   UserCheck as UserCheckIcon,
//   KeyRound,
//   Copy,
//   RefreshCw,
//   Users,
//   ShieldCheck,
//   UserRoundCheck,
// } from "lucide-react";
// import {
//   createDepartment,
//   createEmployee,
//   getDepartments,
//   getEmployeePerformance,
//   getProfiles,
//   resetUserPassword,
//   updateProfile,
// } from "@/lib/api";
// import { errMsg } from "@/lib/http";
// import { useAuth } from "@/lib/auth";
// import { label } from "@/lib/types";
// import {
//   Avatar,
//   Badge,
//   Empty,
//   Field,
//   Input,
//   Modal,
//   PasswordInput,
//   PasswordStrength,
//   Select,
//   Spinner,
//   passwordScore,
//   fmtDateTime,
//   money,
// } from "@/components/ui";
// import { ModuleHeader } from "@/components/Layout";

// export default function Employees() {
//   const qc = useQueryClient();
//   const { isSuperAdmin, profile: me } = useAuth();
//   const profiles = useQuery({ queryKey: ["profiles"], queryFn: getProfiles });
//   const perf = useQuery({
//     queryKey: ["employee_performance"],
//     queryFn: getEmployeePerformance,
//   });
//   const depts = useQuery({
//     queryKey: ["departments"],
//     queryFn: getDepartments,
//   });
//   const [open, setOpen] = useState(false);
//   const [deptOpen, setDeptOpen] = useState(false);
//   const [resetFor, setResetFor] = useState(null);
//   const [toggleFor, setToggleFor] = useState(null);
//   const [editFor, setEditFor] = useState(null);
//   const canReset = (p) =>
//     p.id !== me?.id &&
//     (isSuperAdmin ||
//       (p.role === "employee" &&
//         p.department_id &&
//         p.department_id === me?.department_id));
//   const all = profiles.data ?? [];
//   const activeCount = all.filter((p) => p.is_active).length;
//   const adminCount = all.filter((p) => p.role !== "employee").length;
//   const perfById = Object.fromEntries((perf.data ?? []).map((p) => [p.id, p]));

//   const patch = useMutation({
//     mutationFn: ({ id, p }) => updateProfile(id, p),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["profiles"] });
//       qc.invalidateQueries({ queryKey: ["employee_performance"] });
//       toast.success("Updated");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });

//   return (
//     <div>
//       <ModuleHeader
//         moduleKey="team"
//         title="Team"
//         subtitle="Accounts, roles, departments and performance."
//         actions={
//           <>
//             {isSuperAdmin && (
//               <button
//                 className="btn-secondary"
//                 onClick={() => setDeptOpen(true)}
//               >
//                 Departments
//               </button>
//             )}
//             <button className="btn-primary" onClick={() => setOpen(true)}>
//               <Plus size={16} /> Add employee
//             </button>
//           </>
//         }
//       />
//       <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
//         {[
//           {
//             icon: Users,
//             label: "Team members",
//             value: all.length,
//             tone: "bg-teal-50 text-teal-600",
//           },
//           {
//             icon: UserRoundCheck,
//             label: "Active accounts",
//             value: activeCount,
//             tone: "bg-moss-50 text-moss-600",
//           },
//           {
//             icon: ShieldCheck,
//             label: "Admins & owners",
//             value: adminCount,
//             tone: "bg-plum-50 text-plum-600",
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="card flex items-center gap-4 p-3.5 sm:p-5"
//           >
//             <span
//               className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${s.tone}`}
//             >
//               <s.icon size={20} />
//             </span>
//             <div>
//               <p className="text-[12px] font-medium leading-tight text-slate-500 sm:text-[13px]">
//                 {s.label}
//               </p>
//               <p className="text-2xl font-bold text-ink num">
//                 {profiles.isLoading ? "–" : s.value}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="card overflow-hidden">
//         {profiles.isLoading ? (
//           <Spinner />
//         ) : !profiles.data?.length ? (
//           <Empty title="No employees" />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Employee</th>
//                   <th>Role</th>
//                   <th>Department</th>
//                   <th className="text-right">Leads</th>
//                   <th className="text-right">Won</th>
//                   <th className="text-right">Overdue</th>
//                   <th className="text-right">Revenue</th>
//                   <th>Last active</th>
//                   <th>Status</th>
//                   <th />
//                 </tr>
//               </thead>
//               <tbody>
//                 {profiles.data.map((p) => {
//                   const s = perfById[p.id];
//                   return (
//                     <tr key={p.id}>
//                       <td>
//                         <div className="flex items-center gap-2">
//                           <Avatar name={p.full_name} size={30} />
//                           <div>
//                             <div className="font-medium text-ink">
//                               {p.full_name}
//                               {p.id === me?.id && (
//                                 <span className="ml-1 text-xs text-slate-400">
//                                   (you)
//                                 </span>
//                               )}
//                             </div>
//                             <div className="text-xs text-slate-500">
//                               {p.email}
//                               {p.phone ? ` · ${p.phone}` : ""}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         {isSuperAdmin && p.id !== me?.id ? (
//                           <Select
//                             className="w-32 py-1"
//                             value={p.role}
//                             onChange={(e) =>
//                               patch.mutate({
//                                 id: p.id,
//                                 p: { role: e.target.value },
//                               })
//                             }
//                             options={["super_admin", "admin", "employee"].map(
//                               (r) => ({ value: r, label: label(r) }),
//                             )}
//                           />
//                         ) : (
//                           <Badge value={p.role} />
//                         )}
//                       </td>
//                       <td>
//                         {isSuperAdmin ? (
//                           <Select
//                             className="w-40 py-1"
//                             value={p.department_id ?? ""}
//                             onChange={(e) =>
//                               patch.mutate({
//                                 id: p.id,
//                                 p: { department_id: e.target.value || null },
//                               })
//                             }
//                             options={(depts.data ?? []).map((d) => ({
//                               value: d.id,
//                               label: d.name,
//                             }))}
//                             placeholder="— None —"
//                           />
//                         ) : (
//                           (p.department?.name ?? "—")
//                         )}
//                       </td>
//                       <td className="text-right">{s?.leads_assigned ?? 0}</td>
//                       <td className="text-right text-moss-700">
//                         {s?.leads_won ?? 0}
//                       </td>
//                       <td
//                         className={`text-right ${s?.followups_overdue ? "text-amber-600" : ""}`}
//                       >
//                         {s?.followups_overdue ?? 0}
//                       </td>
//                       <td className="text-right">
//                         {money(s?.revenue_collected ?? 0)}
//                       </td>
//                       <td className="text-xs text-slate-500">
//                         {s?.last_activity_at
//                           ? fmtDateTime(s.last_activity_at)
//                           : "—"}
//                       </td>
//                       <td>
//                         <span
//                           className={
//                             p.is_active
//                               ? "inline-flex items-center gap-1.5 rounded-full bg-moss-50 px-2.5 py-1 text-xs font-semibold text-moss-700"
//                               : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
//                           }
//                         >
//                           <span
//                             className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-moss-600" : "bg-slate-400"}`}
//                           />
//                           {p.is_active ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td>
//                         {p.id !== me?.id && (
//                           <div className="flex justify-end gap-0.5">
//                             {canReset(p) && (
//                               <button
//                                 className="btn-ghost p-1.5"
//                                 title="Edit name, email and phone"
//                                 aria-label={`Edit ${p.full_name}`}
//                                 onClick={() => setEditFor(p)}
//                               >
//                                 <Pencil size={15} className="text-slate-500" />
//                               </button>
//                             )}
//                             {canReset(p) && (
//                               <button
//                                 className="btn-ghost p-1.5"
//                                 title="Reset password"
//                                 aria-label={`Reset password for ${p.full_name}`}
//                                 onClick={() => setResetFor(p)}
//                               >
//                                 <KeyRound size={15} className="text-teal-600" />
//                               </button>
//                             )}
//                             <button
//                               className="btn-ghost p-1.5"
//                               title={p.is_active ? "Deactivate" : "Reactivate"}
//                               aria-label={`${p.is_active ? "Deactivate" : "Reactivate"} ${p.full_name}`}
//                               onClick={() => setToggleFor(p)}
//                             >
//                               {p.is_active ? (
//                                 <UserX size={15} className="text-amber-600" />
//                               ) : (
//                                 <UserCheckIcon
//                                   size={15}
//                                   className="text-moss-600"
//                                 />
//                               )}
//                             </button>
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       <Modal
//         open={!!editFor}
//         onClose={() => setEditFor(null)}
//         title="Edit team member"
//       >
//         {editFor && (
//           <EditPersonForm person={editFor} onDone={() => setEditFor(null)} />
//         )}
//       </Modal>
//       <Modal
//         open={!!resetFor}
//         onClose={() => setResetFor(null)}
//         title="Reset password"
//       >
//         {resetFor && (
//           <ResetPasswordForm
//             person={resetFor}
//             onDone={() => setResetFor(null)}
//           />
//         )}
//       </Modal>
//       <Modal
//         open={!!toggleFor}
//         onClose={() => setToggleFor(null)}
//         title={
//           toggleFor?.is_active ? "Deactivate account?" : "Reactivate account?"
//         }
//       >
//         {toggleFor && (
//           <>
//             <p className="text-sm text-slate-600">
//               {toggleFor.is_active
//                 ? `${toggleFor.full_name} will be signed out and won't be able to sign in until you reactivate the account. Their leads and history stay as they are.`
//                 : `${toggleFor.full_name} will be able to sign in again.`}
//             </p>
//             <div className="mt-5 flex justify-end gap-2">
//               <button
//                 className="btn-secondary"
//                 onClick={() => setToggleFor(null)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className={toggleFor.is_active ? "btn-danger" : "btn-primary"}
//                 disabled={patch.isPending}
//                 onClick={() =>
//                   patch.mutate(
//                     {
//                       id: toggleFor.id,
//                       p: { is_active: !toggleFor.is_active },
//                     },
//                     { onSuccess: () => setToggleFor(null) },
//                   )
//                 }
//               >
//                 {patch.isPending && (
//                   <Loader2 size={16} className="animate-spin" />
//                 )}
//                 {toggleFor.is_active ? "Deactivate" : "Reactivate"}
//               </button>
//             </div>
//           </>
//         )}
//       </Modal>
//       <Modal open={open} onClose={() => setOpen(false)} title="Add employee">
//         <NewEmployeeForm onDone={() => setOpen(false)} />
//       </Modal>
//       <Modal
//         open={deptOpen}
//         onClose={() => setDeptOpen(false)}
//         title="Departments"
//       >
//         <DepartmentsManager />
//       </Modal>
//     </div>
//   );
// }

// function NewEmployeeForm({ onDone }) {
//   const qc = useQueryClient();
//   const { isSuperAdmin, profile: me } = useAuth();
//   const depts = useQuery({
//     queryKey: ["departments"],
//     queryFn: getDepartments,
//   });
//   const [f, setF] = useState({
//     full_name: "",
//     email: "",
//     phone: "",
//     password: "",
//     role: "employee",
//     department_id: me?.department_id ?? "",
//   });
//   const m = useMutation({
//     mutationFn: () =>
//       createEmployee({ ...f, department_id: f.department_id || null }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["profiles"] });
//       qc.invalidateQueries({ queryKey: ["employee_performance"] });
//       toast.success("Employee account created");
//       onDone();
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   return (
//     <form
//       className="grid grid-cols-1 gap-4 sm:grid-cols-2"
//       onSubmit={(e) => {
//         e.preventDefault();
//         m.mutate();
//       }}
//     >
//       <Field label="Full name *" className="sm:col-span-2">
//         <Input
//           required
//           value={f.full_name}
//           onChange={(e) => setF({ ...f, full_name: e.target.value })}
//         />
//       </Field>
//       <Field label="Email *">
//         <Input
//           type="email"
//           required
//           value={f.email}
//           onChange={(e) => setF({ ...f, email: e.target.value })}
//         />
//       </Field>
//       <Field label="Phone">
//         <Input
//           value={f.phone}
//           onChange={(e) => setF({ ...f, phone: e.target.value })}
//         />
//       </Field>
//       <Field
//         label="Temporary password *"
//         hint="Share it privately. They can change it in Settings → Password & security."
//       >
//         <TempPasswordInput
//           value={f.password}
//           onChange={(v) => setF({ ...f, password: v })}
//         />
//       </Field>
//       <Field label="Role">
//         <Select
//           value={f.role}
//           onChange={(e) => setF({ ...f, role: e.target.value })}
//           options={(isSuperAdmin
//             ? ["employee", "admin", "super_admin"]
//             : ["employee", "admin"]
//           ).map((r) => ({ value: r, label: label(r) }))}
//         />
//       </Field>
//       <Field
//         label="Department"
//         className="sm:col-span-2"
//         hint={
//           !isSuperAdmin
//             ? "Admins can only add people to their own department."
//             : undefined
//         }
//       >
//         <Select
//           value={f.department_id}
//           disabled={!isSuperAdmin}
//           onChange={(e) => setF({ ...f, department_id: e.target.value })}
//           options={(depts.data ?? []).map((d) => ({
//             value: d.id,
//             label: d.name,
//           }))}
//           placeholder="— None —"
//         />
//       </Field>
//       <div className="flex justify-end sm:col-span-2">
//         <button className="btn-primary" disabled={m.isPending}>
//           {m.isPending && <Loader2 size={16} className="animate-spin" />}Create
//           account
//         </button>
//       </div>
//     </form>
//   );
// }

// /** Random, easy-to-type temporary password, e.g. "Kite-Mango-48#". */
// function generatePassword() {
//   const words = [
//     "Blue",
//     "Kite",
//     "Mango",
//     "River",
//     "Cloud",
//     "Tiger",
//     "Maple",
//     "Coral",
//     "Lotus",
//     "Spark",
//     "Ocean",
//     "Amber",
//     "Cedar",
//     "Pearl",
//     "Swift",
//   ];
//   const pick = () => words[Math.floor(Math.random() * words.length)];
//   const n = String(Math.floor(10 + Math.random() * 90));
//   const sym = "!@#$%&*"[Math.floor(Math.random() * 7)];
//   return `${pick()}-${pick()}-${n}${sym}`;
// }
// function TempPasswordInput({ value, onChange }) {
//   return (
//     <div>
//       <div className="flex gap-2">
//         <div className="flex-1">
//           <PasswordInput
//             required
//             minLength={8}
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             autoComplete="new-password"
//           />
//         </div>
//         <button
//           type="button"
//           className="btn-secondary px-3"
//           title="Generate a password"
//           onClick={() => onChange(generatePassword())}
//         >
//           <RefreshCw size={15} />
//         </button>
//         <button
//           type="button"
//           className="btn-secondary px-3"
//           title="Copy"
//           disabled={!value}
//           onClick={() =>
//             navigator.clipboard?.writeText(value).then(
//               () => toast.success("Password copied"),
//               () => {},
//             )
//           }
//         >
//           <Copy size={15} />
//         </button>
//       </div>
//       <PasswordStrength value={value} />
//     </div>
//   );
// }

// function EditPersonForm({ person, onDone }) {
//   const qc = useQueryClient();
//   const [f, setF] = useState({
//     full_name: person.full_name ?? "",
//     email: person.email ?? "",
//     phone: person.phone ?? "",
//   });
//   const emailChanged = f.email.trim().toLowerCase() !== (person.email ?? "");
//   const m = useMutation({
//     mutationFn: () => {
//       if (!f.full_name.trim()) throw new Error("Name is required.");
//       if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()))
//         throw new Error("Enter a valid email address.");
//       return updateProfile(person.id, {
//         full_name: f.full_name.trim(),
//         phone: f.phone.trim() || null,
//         ...(emailChanged ? { email: f.email.trim().toLowerCase() } : {}),
//       });
//     },
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["profiles"] });
//       qc.invalidateQueries({ queryKey: ["employee_performance"] });
//       toast.success("Saved");
//       onDone();
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   return (
//     <form
//       className="grid grid-cols-1 gap-4 sm:grid-cols-2"
//       onSubmit={(e) => {
//         e.preventDefault();
//         m.mutate();
//       }}
//     >
//       <Field label="Full name *" className="sm:col-span-2">
//         <Input
//           required
//           value={f.full_name}
//           onChange={(e) => setF({ ...f, full_name: e.target.value })}
//           maxLength={80}
//         />
//       </Field>
//       <Field label="Email (used to sign in) *">
//         <Input
//           type="email"
//           required
//           value={f.email}
//           onChange={(e) => setF({ ...f, email: e.target.value })}
//           maxLength={120}
//         />
//       </Field>
//       <Field label="Phone">
//         <Input
//           value={f.phone}
//           onChange={(e) => setF({ ...f, phone: e.target.value })}
//           maxLength={30}
//         />
//       </Field>
//       {emailChanged && (
//         <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700 sm:col-span-2">
//           {person.full_name.split(" ")[0]} will need to sign in with the new
//           email. Their password stays the same.
//         </p>
//       )}
//       <div className="flex justify-end gap-2 sm:col-span-2">
//         <button type="button" className="btn-secondary" onClick={onDone}>
//           Cancel
//         </button>
//         <button className="btn-primary" disabled={m.isPending}>
//           {m.isPending && <Loader2 size={16} className="animate-spin" />}
//           Save changes
//         </button>
//       </div>
//     </form>
//   );
// }

// function ResetPasswordForm({ person, onDone }) {
//   const [pw, setPw] = useState(() => generatePassword());
//   const { score } = passwordScore(pw);
//   const m = useMutation({
//     mutationFn: () => resetUserPassword(person.id, pw),
//     onSuccess: () => {
//       toast.success(`Password changed for ${person.full_name}`);
//       onDone();
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         if (pw.length >= 8) m.mutate();
//       }}
//     >
//       <div className="mb-5 flex items-center gap-3 rounded-xl bg-mist px-4 py-3">
//         <Avatar name={person.full_name} size={36} />
//         <div className="min-w-0">
//           <p className="truncate text-sm font-semibold text-ink">
//             {person.full_name}
//           </p>
//           <p className="truncate text-xs text-slate-500">{person.email}</p>
//         </div>
//       </div>
//       <Field label="New password">
//         <TempPasswordInput value={pw} onChange={setPw} />
//       </Field>
//       <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
//         {person.full_name.split(" ")[0]} will be signed out on all devices and
//         must use this new password. Copy it and share it privately.
//       </p>
//       <div className="mt-5 flex justify-end gap-2">
//         <button type="button" className="btn-secondary" onClick={onDone}>
//           Cancel
//         </button>
//         <button
//           className="btn-primary"
//           disabled={m.isPending || pw.length < 8 || score < 2}
//         >
//           {m.isPending && <Loader2 size={16} className="animate-spin" />}
//           Set new password
//         </button>
//       </div>
//     </form>
//   );
// }

// function DepartmentsManager() {
//   const qc = useQueryClient();
//   const depts = useQuery({
//     queryKey: ["departments"],
//     queryFn: getDepartments,
//   });
//   const [name, setName] = useState("");
//   const m = useMutation({
//     mutationFn: () => createDepartment(name.trim()),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["departments"] });
//       setName("");
//       toast.success("Department added");
//     },
//     onError: (e) => toast.error(errMsg(e)),
//   });
//   return (
//     <div>
//       <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-mist-2">
//         {(depts.data ?? []).map((d) => (
//           <li key={d.id} className="px-3 py-2 text-sm">
//             {d.name}
//           </li>
//         ))}
//         {!depts.data?.length && (
//           <li className="px-3 py-2 text-sm text-slate-400">
//             No departments yet
//           </li>
//         )}
//       </ul>
//       <form
//         className="flex gap-2"
//         onSubmit={(e) => {
//           e.preventDefault();
//           if (name.trim()) m.mutate();
//         }}
//       >
//         <Input
//           placeholder="New department name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <button className="btn-primary" disabled={m.isPending}>
//           Add
//         </button>
//       </form>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  Copy,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck as UserCheckIcon,
  UserRoundCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import {
  createDepartment,
  createEmployee,
  getDepartments,
  getEmployeePerformance,
  getProfiles,
  resetUserPassword,
  updateProfile,
} from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { label } from "@/lib/types";
import {
  Avatar,
  Empty,
  Field,
  Input,
  Modal,
  PasswordInput,
  PasswordStrength,
  Select,
  Spinner,
  passwordScore,
  fmtDateTime,
  fmtRelative,
  money,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";

const ROLE = {
  super_admin: { label: "Super Admin", c: "#0F2F58", bg: "#E3EAF4" },
  admin: { label: "Admin", c: "#6B4A9E", bg: "#F1EBFA" },
  employee: { label: "Employee", c: "#0B857D", bg: "#E6F7F5" },
};

/** a coloured pill that is also a dropdown */
function PillSelect({
  value,
  onChange,
  options,
  c,
  bg,
  placeholder,
  icon: Icon,
  ariaLabel,
  disabled,
}) {
  return (
    <span
      className="relative inline-flex max-w-full items-center rounded-full transition hover:brightness-95"
      style={{ background: bg, color: c }}
    >
      {Icon && (
        <Icon size={12} className="pointer-events-none absolute left-2.5" />
      )}
      <select
        aria-label={ariaLabel}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={clsx(
          "max-w-[170px] cursor-pointer appearance-none truncate rounded-full bg-transparent py-1 pr-7 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-teal-500/30",
          Icon ? "pl-7" : "pl-3",
        )}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2" />
    </span>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold",
        active ? "bg-[#E7F4EC] text-[#2F7D4A]" : "bg-slate-100 text-slate-500",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-[#2F7D4A]" : "bg-slate-400",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function Employees() {
  const qc = useQueryClient();
  const { isSuperAdmin, profile: me } = useAuth();
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: getProfiles });
  const perf = useQuery({
    queryKey: ["employee_performance"],
    queryFn: getEmployeePerformance,
  });
  const depts = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [resetFor, setResetFor] = useState(null);
  const [toggleFor, setToggleFor] = useState(null);
  const [editFor, setEditFor] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const canReset = (p) =>
    p.id !== me?.id &&
    (isSuperAdmin ||
      (p.role === "employee" &&
        p.department_id &&
        p.department_id === me?.department_id));
  const all = profiles.data ?? [];
  const activeCount = all.filter((p) => p.is_active).length;
  const adminCount = all.filter((p) => p.role !== "employee").length;
  const perfById = Object.fromEntries((perf.data ?? []).map((p) => [p.id, p]));
  const totalRevenue = (perf.data ?? []).reduce(
    (a, p) => a + (Number(p.revenue_collected) || 0),
    0,
  );
  const deptName = (p) =>
    p.department?.name ??
    (depts.data ?? []).find((d) => d.id === p.department_id)?.name ??
    null;

  const TABS = [
    { key: "all", label: "All", test: () => true },
    {
      key: "super_admin",
      label: "Super admins",
      test: (p) => p.role === "super_admin",
    },
    { key: "admin", label: "Admins", test: (p) => p.role === "admin" },
    { key: "employee", label: "Employees", test: (p) => p.role === "employee" },
    { key: "inactive", label: "Inactive", test: (p) => !p.is_active },
  ];
  const rows = useMemo(() => {
    const t = TABS.find((x) => x.key === tab) ?? TABS[0];
    const s = search.trim().toLowerCase();
    return all
      .filter(t.test)
      .filter(
        (p) =>
          !s ||
          [p.full_name, p.email, p.phone, deptName(p)].some(
            (v) => v && String(v).toLowerCase().includes(s),
          ),
      )
      .sort(
        (a, b) =>
          (a.id === me?.id ? -1 : b.id === me?.id ? 1 : 0) ||
          Number(b.is_active) - Number(a.is_active),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, tab, search, me?.id, depts.data]);

  const patch = useMutation({
    mutationFn: ({ id, p }) => updateProfile(id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["employee_performance"] });
      toast.success("Updated");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const roleCell = (p) => {
    const r = ROLE[p.role] ?? ROLE.employee;
    return isSuperAdmin && p.id !== me?.id ? (
      <PillSelect
        ariaLabel={`Role of ${p.full_name}`}
        value={p.role}
        c={r.c}
        bg={r.bg}
        icon={p.role === "employee" ? null : ShieldCheck}
        onChange={(e) =>
          patch.mutate({ id: p.id, p: { role: e.target.value } })
        }
        options={["super_admin", "admin", "employee"].map((v) => ({
          value: v,
          label: ROLE[v].label,
        }))}
      />
    ) : (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-bold"
        style={{ background: r.bg, color: r.c }}
      >
        {p.role !== "employee" && <ShieldCheck size={12} />}
        {r.label ?? label(p.role)}
      </span>
    );
  };
  const deptCell = (p) =>
    isSuperAdmin ? (
      <PillSelect
        ariaLabel={`Department of ${p.full_name}`}
        value={p.department_id ?? ""}
        c={p.department_id ? "#334155" : "#94A3B8"}
        bg={p.department_id ? "#EEF2F6" : "#F8FAFC"}
        icon={Building2}
        placeholder="No department"
        onChange={(e) =>
          patch.mutate({
            id: p.id,
            p: { department_id: e.target.value || null },
          })
        }
        options={(depts.data ?? []).map((d) => ({
          value: d.id,
          label: d.name,
        }))}
      />
    ) : deptName(p) ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[12.5px] font-semibold text-slate-700">
        <Building2 size={12} /> {deptName(p)}
      </span>
    ) : (
      <span className="text-[12.5px] text-slate-400">No department</span>
    );
  const actions = (p) =>
    p.id !== me?.id && (
      <div className="flex justify-end gap-1">
        {canReset(p) && (
          <button
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink"
            title="Edit name, email and phone"
            aria-label={`Edit ${p.full_name}`}
            onClick={() => setEditFor(p)}
          >
            <Pencil size={15} />
          </button>
        )}
        {canReset(p) && (
          <button
            className="rounded-lg p-2 text-teal-600 transition hover:bg-teal-50"
            title="Reset password"
            aria-label={`Reset password for ${p.full_name}`}
            onClick={() => setResetFor(p)}
          >
            <KeyRound size={15} />
          </button>
        )}
        <button
          className={clsx(
            "rounded-lg p-2 transition",
            p.is_active
              ? "text-amber-600 hover:bg-amber-50"
              : "text-[#2F7D4A] hover:bg-[#E7F4EC]",
          )}
          title={p.is_active ? "Deactivate" : "Reactivate"}
          aria-label={`${p.is_active ? "Deactivate" : "Reactivate"} ${p.full_name}`}
          onClick={() => setToggleFor(p)}
        >
          {p.is_active ? <UserX size={15} /> : <UserCheckIcon size={15} />}
        </button>
      </div>
    );
  const person = (p, size = 40) => (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative shrink-0">
        <Avatar name={p.full_name} size={size} />
        <span
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white",
            p.is_active ? "bg-[#22A06B]" : "bg-slate-300",
          )}
        />
      </span>
      <div className="min-w-0">
        <p
          className={clsx(
            "truncate text-[14.5px] font-bold",
            p.is_active ? "text-ink" : "text-slate-400",
          )}
        >
          {p.full_name}
          {p.id === me?.id && (
            <span className="ml-1.5 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-teal-700">
              You
            </span>
          )}
        </p>
        <p className="truncate text-[12.5px] text-slate-500">
          {p.email}
          {p.phone ? <span className="text-slate-400"> · {p.phone}</span> : ""}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <ModuleHeader
        moduleKey="team"
        title="Team"
        subtitle="Accounts, roles, departments and performance."
        actions={
          <>
            {isSuperAdmin && (
              <button
                className="btn-secondary"
                onClick={() => setDeptOpen(true)}
              >
                <Building2 size={15} /> Departments
              </button>
            )}
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus size={16} /> Add employee
            </button>
          </>
        }
      />

      {/* ---------- stats ---------- */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            icon: Users,
            label: "Team members",
            value: all.length,
            c: "#0B857D",
            bg: "#E6F7F5",
            hint: `${(depts.data ?? []).length} ${(depts.data ?? []).length === 1 ? "department" : "departments"}`,
          },
          {
            icon: UserRoundCheck,
            label: "Active accounts",
            value: activeCount,
            c: "#2F7D4A",
            bg: "#E7F4EC",
            hint:
              all.length - activeCount
                ? `${all.length - activeCount} inactive`
                : "Everyone can sign in",
          },
          {
            icon: ShieldCheck,
            label: "Admins & owners",
            value: adminCount,
            c: "#6B4A9E",
            bg: "#F1EBFA",
            hint: `${all.length - adminCount} ${all.length - adminCount === 1 ? "employee" : "employees"}`,
          },
          {
            icon: CircleDollarSign,
            label: "Revenue collected",
            value: money(totalRevenue),
            c: "#B7791F",
            bg: "#FEF3C7",
            hint: "By the whole team",
          },
        ].map((s) => (
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
                {profiles.isLoading ? "–" : s.value}
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
        <div className="flex flex-col gap-3 border-b border-mist-2 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-mist-2 p-1 [scrollbar-width:none]">
            {TABS.map((t) => {
              const n = all.filter(t.test).length;
              const on = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={clsx(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition",
                    on
                      ? "bg-white text-ink shadow-card"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  {t.label}
                  <span
                    className={clsx(
                      "rounded-full px-1.5 text-[11px] font-bold num",
                      on
                        ? "bg-teal-600 text-white"
                        : "bg-white/70 text-slate-500",
                    )}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative lg:w-80">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9 pr-9"
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {profiles.isLoading ? (
          <Spinner />
        ) : !all.length ? (
          <Empty title="No employees" />
        ) : !rows.length ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Users size={26} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">Nobody matches</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search or tab.
            </p>
            <button
              className="btn-secondary mt-4"
              onClick={() => {
                setSearch("");
                setTab("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-mist-2 text-[11.5px] font-bold uppercase tracking-[.08em] text-slate-500">
                    <th className="py-3 pl-5 pr-3">Team member</th>
                    <th className="px-3">Role</th>
                    <th className="px-3">Department</th>
                    <th className="px-3">Performance</th>
                    <th className="px-3 text-right">Revenue</th>
                    <th className="px-3">Last active</th>
                    <th className="px-3">Status</th>
                    <th className="pr-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {rows.map((p) => {
                    const s = perfById[p.id];
                    const leads = s?.leads_assigned ?? 0,
                      won = s?.leads_won ?? 0,
                      overdue = s?.followups_overdue ?? 0;
                    const rate = leads ? Math.round((won / leads) * 100) : 0;
                    return (
                      <tr
                        key={p.id}
                        className={clsx(
                          "transition-colors hover:bg-slate-50/70",
                          !p.is_active && "bg-slate-50/40",
                        )}
                      >
                        <td className="py-3.5 pl-5 pr-3">{person(p)}</td>
                        <td className="px-3">{roleCell(p)}</td>
                        <td className="px-3">{deptCell(p)}</td>
                        <td className="px-3">
                          <div className="flex items-center gap-3 text-[12.5px]">
                            <span
                              className="text-center"
                              title="Leads assigned"
                            >
                              <b className="block text-[15px] text-ink num">
                                {leads}
                              </b>
                              <span className="text-slate-400">Leads</span>
                            </span>
                            <span className="text-center" title="Leads won">
                              <b className="block text-[15px] text-[#2F7D4A] num">
                                {won}
                              </b>
                              <span className="text-slate-400">Won</span>
                            </span>
                            <span
                              className="text-center"
                              title="Overdue follow-ups"
                            >
                              <b
                                className={clsx(
                                  "block text-[15px] num",
                                  overdue ? "text-amber-600" : "text-slate-300",
                                )}
                              >
                                {overdue}
                              </b>
                              <span className="text-slate-400">Overdue</span>
                            </span>
                            <span
                              className="ml-1 w-20"
                              title={`Win rate ${rate}%`}
                            >
                              <span className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500">
                                <span>Win rate</span>
                                <span className="num">{rate}%</span>
                              </span>
                              <span className="block h-1.5 overflow-hidden rounded-full bg-mist-2">
                                <span
                                  className="block h-full rounded-full bg-teal-500"
                                  style={{ width: `${rate}%` }}
                                />
                              </span>
                            </span>
                          </div>
                        </td>
                        <td
                          className={clsx(
                            "px-3 text-right text-[14px] font-bold num",
                            s?.revenue_collected
                              ? "text-ink"
                              : "text-slate-300",
                          )}
                        >
                          {money(s?.revenue_collected ?? 0)}
                        </td>
                        <td
                          className="whitespace-nowrap px-3 text-[12.5px] text-slate-500"
                          title={
                            s?.last_activity_at
                              ? fmtDateTime(s.last_activity_at)
                              : ""
                          }
                        >
                          {s?.last_activity_at ? (
                            fmtRelative(s.last_activity_at)
                          ) : (
                            <span className="text-slate-300">Never</span>
                          )}
                        </td>
                        <td className="px-3">
                          <StatusPill active={p.is_active} />
                        </td>
                        <td className="pr-4">{actions(p)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* cards for tablets and phones */}
            <ul className="divide-y divide-mist lg:hidden">
              {rows.map((p) => {
                const s = perfById[p.id];
                return (
                  <li key={p.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      {person(p, 42)}
                      {actions(p)}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {roleCell(p)}
                      {deptCell(p)}
                      <StatusPill active={p.is_active} />
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-[11.5px] text-slate-500">
                      <span>
                        <b className="block text-[15px] text-ink num">
                          {s?.leads_assigned ?? 0}
                        </b>
                        Leads
                      </span>
                      <span>
                        <b className="block text-[15px] text-[#2F7D4A] num">
                          {s?.leads_won ?? 0}
                        </b>
                        Won
                      </span>
                      <span>
                        <b
                          className={clsx(
                            "block text-[15px] num",
                            s?.followups_overdue
                              ? "text-amber-600"
                              : "text-ink",
                          )}
                        >
                          {s?.followups_overdue ?? 0}
                        </b>
                        Overdue
                      </span>
                      <span>
                        <b className="block truncate text-[15px] text-ink num">
                          {money(s?.revenue_collected ?? 0)}
                        </b>
                        Revenue
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-slate-400">
                      Last active:{" "}
                      {s?.last_activity_at
                        ? fmtRelative(s.last_activity_at)
                        : "never"}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-mist-2 bg-slate-50/60 px-5 py-2.5 text-[12.5px] text-slate-500">
              Showing <b className="text-ink num">{rows.length}</b> of{" "}
              <b className="text-ink num">{all.length}</b> team members
            </div>
          </>
        )}
      </div>
      <Modal
        open={!!editFor}
        onClose={() => setEditFor(null)}
        title="Edit team member"
      >
        {editFor && (
          <EditPersonForm person={editFor} onDone={() => setEditFor(null)} />
        )}
      </Modal>
      <Modal
        open={!!resetFor}
        onClose={() => setResetFor(null)}
        title="Reset password"
      >
        {resetFor && (
          <ResetPasswordForm
            person={resetFor}
            onDone={() => setResetFor(null)}
          />
        )}
      </Modal>
      <Modal
        open={!!toggleFor}
        onClose={() => setToggleFor(null)}
        title={
          toggleFor?.is_active ? "Deactivate account?" : "Reactivate account?"
        }
      >
        {toggleFor && (
          <>
            <p className="text-sm text-slate-600">
              {toggleFor.is_active
                ? `${toggleFor.full_name} will be signed out and won't be able to sign in until you reactivate the account. Their leads and history stay as they are.`
                : `${toggleFor.full_name} will be able to sign in again.`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setToggleFor(null)}
              >
                Cancel
              </button>
              <button
                className={toggleFor.is_active ? "btn-danger" : "btn-primary"}
                disabled={patch.isPending}
                onClick={() =>
                  patch.mutate(
                    {
                      id: toggleFor.id,
                      p: { is_active: !toggleFor.is_active },
                    },
                    { onSuccess: () => setToggleFor(null) },
                  )
                }
              >
                {patch.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {toggleFor.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </>
        )}
      </Modal>
      <Modal open={open} onClose={() => setOpen(false)} title="Add employee">
        <NewEmployeeForm onDone={() => setOpen(false)} />
      </Modal>
      <Modal
        open={deptOpen}
        onClose={() => setDeptOpen(false)}
        title="Departments"
      >
        <DepartmentsManager />
      </Modal>
    </div>
  );
}

function NewEmployeeForm({ onDone }) {
  const qc = useQueryClient();
  const { isSuperAdmin, profile: me } = useAuth();
  const depts = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
  const [f, setF] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "employee",
    department_id: me?.department_id ?? "",
  });
  const m = useMutation({
    mutationFn: () =>
      createEmployee({ ...f, department_id: f.department_id || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["employee_performance"] });
      toast.success("Employee account created");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <Field label="Full name *" className="sm:col-span-2">
        <Input
          required
          value={f.full_name}
          onChange={(e) => setF({ ...f, full_name: e.target.value })}
        />
      </Field>
      <Field label="Email *">
        <Input
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
        />
      </Field>
      <Field
        label="Temporary password *"
        hint="Share it privately. They can change it in Settings → Password & security."
      >
        <TempPasswordInput
          value={f.password}
          onChange={(v) => setF({ ...f, password: v })}
        />
      </Field>
      <Field label="Role">
        <Select
          value={f.role}
          onChange={(e) => setF({ ...f, role: e.target.value })}
          options={(isSuperAdmin
            ? ["employee", "admin", "super_admin"]
            : ["employee", "admin"]
          ).map((r) => ({ value: r, label: label(r) }))}
        />
      </Field>
      <Field
        label="Department"
        className="sm:col-span-2"
        hint={
          !isSuperAdmin
            ? "Admins can only add people to their own department."
            : undefined
        }
      >
        <Select
          value={f.department_id}
          disabled={!isSuperAdmin}
          onChange={(e) => setF({ ...f, department_id: e.target.value })}
          options={(depts.data ?? []).map((d) => ({
            value: d.id,
            label: d.name,
          }))}
          placeholder="— None —"
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <button className="btn-primary" disabled={m.isPending}>
          {m.isPending && <Loader2 size={16} className="animate-spin" />}Create
          account
        </button>
      </div>
    </form>
  );
}

/** Random, easy-to-type temporary password, e.g. "Kite-Mango-48#". */
function generatePassword() {
  const words = [
    "Blue",
    "Kite",
    "Mango",
    "River",
    "Cloud",
    "Tiger",
    "Maple",
    "Coral",
    "Lotus",
    "Spark",
    "Ocean",
    "Amber",
    "Cedar",
    "Pearl",
    "Swift",
  ];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  const n = String(Math.floor(10 + Math.random() * 90));
  const sym = "!@#$%&*"[Math.floor(Math.random() * 7)];
  return `${pick()}-${pick()}-${n}${sym}`;
}
function TempPasswordInput({ value, onChange }) {
  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <PasswordInput
            required
            minLength={8}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button
          type="button"
          className="btn-secondary px-3"
          title="Generate a password"
          onClick={() => onChange(generatePassword())}
        >
          <RefreshCw size={15} />
        </button>
        <button
          type="button"
          className="btn-secondary px-3"
          title="Copy"
          disabled={!value}
          onClick={() =>
            navigator.clipboard?.writeText(value).then(
              () => toast.success("Password copied"),
              () => {},
            )
          }
        >
          <Copy size={15} />
        </button>
      </div>
      <PasswordStrength value={value} />
    </div>
  );
}

function EditPersonForm({ person, onDone }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    full_name: person.full_name ?? "",
    email: person.email ?? "",
    phone: person.phone ?? "",
  });
  const emailChanged = f.email.trim().toLowerCase() !== (person.email ?? "");
  const m = useMutation({
    mutationFn: () => {
      if (!f.full_name.trim()) throw new Error("Name is required.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()))
        throw new Error("Enter a valid email address.");
      return updateProfile(person.id, {
        full_name: f.full_name.trim(),
        phone: f.phone.trim() || null,
        ...(emailChanged ? { email: f.email.trim().toLowerCase() } : {}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["employee_performance"] });
      toast.success("Saved");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <Field label="Full name *" className="sm:col-span-2">
        <Input
          required
          value={f.full_name}
          onChange={(e) => setF({ ...f, full_name: e.target.value })}
          maxLength={80}
        />
      </Field>
      <Field label="Email (used to sign in) *">
        <Input
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          maxLength={120}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
          maxLength={30}
        />
      </Field>
      {emailChanged && (
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700 sm:col-span-2">
          {person.full_name.split(" ")[0]} will need to sign in with the new
          email. Their password stays the same.
        </p>
      )}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button className="btn-primary" disabled={m.isPending}>
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          Save changes
        </button>
      </div>
    </form>
  );
}

function ResetPasswordForm({ person, onDone }) {
  const [pw, setPw] = useState(() => generatePassword());
  const { score } = passwordScore(pw);
  const m = useMutation({
    mutationFn: () => resetUserPassword(person.id, pw),
    onSuccess: () => {
      toast.success(`Password changed for ${person.full_name}`);
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pw.length >= 8) m.mutate();
      }}
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-mist px-4 py-3">
        <Avatar name={person.full_name} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {person.full_name}
          </p>
          <p className="truncate text-xs text-slate-500">{person.email}</p>
        </div>
      </div>
      <Field label="New password">
        <TempPasswordInput value={pw} onChange={setPw} />
      </Field>
      <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
        {person.full_name.split(" ")[0]} will be signed out on all devices and
        must use this new password. Copy it and share it privately.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button
          className="btn-primary"
          disabled={m.isPending || pw.length < 8 || score < 2}
        >
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          Set new password
        </button>
      </div>
    </form>
  );
}

function DepartmentsManager() {
  const qc = useQueryClient();
  const depts = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });
  const [name, setName] = useState("");
  const m = useMutation({
    mutationFn: () => createDepartment(name.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setName("");
      toast.success("Department added");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <div>
      <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-mist-2">
        {(depts.data ?? []).map((d) => (
          <li key={d.id} className="px-3 py-2 text-sm">
            {d.name}
          </li>
        ))}
        {!depts.data?.length && (
          <li className="px-3 py-2 text-sm text-slate-400">
            No departments yet
          </li>
        )}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) m.mutate();
        }}
      >
        <Input
          placeholder="New department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn-primary" disabled={m.isPending}>
          Add
        </button>
      </form>
    </div>
  );
}
