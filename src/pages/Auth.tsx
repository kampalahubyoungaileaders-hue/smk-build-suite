import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/brand/Logo";
import site5 from "@/assets/site-5.webp";

type Mode = "signin" | "signup" | "reset";

const friendly = (msg: string) => {
  if (/invalid login credentials/i.test(msg)) return "That email and password don't match. Check them and try again.";
  if (/email not confirmed/i.test(msg)) return "Confirm your email first. Check your inbox for the link we sent.";
  if (/already registered/i.test(msg)) return "An account with this email already exists. Sign in instead.";
  return msg;
};

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = "Staff sign in · SMK";
  }, []);

  useEffect(() => {
    setError("");
    setNotice("");
  }, [mode]);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMode("signin");
        setNotice("Account created. Confirm your email using the link we sent, then sign in. An administrator will need to give you access.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dashboard/account` });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  };

  const heading = { signin: "Staff sign in", signup: "Create a staff account", reset: "Reset your password" }[mode];
  const cta = { signin: "Sign in", signup: "Create account", reset: "Send reset link" }[mode];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col bg-card px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/"><Logo markClassName="h-10" /></Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Website
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-[34px] font-semibold leading-tight text-foreground">{heading}</h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "signup"
              ? "For SMK employees and contractors. You'll get access once an administrator approves your account."
              : mode === "reset"
                ? "Enter your work email and we'll send you a link."
                : "Projects, tasks and site finances for the SMK team."}
          </p>

          {notice && <div className="mt-6 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground" role="status">{notice}</div>}
          {error && <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground" role="alert">{error}</div>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required className="h-11" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="h-11" />
            </div>
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("reset")} className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={mode === "signup" ? 8 : undefined}
                    required
                    className="h-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === "signup" && <p className="text-xs text-muted-foreground">At least 8 characters.</p>}
              </div>
            )}
            <Button type="submit" disabled={busy} className="h-11 w-full bg-smk-red text-base font-semibold text-white hover:bg-smk-red-dark">
              {busy ? "Please wait…" : cta}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>New to the team? <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">Sign in</button></>
            )}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Looking for a quote? <Link to="/#contact" className="font-medium text-primary hover:underline">Contact SMK</Link></p>
      </div>

      <div className="relative hidden overflow-hidden bg-navy-dark lg:block">
        <img src={site5} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-md font-display text-4xl font-semibold leading-tight text-white">We deliver beyond your dream.</p>
          <p className="mt-2 text-white/80">SMK site team, Kampala</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
