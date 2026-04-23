import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/store";
import { useT, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LangToggle } from "@/components/LangToggle";
import { Sparkles, Scissors, Users, Wallet, FileBarChart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Salon Manager — Manage your salon with ease" },
      { name: "description", content: "All-in-one salon management: workers, services, cash register, shifts and daily reports." },
      { property: "og:title", content: "Salon Manager" },
      { property: "og:description", content: "All-in-one salon management for hair salons and barbershops." },
    ],
  }),
  beforeLoad: () => {
    if (useAuth.getState().user) throw redirect({ to: "/app" });
  },
  component: Landing,
});

function Landing() {
  const t = useT();
  const lang = useI18n((s) => s.lang);
  const features = [
    { icon: Scissors, title: t("services"), desc: { en: "Track every service & auto-calc commission", rw: "Andika serivisi & ubare komisiyo" }},
    { icon: Users, title: t("workers"), desc: { en: "Manage staff & payment types", rw: "Yobora abakozi & uburyo bw'ubwishyu" }},
    { icon: Wallet, title: t("cash"), desc: { en: "Income & expenses in one place", rw: "Amafaranga yose ahantu hamwe" }},
    { icon: FileBarChart, title: t("reports"), desc: { en: "Daily reports via Email/WhatsApp", rw: "Raporo ku Email/WhatsApp" }},
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Salon Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <Button asChild variant="ghost"><Link to="/login">{t("login")}</Link></Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
            {t("appName")}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">{t("tagline")}</p>
        <div className="flex gap-3 justify-center">
          <Button asChild size="lg" className="gap-2" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}>
            <Link to="/login">{t("login")} →</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="p-6 rounded-xl bg-card border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--gradient-accent)" }}>
              <f.icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{useT()("appName") === "Salon Manager" ? f.desc.en : f.desc.rw}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
