import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import { Check, Pencil, Trash2, Phone } from "lucide-react";
import { deleteFollowUp, getFollowUps } from "@/lib/api";
import { errMsg } from "@/lib/http";
import {
  Badge,
  Empty,
  Modal,
  Spinner,
  fmtDateTime,
  isOverdue,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { FollowUpForm } from "@/components/forms";
import { CompleteFollowUpModal } from "@/components/panels";

const SCOPES = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "overdue", label: "Overdue" },
  { key: "done", label: "Completed" },
];

export default function FollowUps() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const scope = params.get("scope") ?? "upcoming";
  const q = useQuery({
    queryKey: ["follow_ups", "page", scope],
    queryFn: () => getFollowUps({ scope }),
  });
  const [edit, setEdit] = useState(null);
  const [complete, setComplete] = useState(null);
  const inval = () => {
    qc.invalidateQueries({ queryKey: ["follow_ups"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };
  const del = useMutation({
    mutationFn: deleteFollowUp,
    onSuccess: () => {
      inval();
      toast.success("Removed");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <div>
      <ModuleHeader
        moduleKey="leads"
        title="Follow-ups"
        subtitle="Every scheduled call, meeting and reminder tied to a lead or client."
      />
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-mist p-1 min-[400px]:grid-cols-4 sm:flex sm:w-fit">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            onClick={() => setParams({ scope: s.key })}
            className={clsx(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition sm:flex-1 sm:px-4 sm:text-sm",
              scope === s.key
                ? "bg-white text-ink shadow-ring"
                : "text-slate-600 hover:text-ink",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {q.isLoading ? (
          <Spinner />
        ) : !q.data?.length ? (
          <Empty
            title={`No ${scope} follow-ups`}
            hint="Schedule follow-ups from a lead or client page."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {q.data.map((f) => {
              const overdue = f.status === "pending" && isOverdue(f.due_at);
              const contact = f.lead ?? f.client;
              const to = f.lead_id
                ? `/leads/${f.lead_id}`
                : `/clients/${f.client_id}`;
              return (
                <li
                  key={f.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div
                    className={clsx(
                      "w-36 shrink-0 text-sm",
                      overdue ? "font-medium text-amber-600" : "text-slate-600",
                    )}
                  >
                    {fmtDateTime(f.due_at)}
                    {overdue && <div className="text-xs">Overdue</div>}
                  </div>
                  <Badge value={f.type} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">
                      {f.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      <Link to={to} className="hover:text-teal-700">
                        {contact?.name}
                      </Link>
                      {contact?.phone && ` · ${contact.phone}`}
                      {f.assignee && ` · ${f.assignee.full_name}`}
                    </div>
                    {f.outcome && (
                      <div className="mt-0.5 text-xs text-slate-600">
                        Outcome: {f.outcome}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {contact?.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="btn-ghost p-1.5"
                        title="Call"
                      >
                        <Phone size={15} />
                      </a>
                    )}
                    {f.status === "pending" && (
                      <button
                        className="btn-ghost p-1.5 text-moss-600"
                        title="Complete"
                        onClick={() => setComplete(f)}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      className="btn-ghost p-1.5"
                      onClick={() => setEdit(f)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-ghost p-1.5 text-amber-600"
                      onClick={() => del.mutate(f.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit follow-up">
        {edit && (
          <FollowUpForm
            followUp={edit}
            onDone={() => {
              setEdit(null);
              inval();
            }}
          />
        )}
      </Modal>
      <CompleteFollowUpModal
        followUp={complete}
        onClose={() => setComplete(null)}
        onDone={inval}
      />
    </div>
  );
}
