import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { whatsappLink } from "@/content/company";
import { services } from "@/content/services";

const budgets = ["Under UGX 100M", "UGX 100M to 300M", "UGX 300M to 1B", "Over UGX 1B", "Not sure yet"];

type Form = { name: string; phone: string; service: string; location: string; budget: string; message: string };
const empty: Form = { name: "", phone: "", service: "", location: "", budget: "", message: "" };

/**
 * Collects an enquiry and hands it to WhatsApp, which is how SMK takes new work.
 * No data is stored by the website.
 */
const EnquiryForm = ({ defaultService = "" }: { defaultService?: string }) => {
  const [form, setForm] = useState<Form>({ ...empty, service: defaultService });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const set = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (form.phone.replace(/\D/g, "").length < 9) next.phone = "Enter a phone number we can call you on.";
    if (form.message.trim().length < 10) next.message = "Tell us a little about the project.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`enq-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    const serviceTitle = services.find((s) => s.slug === form.service)?.title ?? "Not sure yet";
    const lines = [
      "Hello SMK, I would like a quote.",
      "",
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Service: ${serviceTitle}`,
      form.location.trim() ? `Site location: ${form.location.trim()}` : null,
      form.budget ? `Budget: ${form.budget}` : null,
      "",
      form.message.trim(),
    ].filter((l): l is string => l !== null);
    const url = whatsappLink(lines.join("\n"));
    window.open(url, "_blank", "noopener,noreferrer");
    setSentUrl(url);
  };

  if (sentUrl) {
    return (
      <div className="border border-success/30 bg-success/5 p-8" role="status">
        <CheckCircle2 className="text-success" size={32} aria-hidden />
        <h3 className="text-display mt-4 text-3xl text-navy-dark">Your message is ready in WhatsApp</h3>
        <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
          Press send in WhatsApp to reach our team. We usually reply the same working day.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-[2px] bg-[#1FA855] hover:bg-[#188a45]">
            <a href={sentUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> Open WhatsApp again
            </a>
          </Button>
          <Button variant="outline" className="rounded-[2px]" onClick={() => { setForm(empty); setSentUrl(null); }}>
            Start a new enquiry
          </Button>
        </div>
      </div>
    );
  }

  const field = "h-12 rounded-[2px] border-input bg-white text-base";
  const err = (k: keyof Form) =>
    errors[k] ? (
      <p id={`enq-${k}-error`} className="text-sm font-medium text-destructive">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Form) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `enq-${k}-error` : undefined });

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="enq-name">Your name</Label>
        <Input id="enq-name" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} className={field} {...aria("name")} />
        {err("name")}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="enq-phone">Phone number</Label>
        <Input id="enq-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={(e) => set("phone")(e.target.value)} className={field} {...aria("phone")} />
        {err("phone")}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="enq-service">What do you need?</Label>
        <Select value={form.service || "__unsure"} onValueChange={(v) => set("service")(v === "__unsure" ? "" : v)}>
          <SelectTrigger id="enq-service" className={field}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.title}
              </SelectItem>
            ))}
            <SelectItem value="__unsure">Not sure yet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="enq-budget">
          Budget <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Select value={form.budget} onValueChange={set("budget")}>
          <SelectTrigger id="enq-budget" className={field}>
            <SelectValue placeholder="Choose a range" />
          </SelectTrigger>
          <SelectContent>
            {budgets.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="enq-location">
          Where is the site? <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="enq-location" placeholder="For example, Kira, Wakiso" value={form.location} onChange={(e) => set("location")(e.target.value)} className={field} />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="enq-message">About the project</Label>
        <Textarea
          id="enq-message"
          rows={5}
          placeholder="What you want to build, the size of the plot, and when you hope to start."
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          className="rounded-[2px] bg-white text-base"
          {...aria("message")}
        />
        {err("message")}
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" size="lg" className="h-[52px] rounded-[2px] bg-smk-red px-7 text-base font-semibold hover:bg-smk-red-dark">
          <MessageCircle /> Send enquiry on WhatsApp
        </Button>
        <p className="text-sm text-muted-foreground">Opens WhatsApp with your details filled in.</p>
      </div>
    </form>
  );
};

export default EnquiryForm;
