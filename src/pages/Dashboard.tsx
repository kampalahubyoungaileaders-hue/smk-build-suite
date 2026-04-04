import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FolderKanban, ListTodo, DollarSign, Users } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    budget: 0,
    team: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [projectsRes, tasksRes, budgetsRes, teamRes] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("project_tasks").select("*", { count: "exact", head: true }),
        supabase.from("project_budgets").select("estimated_amount"),
        supabase.from("team_members").select("*", { count: "exact", head: true }),
      ]);

      const totalBudget = budgetsRes.data?.reduce(
        (sum, b) => sum + Number(b.estimated_amount || 0),
        0
      ) || 0;

      setStats({
        projects: projectsRes.count || 0,
        tasks: tasksRes.count || 0,
        budget: totalBudget,
        team: teamRes.count || 0,
      });

      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentProjects(projects || []);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-primary" },
    { label: "Tasks", value: stats.tasks, icon: ListTodo, color: "text-accent" },
    { label: "Total Budget", value: `UGX ${stats.budget.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Team Members", value: stats.team, icon: Users, color: "text-accent" },
  ];

  const statusColors: Record<string, string> = {
    planning: "bg-muted text-muted-foreground",
    in_progress: "bg-accent/10 text-accent",
    on_hold: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <h2 className="font-bold text-foreground mb-4">Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet. Create your first project to get started.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium text-sm text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.location || "No location"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[p.status] || ""}`}>
                      {p.status?.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
