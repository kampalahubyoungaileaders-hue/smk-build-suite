import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";

const Team = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [membersRes, profilesRes] = await Promise.all([
        supabase.from("team_members").select("*, projects(name)"),
        supabase.from("profiles").select("*"),
      ]);
      setMembers(membersRes.data || []);
      setProfiles(profilesRes.data || []);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Team</h2>

        {profiles.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No team members yet. Users will appear here after signing up.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {(p.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{p.full_name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{p.phone || "No phone"}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-foreground mb-3">Project Assignments</h3>
            <div className="space-y-2">
              {members.map((m) => (
                <Card key={m.id} className="p-3 flex items-center justify-between">
                  <div className="text-sm text-foreground">{(m.projects as any)?.name}</div>
                  <span className="text-xs text-muted-foreground">{m.role}</span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Team;
