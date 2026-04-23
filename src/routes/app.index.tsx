import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/store";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Scissors, Wallet, Users, TrendingUp } from "lucide-react";
import { startOfDay, isToday, format, subDays, isSameDay } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const t = useT();
  const services = useData((s) => s.services);
  const transactions = useData((s) => s.transactions);
  const workers = useData((s) => s.workers);

  const today = startOfDay(new Date());
  const todayServices = services.filter((s) => isToday(new Date(s.createdAt)));
  const todayIncome = transactions.filter((tx) => tx.type === "income" && isToday(new Date(tx.createdAt))).reduce((a, b) => a + b.amount, 0);

  const trend = Array.from({ length: 7 }).map((_, i) => {
    const day = subDays(today, 6 - i);
    const total = transactions
      .filter((tx) => tx.type === "income" && isSameDay(new Date(tx.createdAt), day))
      .reduce((a, b) => a + b.amount, 0);
    return { day: format(day, "EEE"), total };
  });

  const stats = [
    { label: t("todayEarnings"), value: formatRWF(todayIncome), icon: Wallet, color: "var(--gradient-primary)" },
    { label: t("todayServices"), value: String(todayServices.length), icon: Scissors, color: "var(--gradient-accent)" },
    { label: t("activeWorkers"), value: String(workers.length), icon: Users, color: "var(--gradient-primary)" },
    { label: t("weeklyTrend"), value: formatRWF(trend.reduce((a, b) => a + b.total, 0)), icon: TrendingUp, color: "var(--gradient-accent)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{format(new Date(), "EEEE, MMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 overflow-hidden relative">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3" style={{ background: s.color }}>
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">{t("weeklyTrend")}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.45 0.15 25)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.45 0.15 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 60)" />
              <XAxis dataKey="day" stroke="oklch(0.5 0.03 40)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.03 40)" fontSize={12} />
              <Tooltip formatter={(v: number) => formatRWF(v)} />
              <Area type="monotone" dataKey="total" stroke="oklch(0.45 0.15 25)" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">{t("recentServices")}</h2>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <div className="space-y-2">
            {services.slice(0, 5).map((s) => {
              const w = workers.find((x) => x.id === s.workerId);
              return (
                <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{s.serviceType}</div>
                    <div className="text-xs text-muted-foreground">{w?.name} · {format(new Date(s.createdAt), "HH:mm")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatRWF(s.amountCharged)}</div>
                    <div className="text-xs text-success">+{formatRWF(s.commissionAmount)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
