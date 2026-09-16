import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Pencil, Plus, ListTodo, Wallet, Receipt, Users, Check, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectFormDialog from "@/components/dashboard/ProjectFormDialog";
import { AssignMemberDialog, BudgetLineDialog, ExpenseDialog, TaskFormDialog } from "@/components/dashboard/forms";
import { ConfirmDelete, EmptyState, LoadingRows, StatCard, StatusBadge, describeError } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expenseStatus, projectStatus, taskPriority, taskStatus } from "@/lib/status";
import { daysUntil, formatDate, formatUGX, formatUGXCompact, initials, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Enums, Person, Row } from "@/lib/db";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Row | null>(null);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [budgets, setBudgets] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [team, setTeam] = useState<Row[]>([]);
  const [people, setPeople] = useState<Row[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Row | undefined>();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    const [p, t, b, e, tm, pr] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).maybeSingle(),
      supabase.from("project_tasks").select("*").eq("project_id", id).order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("project_budgets").select("*").eq("project_id", id).order("created_at"),
      supabase.from("expenses").select("*").eq("project_id", id).order("expense_date", { ascending: false }),
      supabase.from("team_members").select("*").eq("project_id", id),
      supabase.from("profiles").select("user_id, full_name, phone"),
    ]);
    setProject(p.data);
    setTasks(t.data ?? []);
    setBudgets(b.data ?? []);
    setExpenses(e.data ?? []);
    setTeam(tm.data ?? []);
    setPeople(pr.data ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const nameOf = (uid?: string | null) => people.find((p) => p.user_id === uid)?.full_name || "Unknown user";

  const mutate = async (op: PromiseLike<{ error: { message: string } | null }>, failTitle: string, okTitle?: string) => {
    const { error } = await op;
    if (error) toast({ title: failTitle, description: describeError(error.message), variant: "destructive" });
    else {
      if (okTitle) toast({ title: okTitle });
      fetchAll();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingRows rows={6} />
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <Card>
          <EmptyState
            title="Project not found"
            description="It may have been deleted, or the link is wrong."
            action={<Button asChild variant="outline"><Link to="/dashboard/projects">Back to projects</Link></Button>}
          />
        </Card>
      </DashboardLayout>
    );
  }

  const doneTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && isOverdue(t.due_date)).length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
  const plannedTotal = budgets.reduce((s, b) => s + Number(b.estimated_amount || 0), 0);
  const approvedSpend = expenses.filter((e) => e.status === "approved").reduce((s, e) => s + Number(e.amount || 0), 0);
  const pendingSpend = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + Number(e.amount || 0), 0);
  const budget = Number(project.budget || 0);
  const spendPct = budget ? Math.round((approvedSpend / budget) * 100) : 0;
  const daysLeft = project.end_date ? daysUntil(project.end_date) : null;
  const isOpen = project.status !== "completed" && project.status !== "cancelled";
  const assignable = people.filter((p) => !team.some((m) => m.user_id === p.user_id));
  const canEditTask = (t: Row) => can.manageTasks || t.assigned_to === user?.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link to="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Projects
          </Link>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[32px] font-semibold leading-tight text-foreground">{project.name}</h1>
                <StatusBadge tone={projectStatus.tone(project.status)}>{projectStatus.label(project.status)}</StatusBadge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {project.client_name && <span className="flex items-center gap-1"><User size={14} /> {project.client_name}</span>}
                {project.location && <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>}
              </p>
              {project.description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/80">{project.description}</p>}
            </div>
            {(can.manageProjects || can.deleteProjects) && (
              <div className="flex shrink-0 gap-2">
                {can.manageProjects && (
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Pencil /> Edit
                  </Button>
                )}
                {can.deleteProjects && (
                  <ConfirmDelete
                    title="Delete this project?"
                    description={`"${project.name}" and all of its tasks, budget lines, expenses, invoices and payments will be permanently deleted. This can't be undone.`}
                    confirmLabel="Delete project"
                    trigger={<Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive">Delete</Button>}
                    onConfirm={async () => {
                      const { error } = await supabase.from("projects").delete().eq("id", project.id);
                      if (error) toast({ title: "Couldn't delete project", description: describeError(error.message), variant: "destructive" });
                      else {
                        toast({ title: "Project deleted" });
                        navigate("/dashboard/projects");
                      }
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <ProjectFormDialog project={project} open={editOpen} onOpenChange={setEditOpen} onSaved={fetchAll} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Progress</div>
            <div className="tabular mt-1 font-display text-[28px] font-semibold leading-tight">{project.progress || 0}%</div>
            <Progress value={project.progress || 0} className="mt-2 h-1.5" />
          </Card>
          <StatCard
            label="Tasks done"
            value={`${doneTasks} / ${tasks.length}`}
            hint={overdueTasks ? `${overdueTasks} overdue` : blockedTasks ? `${blockedTasks} blocked` : "On track"}
            emphasis={overdueTasks || blockedTasks ? "danger" : undefined}
          />
          <Card className={cn("p-4", spendPct > 100 && "border-l-4 border-l-destructive")}>
            <div className="text-sm font-medium text-muted-foreground">Spent of budget</div>
            <div className="tabular mt-1 font-display text-[28px] font-semibold leading-tight">{budget ? `${spendPct}%` : "—"}</div>
            <div className="tabular mt-0.5 text-xs text-muted-foreground">
              {formatUGXCompact(approvedSpend)} of {budget ? formatUGXCompact(budget) : "no budget"}
            </div>
          </Card>
          <StatCard
            label="Target completion"
            value={project.end_date ? formatDate(project.end_date, { year: false }) : "Not set"}
            hint={
              daysLeft === null
                ? project.start_date ? `Started ${formatDate(project.start_date)}` : "Add dates in Edit"
                : !isOpen ? formatDate(project.end_date)
                : daysLeft < 0 ? `${-daysLeft} days late`
                : `${daysLeft} days left`
            }
            emphasis={isOpen && daysLeft !== null && daysLeft < 0 ? "danger" : undefined}
          />
        </div>

        <Tabs defaultValue="tasks">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="budget">Budget ({budgets.length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="team">Team ({team.length})</TabsTrigger>
          </TabsList>

          {/* Tasks */}
          <TabsContent value="tasks" className="mt-4 space-y-3">
            <TaskFormDialog
              open={taskOpen}
              onOpenChange={(v) => { setTaskOpen(v); if (!v) setEditingTask(undefined); }}
              task={editingTask}
              projectId={project.id}
              people={people as Person[]}
              onSaved={fetchAll}
            />
            {can.manageTasks && (
              <div className="flex justify-end">
                <Button onClick={() => { setEditingTask(undefined); setTaskOpen(true); }}><Plus /> Add task</Button>
              </div>
            )}
            {tasks.length === 0 ? (
              <Card><EmptyState icon={ListTodo} title="No tasks yet" description="Break the work into tasks with owners and due dates." /></Card>
            ) : (
              <Card className="divide-y">
                {tasks.map((t) => {
                  const late = t.status !== "completed" && isOverdue(t.due_date);
                  return (
                    <div key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className={cn("font-medium text-foreground", t.status === "completed" && "text-muted-foreground line-through")}>{t.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span>{t.assigned_to ? nameOf(t.assigned_to) : "Unassigned"}</span>
                          {t.due_date && <span className={cn(late && "font-medium text-destructive")}>{late ? "Overdue · " : "Due "}{formatDate(t.due_date, { year: false })}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={taskPriority.tone(t.priority)}>{taskPriority.label(t.priority)}</StatusBadge>
                        {canEditTask(t) ? (
                          <Select value={t.status} onValueChange={(v) => mutate(supabase.from("project_tasks").update({ status: v as Enums<"task_status"> }).eq("id", t.id), "Couldn't update task")}>
                            <SelectTrigger className="h-8 w-32 text-sm" aria-label={`Status of ${t.title}`}><SelectValue /></SelectTrigger>
                            <SelectContent>{taskStatus.list.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : (
                          <StatusBadge tone={taskStatus.tone(t.status)}>{taskStatus.label(t.status)}</StatusBadge>
                        )}
                        {can.manageTasks && (
                          <>
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${t.title}`} onClick={() => { setEditingTask(t); setTaskOpen(true); }}>
                              <Pencil size={15} />
                            </button>
                            <ConfirmDelete
                              title="Delete task?"
                              description={`"${t.title}" will be permanently removed.`}
                              onConfirm={() => mutate(supabase.from("project_tasks").delete().eq("id", t.id), "Couldn't delete task", "Task deleted")}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </TabsContent>

          {/* Budget */}
          <TabsContent value="budget" className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="tabular text-sm text-muted-foreground">
                Planned <span className="font-semibold text-foreground">{formatUGX(plannedTotal)}</span> of project budget{" "}
                <span className="font-semibold text-foreground">{formatUGX(budget)}</span>
                {budget > 0 && plannedTotal > budget && <span className="ml-2 font-medium text-destructive">Plan exceeds budget by {formatUGX(plannedTotal - budget)}</span>}
              </p>
              {can.manageBudgets && (
                <BudgetLineDialog open={budgetOpen} onOpenChange={setBudgetOpen} projectId={project.id} onSaved={fetchAll} trigger={<Button><Plus /> Add budget line</Button>} />
              )}
            </div>
            {budgets.length === 0 ? (
              <Card><EmptyState icon={Wallet} title="No budget lines" description="Split the budget into materials, labour, equipment and so on." /></Card>
            ) : (
              <Card className="overflow-x-auto">
                <table className="tabular w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 text-right font-medium">Planned</th>
                      <th className="px-4 py-3 text-right font-medium">Actual</th>
                      <th className="px-4 py-3 text-right font-medium">Difference</th>
                      {can.manageBudgets && <th className="w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {budgets.map((b) => {
                      const actual = Number(b.actual_amount || 0);
                      const diff = Number(b.estimated_amount) - actual;
                      return (
                        <tr key={b.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{b.category}</div>
                            {b.description && <div className="text-muted-foreground">{b.description}</div>}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">{formatUGX(b.estimated_amount)}</td>
                          <td className="px-4 py-3 text-right text-foreground">{actual ? formatUGX(actual) : <span className="text-muted-foreground">Not recorded</span>}</td>
                          <td className={cn("px-4 py-3 text-right font-medium", !actual ? "text-muted-foreground" : diff < 0 ? "text-destructive" : "text-success")}>
                            {!actual ? "—" : diff < 0 ? `${formatUGX(-diff)} over` : `${formatUGX(diff)} under`}
                          </td>
                          {can.manageBudgets && (
                            <td className="pr-2">
                              <ConfirmDelete title="Delete budget line?" description={`"${b.category}" will be removed from this project's budget.`} onConfirm={() => mutate(supabase.from("project_budgets").delete().eq("id", b.id), "Couldn't delete budget line")} />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </TabsContent>

          {/* Expenses */}
          <TabsContent value="expenses" className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="tabular text-sm text-muted-foreground">
                Approved <span className="font-semibold text-foreground">{formatUGX(approvedSpend)}</span>
                {pendingSpend > 0 && <> · awaiting approval <span className="font-semibold text-foreground">{formatUGX(pendingSpend)}</span></>}
              </p>
              {can.submitExpenses && (
                <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} projectId={project.id} onSaved={fetchAll} trigger={<Button><Plus /> Record expense</Button>} />
              )}
            </div>
            {expenses.length === 0 ? (
              <Card><EmptyState icon={Receipt} title="No expenses recorded" description="Site purchases submitted here go to a project manager for approval." /></Card>
            ) : (
              <Card className="divide-y">
                {expenses.map((e) => {
                  const ownExpense = e.submitted_by === user?.id && !can.isAdmin;
                  return (
                    <div key={e.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{e.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {[e.vendor, formatDate(e.expense_date), e.submitted_by && `by ${nameOf(e.submitted_by)}`].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular font-semibold text-foreground">{formatUGX(e.amount)}</span>
                        {e.status === "pending" && can.approveExpenses && !ownExpense ? (
                          <>
                            <Button size="sm" variant="outline" className="h-8 border-success/40 text-success hover:bg-success/10 hover:text-success" onClick={() => mutate(supabase.from("expenses").update({ status: "approved", approved_by: user?.id }).eq("id", e.id), "Couldn't approve expense", "Expense approved")}>
                              <Check /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => mutate(supabase.from("expenses").update({ status: "rejected", approved_by: user?.id }).eq("id", e.id), "Couldn't reject expense", "Expense rejected")}>
                              <X /> Reject
                            </Button>
                          </>
                        ) : (
                          <StatusBadge tone={expenseStatus.tone(e.status)}>{expenseStatus.label(e.status)}</StatusBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="mt-4 space-y-3">
            {can.manageTeam && (
              <div className="flex justify-end">
                <AssignMemberDialog open={assignOpen} onOpenChange={setAssignOpen} projectId={project.id} people={assignable as Person[]} onSaved={fetchAll} trigger={<Button disabled={!assignable.length}><Plus /> Add person</Button>} />
              </div>
            )}
            {team.length === 0 ? (
              <Card><EmptyState icon={Users} title="Nobody assigned yet" description="Add engineers, supervisors and contractors working on this site." /></Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {team.map((m) => {
                  const person = people.find((p) => p.user_id === m.user_id);
                  return (
                    <Card key={m.id} className="flex items-center gap-3 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(person?.full_name)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">{person?.full_name || "Unknown user"}</div>
                        <div className="truncate text-sm text-muted-foreground">{m.role}{person?.phone ? ` · ${person.phone}` : ""}</div>
                      </div>
                      {can.manageTeam && (
                        <ConfirmDelete title="Remove from project?" confirmLabel="Remove" description={`${person?.full_name || "This person"} will no longer be listed on this project.`} onConfirm={() => mutate(supabase.from("team_members").delete().eq("id", m.id), "Couldn't remove team member")} />
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
