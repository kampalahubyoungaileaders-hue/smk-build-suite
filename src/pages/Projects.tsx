import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, MapPin, CalendarDays, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectFormDialog from "@/components/dashboard/ProjectFormDialog";
import { EmptyState, PageHeader, StatusBadge } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectStatus } from "@/lib/status";
import { formatDate, formatUGX, isOverdue } from "@/lib/format";

import type { Row } from "@/lib/db";

const Projects = () => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const open = params.get("new") === "1";
  const setOpen = (v: boolean) => setParams(v ? { new: "1" } : {}, { replace: true });

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return [p.name, p.client_name, p.location].some((v) => v?.toLowerCase().includes(q));
    });
  }, [projects, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <PageHeader
          title="Projects"
          description={loading ? "Loading…" : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
          actions={
            can.manageProjects && (
              <Button onClick={() => setOpen(true)}>
                <Plus /> New project
              </Button>
            )
          }
        />

        <ProjectFormDialog open={open && can.manageProjects} onOpenChange={setOpen} onSaved={(id) => navigate(`/dashboard/projects/${id}`)} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search by project, client or location"
              aria-label="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-card sm:w-48" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {projectStatus.list.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderKanban}
              title={projects.length ? "No projects match your search" : "No projects yet"}
              description={projects.length ? "Try a different name or clear the status filter." : "Create your first project to start tracking tasks, budget and spend."}
              action={
                projects.length ? (
                  <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); }}>Clear filters</Button>
                ) : (
                  can.manageProjects && <Button onClick={() => setOpen(true)}><Plus /> New project</Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const late = p.status !== "completed" && p.status !== "cancelled" && isOverdue(p.end_date);
              return (
                <Link key={p.id} to={`/dashboard/projects/${p.id}`} className="group rounded-lg">
                  <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-primary/40">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold leading-tight text-foreground group-hover:text-primary">{p.name}</h2>
                      <StatusBadge tone={projectStatus.tone(p.status)}>{projectStatus.label(p.status)}</StatusBadge>
                    </div>
                    {p.client_name && <p className="mt-1 text-sm text-muted-foreground">{p.client_name}</p>}
                    {p.description && <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{p.description}</p>}

                    <div className="mt-auto space-y-3 pt-5">
                      <div>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="tabular font-semibold text-foreground">{p.progress || 0}%</span>
                        </div>
                        <Progress value={p.progress || 0} className="h-1.5" />
                      </div>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-3 text-sm">
                        <dt className="sr-only">Budget</dt>
                        <dd className="tabular col-span-2 font-medium text-foreground">{p.budget > 0 ? formatUGX(p.budget) : "No budget set"}</dd>
                        {p.location && (
                          <>
                            <dt className="sr-only">Location</dt>
                            <dd className="flex min-w-0 items-center gap-1 text-muted-foreground">
                              <MapPin size={13} className="shrink-0" aria-hidden />
                              <span className="truncate">{p.location}</span>
                            </dd>
                          </>
                        )}
                        {p.end_date && (
                          <>
                            <dt className="sr-only">Target completion</dt>
                            <dd className={`flex items-center gap-1 ${late ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                              <CalendarDays size={13} className="shrink-0" aria-hidden />
                              {late ? "Late: " : ""}{formatDate(p.end_date)}
                            </dd>
                          </>
                        )}
                      </dl>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
