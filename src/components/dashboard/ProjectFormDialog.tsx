import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, describeError } from "@/components/dashboard/ui";
import { projectStatus } from "@/lib/status";

import type { Enums, Row } from "@/lib/db";

const empty = { name: "", description: "", client_name: "", location: "", budget: "", status: "planning", progress: "0", start_date: "", end_date: "" };

interface Props {
  project?: Row;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (id: string) => void;
  trigger?: ReactNode;
}

const ProjectFormDialog = ({ project, open, onOpenChange, onSaved, trigger }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const editing = !!project;

  useEffect(() => {
    if (!open) return;
    setForm(
      project
        ? {
            name: project.name ?? "",
            description: project.description ?? "",
            client_name: project.client_name ?? "",
            location: project.location ?? "",
            budget: String(project.budget ?? ""),
            status: project.status ?? "planning",
            progress: String(project.progress ?? 0),
            start_date: project.start_date ?? "",
            end_date: project.end_date ?? "",
          }
        : empty,
    );
  }, [open, project]);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const dateError = form.start_date && form.end_date && form.end_date < form.start_date;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;
    setSaving(true);
    const progress = Math.min(100, Math.max(0, Math.round(Number(form.progress) || 0)));
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      client_name: form.client_name.trim() || null,
      location: form.location.trim() || null,
      budget: Math.max(0, Number(form.budget) || 0),
      status: form.status as Enums<"project_status">,
      progress: form.status === "completed" ? 100 : progress,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    const res = editing
      ? await supabase.from("projects").update(payload).eq("id", project!.id).select("id").single()
      : await supabase.from("projects").insert({ ...payload, created_by: user?.id }).select("id").single();
    setSaving(false);
    if (res.error) {
      toast({ title: editing ? "Couldn't save project" : "Couldn't create project", description: describeError(res.error.message), variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Project saved" : "Project created" });
    onOpenChange(false);
    onSaved(res.data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{editing ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Project name" htmlFor="p-name" required>
            <Input id="p-name" value={form.name} onChange={set("name")} required placeholder="e.g. Kira residential block, phase 2" />
          </Field>
          <Field label="Scope" htmlFor="p-desc">
            <Textarea id="p-desc" value={form.description} onChange={set("description")} rows={3} placeholder="What is being built or delivered" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" htmlFor="p-client">
              <Input id="p-client" value={form.client_name} onChange={set("client_name")} />
            </Field>
            <Field label="Location" htmlFor="p-loc">
              <Input id="p-loc" value={form.location} onChange={set("location")} placeholder="e.g. Ntinda, Kampala" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Budget (UGX)" htmlFor="p-budget">
              <Input id="p-budget" type="number" inputMode="numeric" min={0} step="any" value={form.budget} onChange={set("budget")} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projectStatus.list.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Progress (%)" htmlFor="p-progress">
              <Input id="p-progress" type="number" min={0} max={100} value={form.status === "completed" ? "100" : form.progress} disabled={form.status === "completed"} onChange={set("progress")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="p-start">
              <Input id="p-start" type="date" value={form.start_date} onChange={set("start_date")} />
            </Field>
            <Field label="Target completion" htmlFor="p-end">
              <Input id="p-end" type="date" value={form.end_date} min={form.start_date || undefined} onChange={set("end_date")} aria-invalid={!!dateError} />
              {dateError && <p className="text-xs text-destructive">Completion date must be after the start date.</p>}
            </Field>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim() || !!dateError}>
              {saving ? "Saving…" : editing ? "Save project" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
