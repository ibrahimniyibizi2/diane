import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangToggle } from "@/components/LangToggle";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Salon Manager" }] }),
  beforeLoad: () => {
    if (useAuth.getState().user) throw redirect({ to: "/app" });
  },
  component: LoginPage,
});

function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email || "owner@salon.com", password || "demo");
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute top-4 right-4 z-10"><LangToggle /></div>
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-card border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("loginSubtitle")}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@salon.com" />
          </div>
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading} style={{ background: "var(--gradient-primary)" }}>
            {loading ? "..." : t("login")}
          </Button>
          <p className="text-xs text-center text-muted-foreground">{t("demoLogin")}</p>
          <p className="text-sm text-center">
            {t("noAccount")} <Link to="/signup" className="text-primary font-medium hover:underline">{t("signup")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
