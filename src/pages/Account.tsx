import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Field, PageHeader, SectionCard, StatusBadge, describeError } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appRole } from "@/lib/status";

const Account = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Couldn't save your details", description: describeError(error.message), variant: "destructive" });
    else {
      toast({ title: "Details saved" });
      refreshProfile();
    }
  };

  const pwError = password && password.length < 8 ? "Use at least 8 characters." : confirm && password !== confirm ? "Passwords don't match." : "";

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwError || !password) return;
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPwSaving(false);
    if (error) toast({ title: "Couldn't change password", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Password changed" });
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <PageHeader title="Your account" description={user?.email} />

        <SectionCard title="Your details" action={<StatusBadge tone={appRole.tone(role)}>{appRole.label(role)}</StatusBadge>}>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Full name" htmlFor="acc-name" hint="Shown to colleagues on tasks, expenses and the team page.">
              <Input id="acc-name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Phone" htmlFor="acc-phone">
              <Input id="acc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" autoComplete="tel" />
            </Field>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save details"}</Button>
          </form>
        </SectionCard>

        <SectionCard title="Change password">
          <form onSubmit={changePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" htmlFor="acc-pw">
                <Input id="acc-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              </Field>
              <Field label="Confirm new password" htmlFor="acc-pw2">
                <Input id="acc-pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              </Field>
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <Button type="submit" variant="outline" disabled={pwSaving || !password || !!pwError || password !== confirm}>
              {pwSaving ? "Changing…" : "Change password"}
            </Button>
          </form>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
};

export default Account;
