import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  createFollowUp,
  createLead,
  createTask,
  getProfiles,
  updateFollowUp,
  updateLead,
  updateTask,
} from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import {
  FOLLOWUP_TYPES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/lib/types";
import {
  Field,
  Input,
  Select,
  Textarea,
  enumOptions,
  fromLocalInput,
  toLocalInput,
} from "./ui";

/** Assignee dropdown. Employees only see themselves (RLS also forces assignment to self). */
export function AssigneeSelect({ value, onChange, allowEmpty }) {
  const { profile, isAdmin } = useAuth();
  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: isAdmin,
  });
  const options = isAdmin
    ? (profiles.data ?? [])
        .filter((p) => p.is_active)
        .map((p) => ({
          value: p.id,
          label: `${p.full_name}${p.department?.name ? ` · ${p.department.name}` : ""}`,
        }))
    : profile
      ? [{ value: profile.id, label: profile.full_name }]
      : [];
  return (
    <Select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      options={options}
      placeholder={allowEmpty ? "Unassigned (me)" : undefined}
      disabled={!isAdmin}
    />
  );
}

// ---------------- Lead form ----------------
export function LeadForm({ lead, onDone }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: lead?.name ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    company: lead?.company ?? "",
    address: lead?.address ?? "",
    source: lead?.source ?? "other",
    status: lead?.status ?? "new_lead",
    estimated_value: lead?.estimated_value ?? 0,
    notes: lead?.notes ?? "",
    assigned_to: lead?.assigned_to ?? null,
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const m = useMutation({
    mutationFn: async () => {
      const payload = {
        ...f,
        email: f.email || null,
        phone: f.phone || null,
        company: f.company || null,
        address: f.address || null,
        notes: f.notes || null,
        estimated_value: Number(f.estimated_value) || 0,
      };
      return lead ? updateLead(lead.id, payload) : createLead(payload);
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(lead ? "Lead updated" : "Lead created");
      onDone(saved);
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
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>
      <Field label="Phone">
        <Input
          type="tel"
          value={f.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+1 514 555 0100"
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={f.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
        />
      </Field>
      <Field label="Company">
        <Input
          value={f.company ?? ""}
          onChange={(e) => set("company", e.target.value)}
        />
      </Field>
      <Field label="Estimated value (CAD)">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={f.estimated_value ?? 0}
          onChange={(e) => set("estimated_value", e.target.value)}
        />
      </Field>
      <Field label="Address" className="sm:col-span-2">
        <Input
          value={f.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
        />
      </Field>
      <Field label="Source">
        <Select
          value={f.source}
          onChange={(e) => set("source", e.target.value)}
          options={enumOptions(LEAD_SOURCES)}
        />
      </Field>
      <Field label="Status">
        <Select
          value={f.status}
          onChange={(e) => set("status", e.target.value)}
          options={enumOptions(LEAD_STATUSES)}
        />
      </Field>
      <Field label="Assigned to" className="sm:col-span-2">
        <AssigneeSelect
          value={f.assigned_to}
          onChange={(v) => set("assigned_to", v)}
          allowEmpty
        />
      </Field>
      <Field label="Notes" className="sm:col-span-2">
        <Textarea
          value={f.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <button className="btn-primary" disabled={m.isPending}>
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          {lead ? "Save changes" : "Create lead"}
        </button>
      </div>
    </form>
  );
}

// ---------------- Follow-up / reminder / meeting form ----------------
export function FollowUpForm({
  followUp,
  leadId,
  clientId,
  fixedType,
  defaultDue,
  onDone,
}) {
  const qc = useQueryClient();
  const { isAdmin, profile } = useAuth();
  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: isAdmin,
  });
  const [f, setF] = useState({
    title: followUp?.title ?? "",
    type: followUp?.type ?? fixedType ?? "call",
    due_at: toLocalInput(followUp?.due_at ?? defaultDue),
    ends_at: followUp?.ends_at ? toLocalInput(followUp.ends_at) : "",
    location: followUp?.location ?? "",
    meeting_link: followUp?.meeting_link ?? "",
    notes: followUp?.notes ?? "",
    assigned_to: followUp?.assigned_to ?? null,
    attendees: followUp?.attendees ?? [],
  });
  const isMeeting = f.type === "meeting";
  const m = useMutation({
    mutationFn: async () => {
      const payload = {
        title: f.title,
        type: f.type,
        due_at: fromLocalInput(f.due_at),
        ends_at: isMeeting ? fromLocalInput(f.ends_at) : null,
        location: isMeeting ? f.location || null : null,
        meeting_link: isMeeting ? f.meeting_link || null : null,
        attendees: isMeeting ? f.attendees : [],
        notes: f.notes || null,
        assigned_to: f.assigned_to,
      };
      if (followUp) return updateFollowUp(followUp.id, payload);
      return createFollowUp({
        ...payload,
        lead_id: leadId ?? null,
        client_id: clientId ?? null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow_ups"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: ["module_counts"] });
      toast.success(
        followUp
          ? "Saved"
          : isMeeting
            ? "Meeting scheduled"
            : f.type === "reminder"
              ? "Reminder set"
              : "Follow-up scheduled",
      );
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const people = isAdmin
    ? (profiles.data ?? []).filter((p) => p.is_active)
    : profile
      ? [profile]
      : [];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Field label="Title *" className="sm:col-span-2">
        <Input
          required
          autoFocus
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          placeholder={
            isMeeting
              ? "e.g. Proposal walkthrough"
              : f.type === "reminder"
                ? "e.g. Renew licence"
                : "e.g. Call to discuss proposal"
          }
        />
      </Field>
      {!fixedType && (
        <Field label="Type">
          <Select
            value={f.type}
            onChange={(e) => setF({ ...f, type: e.target.value })}
            options={enumOptions(FOLLOWUP_TYPES)}
          />
        </Field>
      )}
      <Field label={isMeeting ? "Starts *" : "When *"}>
        <Input
          type="datetime-local"
          required
          value={f.due_at}
          onChange={(e) => setF({ ...f, due_at: e.target.value })}
        />
      </Field>
      {isMeeting && (
        <Field label="Ends">
          <Input
            type="datetime-local"
            value={f.ends_at}
            onChange={(e) => setF({ ...f, ends_at: e.target.value })}
          />
        </Field>
      )}
      {isMeeting && (
        <Field label="Location">
          <Input
            value={f.location}
            onChange={(e) => setF({ ...f, location: e.target.value })}
            placeholder="Office, Room B"
          />
        </Field>
      )}
      {isMeeting && (
        <Field label="Video link">
          <Input
            value={f.meeting_link}
            onChange={(e) => setF({ ...f, meeting_link: e.target.value })}
            placeholder="https://meet.google.com/…"
          />
        </Field>
      )}
      <Field label="Owner" className={isMeeting ? "" : "sm:col-span-2"}>
        <AssigneeSelect
          value={f.assigned_to}
          onChange={(v) => setF({ ...f, assigned_to: v })}
          allowEmpty
        />
      </Field>
      {isMeeting && people.length > 1 && (
        <Field label="Attendees" className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            {people.map((p) => {
              const on = f.attendees.includes(p.id);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() =>
                    setF({
                      ...f,
                      attendees: on
                        ? f.attendees.filter((x) => x !== p.id)
                        : [...f.attendees, p.id],
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-[13px] font-medium transition-colors ${on ? "border-orange-600 bg-orange-600 text-white" : "border-mist-3 bg-white text-slate-600 hover:border-orange-400"}`}
                >
                  {p.full_name}
                </button>
              );
            })}
          </div>
        </Field>
      )}
      <Field
        label={isMeeting ? "Agenda / notes" : "Notes"}
        className="sm:col-span-2"
      >
        <Textarea
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <button className="btn-primary" disabled={m.isPending}>
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          {followUp
            ? "Save"
            : isMeeting
              ? "Schedule meeting"
              : f.type === "reminder"
                ? "Set reminder"
                : "Schedule"}
        </button>
      </div>
    </form>
  );
}

// ---------------- Task form ----------------
export function TaskForm({ task, leadId, clientId, onDone }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    due_at: task?.due_at ? toLocalInput(task.due_at) : "",
    assigned_to: task?.assigned_to ?? null,
  });
  const m = useMutation({
    mutationFn: async () => {
      const payload = {
        title: f.title,
        description: f.description || null,
        status: f.status,
        priority: f.priority,
        due_at: fromLocalInput(f.due_at),
        assigned_to: f.assigned_to,
      };
      return task
        ? updateTask(task.id, payload)
        : createTask({
            ...payload,
            lead_id: leadId ?? null,
            client_id: clientId ?? null,
          });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(task ? "Task updated" : "Task created");
      onDone();
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
      <Field label="Title *" className="sm:col-span-2">
        <Input
          required
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
        />
      </Field>
      <Field label="Description" className="sm:col-span-2">
        <Textarea
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
        />
      </Field>
      <Field label="Status">
        <Select
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value })}
          options={enumOptions(TASK_STATUSES)}
        />
      </Field>
      <Field label="Priority">
        <Select
          value={f.priority}
          onChange={(e) => setF({ ...f, priority: e.target.value })}
          options={enumOptions(TASK_PRIORITIES)}
        />
      </Field>
      <Field label="Due">
        <Input
          type="datetime-local"
          value={f.due_at}
          onChange={(e) => setF({ ...f, due_at: e.target.value })}
        />
      </Field>
      <Field label="Assigned to">
        <AssigneeSelect
          value={f.assigned_to}
          onChange={(v) => setF({ ...f, assigned_to: v })}
          allowEmpty
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <button className="btn-primary" disabled={m.isPending}>
          {m.isPending && <Loader2 size={16} className="animate-spin" />}
          {task ? "Save" : "Create task"}
        </button>
      </div>
    </form>
  );
}
