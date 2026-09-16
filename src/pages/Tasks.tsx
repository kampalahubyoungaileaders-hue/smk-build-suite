import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, LayoutGrid, List, CalendarDays, Pencil, ListTodo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { TaskFormDialog } from "@/components/dashboard/forms";
import { ConfirmDelete, EmptyState, LoadingRows, PageHeader, StatusBadge, describeError } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { taskPriority, taskStatus } from "@/lib/status";
import { formatDate, initials, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Enums, Option, Person, Row } from "@/lib/db";

const COLUMN_ACCENT: Record<string, string> = {
  todo: "border-t-slate-400",
  in_progress: "border-t-blue-600",
  blocked: "border-t-red-600",
  completed: "border-t-emerald-600",
};

const PRIORITY_ORDER = ["critical", "high", "medium", "low"];

const Tasks = () => {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [people, setPeople] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [view, setView] = useState<"board" | "list">(() => (typeof window !== "undefined" && window.innerWidth < 768 ? "list" : "board"));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Row | undefined>();

  const fetchData = useCallback(async () => {
    const [t, p, pr] = await Promise.all([
      supabase.from("project_tasks").select("*, projects(name)").order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("projects").select("id, name").order("name"),
      supabase.from("profiles").select("user_id, full_name").order("full_name"),
    ]);
    setTasks(t.data ?? []);
    setProjects(p.data ?? []);
    setPeople(pr.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nameOf = (uid?: string | null) => people.find((p) => p.user_id === uid)?.full_name || "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (projectFilter !== "all" && t.project_id !== projectFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (assigneeFilter === "me" && t.assigned_to !== user?.id) return false;
        if (assigneeFilter === "none" && t.assigned_to) return false;
        if (q && !t.title?.toLowerCase().includes(q) && !t.projects?.name?.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const ao = isOverdue(a.due_date) && a.status !== "completed" ? 0 : 1;
        const bo = isOverdue(b.due_date) && b.status !== "completed" ? 0 : 1;
        if (ao !== bo) return ao - bo;
        return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
      });
  }, [tasks, search, projectFilter, priorityFilter, assigneeFilter, user?.id]);

  const changeStatus = async (id: string, status: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const { error } = await supabase.from("project_tasks").update({ status: status as Enums<"task_status"> }).eq("id", id);
    if (error) {
      toast({ title: "Couldn't update task", description: describeError(error.message), variant: "destructive" });
      fetchData();
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("project_tasks").delete().eq("id", id);
    if (error) toast({ title: "Couldn't delete task", description: describeError(error.message), variant: "destructive" });
    else fetchData();
  };

  const canEdit = (t: Row) => can.manageTasks || t.assigned_to === user?.id;
  const openCount = tasks.filter((t) => t.status !== "completed").length;
  const filtersActive = search || projectFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all";

  const TaskMeta = ({ t }: { t: Row }) => {
    const late = t.status !== "completed" && isOverdue(t.due_date);
    return (
      <>
        {t.due_date && (
          <span className={cn("flex items-center gap-1", late ? "font-medium text-destructive" : "text-muted-foreground")}>
            <CalendarDays size={13} aria-hidden />
            {late && "Overdue · "}
            {formatDate(t.due_date, { year: false })}
          </span>
        )}
      </>
    );
  };

  const Actions = ({ t }: { t: Row }) =>
    can.manageTasks ? (
      <div className="flex items-center">
        <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${t.title}`} onClick={() => { setEditing(t); setDialogOpen(true); }}>
          <Pencil size={14} />
        </button>
        <ConfirmDelete title="Delete task?" description={`"${t.title}" will be permanently removed.`} onConfirm={() => remove(t.id)} />
      </div>
    ) : null;

  const StatusControl = ({ t, className }: { t: Row; className?: string }) =>
    canEdit(t) ? (
      <Select value={t.status} onValueChange={(v) => changeStatus(t.id, v)}>
        <SelectTrigger className={cn("h-8 text-sm", className)} aria-label={`Status of ${t.title}`}><SelectValue /></SelectTrigger>
        <SelectContent>{taskStatus.list.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
      </Select>
    ) : (
      <StatusBadge tone={taskStatus.tone(t.status)}>{taskStatus.label(t.status)}</StatusBadge>
    );

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <PageHeader
          title="Tasks"
          description={loading ? "Loading…" : `${openCount} open across ${projects.length} project${projects.length === 1 ? "" : "s"}`}
          actions={
            <>
              <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "board" | "list")} className="rounded-md border bg-card p-0.5">
                <ToggleGroupItem value="board" aria-label="Board view" className="h-8 px-2.5"><LayoutGrid size={16} /></ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" className="h-8 px-2.5"><List size={16} /></ToggleGroupItem>
              </ToggleGroup>
              {can.manageTasks && (
                <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} disabled={!projects.length}>
                  <Plus /> New task
                </Button>
              )}
            </>
          }
        />

        <TaskFormDialog
          open={dialogOpen}
          onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(undefined); }}
          task={editing}
          projects={projects as Option[]}
          people={people as Person[]}
          onSaved={fetchData}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input placeholder="Search tasks or projects" aria-label="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-card pl-9" />
          </div>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="bg-card lg:w-40" aria-label="Filter by assignee"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="me">Assigned to me</SelectItem>
              <SelectItem value="none">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="bg-card lg:w-48" aria-label="Filter by project"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-card lg:w-40" aria-label="Filter by priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any priority</SelectItem>
              {taskPriority.list.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <LoadingRows rows={5} />
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={ListTodo}
              title={tasks.length ? "No tasks match these filters" : "No tasks yet"}
              description={tasks.length ? undefined : projects.length ? "Add tasks to track who is doing what, and by when." : "Create a project first, then add its tasks."}
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={() => { setSearch(""); setProjectFilter("all"); setPriorityFilter("all"); setAssigneeFilter("all"); }}>Clear filters</Button>
                ) : !projects.length && can.manageProjects ? (
                  <Button asChild><Link to="/dashboard/projects?new=1">Create a project</Link></Button>
                ) : undefined
              }
            />
          </Card>
        ) : view === "board" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {taskStatus.list.map((col) => {
              const colTasks = filtered.filter((t) => t.status === col.value);
              return (
                <section key={col.value} className={cn("rounded-lg border border-t-4 bg-muted/50 p-3", COLUMN_ACCENT[col.value])} aria-label={col.label}>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-lg font-semibold text-foreground">{col.label}</h2>
                    <span className="tabular rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-foreground">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.length === 0 && <p className="px-1 py-6 text-center text-sm text-muted-foreground">Nothing here</p>}
                    {colTasks.map((t) => (
                      <Card key={t.id} className="space-y-2.5 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium leading-snug text-foreground">{t.title}</div>
                            <Link to={`/dashboard/projects/${t.project_id}`} className="block truncate text-sm text-muted-foreground hover:text-primary hover:underline">
                              {t.projects?.name}
                            </Link>
                          </div>
                          <Actions t={t} />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <StatusBadge tone={taskPriority.tone(t.priority)}>{taskPriority.label(t.priority)}</StatusBadge>
                          <TaskMeta t={t} />
                        </div>
                        <div className="flex items-center gap-2">
                          {t.assigned_to ? (
                            <span title={nameOf(t.assigned_to)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                              {initials(nameOf(t.assigned_to))}
                            </span>
                          ) : (
                            <span title="Unassigned" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed text-[11px] text-muted-foreground">?</span>
                          )}
                          <StatusControl t={t} className="flex-1" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <Card className="divide-y">
            {filtered.map((t) => (
              <div key={t.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className={cn("font-medium text-foreground", t.status === "completed" && "text-muted-foreground line-through")}>{t.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <Link to={`/dashboard/projects/${t.project_id}`} className="text-muted-foreground hover:text-primary hover:underline">{t.projects?.name}</Link>
                    <span className="text-muted-foreground">{t.assigned_to ? nameOf(t.assigned_to) : "Unassigned"}</span>
                    <TaskMeta t={t} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={taskPriority.tone(t.priority)}>{taskPriority.label(t.priority)}</StatusBadge>
                  <StatusControl t={t} className="w-32" />
                  <Actions t={t} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
