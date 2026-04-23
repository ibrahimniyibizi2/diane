import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth, useData } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Package,
  Wallet,
  Clock,
  FileBarChart,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppLayout() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentShift = useData((s) => s.currentShift());

  const items: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
    { to: "/app", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { to: "/app/services", label: t("services"), icon: Scissors },
    { to: "/app/workers", label: t("workers"), icon: Users },
    { to: "/app/products", label: t("products"), icon: Package },
    { to: "/app/cash", label: t("cash"), icon: Wallet },
    { to: "/app/shifts", label: t("shifts"), icon: Clock },
    { to: "/app/reports", label: t("reports"), icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6 border-b">
          <Link to="/app" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-foreground">Salon</div>
              <div className="text-xs text-muted-foreground">Manager</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-3 py-2 text-xs">
            <div className="font-medium text-foreground">{user?.name}</div>
            <div className="text-muted-foreground">{user?.email}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-card px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Salon</span>
          </div>
          <div className="flex items-center gap-2">
            {currentShift ? (
              <Badge className="bg-success text-success-foreground hover:bg-success">● {t("shiftOpen")}</Badge>
            ) : (
              <Badge variant="outline">{t("noShift")}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* mobile bottom nav */}
        <nav className="md:hidden order-last fixed bottom-0 inset-x-0 bg-card border-t flex justify-around py-2 z-40">
          {items.slice(0, 5).map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link key={it.to} to={it.to} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <it.icon className="h-5 w-5" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
