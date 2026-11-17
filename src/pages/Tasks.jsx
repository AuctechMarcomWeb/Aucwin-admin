import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteTask, getTasks, getProfiles, updateTask } from "@/lib/api";
import { errMsg } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { TASK_STATUSES, label } from "@/lib/types";
import {
  Badge,
  Empty,
  Modal,
  Select,
  Spinner,
  fmtDateTime,
  isOverdue,
} from "@/components/ui";
import { ModuleHeader } from "@/components/Layout";
import { TaskForm } from "@/components/forms";

export default function Tasks() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [assigned, setAssigned] = useState("");
  const q = useQuery({
    queryKey: ["tasks", "board", assigned],
    queryFn: () => getTasks({ assigned_to: assigned || undefined }),
  });
  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: isAdmin,
  });
  const [modal, setModal] = useState(null);
  const inval = () => qc.invalidateQueries({ queryKey: ["tasks"] });
  const move = useMutation({
    mutationFn: ({ id, status }) => updateTask(id, { status }),
    onSuccess: inval,
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      inval();
      toast.success("Deleted");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <div>
      <ModuleHeader
        moduleKey="tasks"
        title="Tasks"
        subtitle="Move cards with the status menu; done tasks stay for the record."
        actions={
          <>
            {isAdmin && (
              <Select
                className="w-48"
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
                options={(profiles.data ?? []).map((p) => ({
                  value: p.id,
                  label: p.full_name,
                }))}
                placeholder="All employees"
              />
            )}
            <button className="btn-primary" onClick={() => setModal("new")}>
              <Plus size={16} /> New task
            </button>
          </>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((st) => {
            const items = (q.data ?? []).filter((t) => t.status === st);
            return (
              <div key={st} className="rounded-xl bg-mist p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {label(st)}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <Empty title="Nothing here" />
                ) : (
                  <div className="space-y-2">
                    {items.map((t) => (
                      <div key={t.id} className="card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={clsx(
                              "text-sm font-medium",
                              st === "done"
                                ? "text-slate-400 line-through"
                                : "text-ink",
                            )}
                          >
                            {t.title}
                          </div>
                          <Badge value={t.priority} />
                        </div>
                        {t.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {t.description}
                          </p>
                        )}
                        <div className="mt-2 text-xs text-slate-500">
                          {t.due_at && (
                            <span
                              className={clsx(
                                st !== "done" &&
                                  isOverdue(t.due_at) &&
                                  "font-medium text-amber-600",
                              )}
                            >
                              {fmtDateTime(t.due_at)}
                            </span>
                          )}
                          {(t.lead || t.client) && (
                            <>
                              {" "}
                              ·{" "}
                              <Link
                                to={
                                  t.lead
                                    ? `/leads/${t.lead.id}`
                                    : `/clients/${t.client.id}`
                                }
                                className="hover:text-teal-700"
                              >
                                {t.lead?.name ?? t.client?.name}
                              </Link>
                            </>
                          )}
                          {t.assignee && <> · {t.assignee.full_name}</>}
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <Select
                            className="py-1 text-xs"
                            value={t.status}
                            onChange={(e) =>
                              move.mutate({ id: t.id, status: e.target.value })
                            }
                            options={TASK_STATUSES.map((s) => ({
                              value: s,
                              label: label(s),
                            }))}
                          />
                          <button
                            className="btn-ghost p-1.5"
                            onClick={() => setModal(t)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn-ghost p-1.5 text-amber-600"
                            onClick={() => del.mutate(t.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "new" ? "New task" : "Edit task"}
      >
        {modal && (
          <TaskForm
            task={modal === "new" ? undefined : modal}
            onDone={() => {
              setModal(null);
              inval();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
