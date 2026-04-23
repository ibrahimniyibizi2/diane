import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/store";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileBarChart } from "lucide-react";
import { isToday, format } from "date-fns";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const t = useT();
  const services = useData((s) => s.services);
  const transactions = useData((s) => s.transactions);
  const workers = useData((s) => s.workers);

  const todayServices = services.filter((s) => isToday(new Date(s.createdAt)));
  const income = transactions.filter((t) => t.type === "income" && isToday(new Date(t.createdAt))).reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense" && isToday(new Date(t.createdAt))).reduce((a, b) => a + b.amount, 0);
  const profit = income - expense;

  const byWorker = workers.map((w) => {
    const ws = todayServices.filter((s) => s.workerId === w.id);
    return {
      worker: w,
      count: ws.length,
      total: ws.reduce((a, b) => a + b.amountCharged, 0),
      commission: ws.reduce((a, b) => a + b.commissionAmount, 0),
    };
  });

  const buildText = () => {
    const lines = [
      `📊 ${t("dailyReport")} — ${format(new Date(), "MMM d, yyyy")}`,
      ``,
      `${t("totalServices")}: ${todayServices.length}`,
      `${t("totalEarned")}: ${formatRWF(income)}`,
      `${t("totalSpent")}: ${formatRWF(expense)}`,
      `${t("profit")}: ${formatRWF(profit)}`,
      ``,
      `👥 ${t("byWorker")}:`,
      ...byWorker.map((b) => `- ${b.worker.name}: ${b.count} → ${formatRWF(b.total)} (${t("commissionAmount")}: ${formatRWF(b.commission)})`),
    ];
    return lines.join("\n");
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`${t("dailyReport")} — ${format(new Date(), "MMM d, yyyy")}`);
    const body = encodeURIComponent(buildText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  const sendWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("dailyReport")}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={sendEmail}><Mail className="h-4 w-4" />{t("sendEmail")}</Button>
          <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90" onClick={sendWhatsApp}><MessageCircle className="h-4 w-4" />{t("sendWhatsApp")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-xs text-muted-foreground">{t("totalServices")}</div><div className="text-2xl font-bold">{todayServices.length}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground">{t("totalEarned")}</div><div className="text-2xl font-bold text-success">{formatRWF(income)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground">{t("totalSpent")}</div><div className="text-2xl font-bold text-destructive">{formatRWF(expense)}</div></Card>
        <Card className="p-5" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-xs text-primary-foreground/80">{t("profit")}</div>
          <div className="text-2xl font-bold text-primary-foreground">{formatRWF(profit)}</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileBarChart className="h-5 w-5" />
          <h2 className="font-semibold">{t("byWorker")}</h2>
        </div>
        {byWorker.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <div className="space-y-2">
            {byWorker.map((b) => (
              <div key={b.worker.id} className="flex items-center justify-between p-3 rounded-md bg-muted/40">
                <div>
                  <div className="font-medium">{b.worker.name}</div>
                  <div className="text-xs text-muted-foreground">{b.count} {t("services")}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatRWF(b.total)}</div>
                  <div className="text-xs text-primary">{t("commissionAmount")}: {formatRWF(b.commission)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Preview</h2>
        <pre className="text-xs bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap font-mono">{buildText()}</pre>
      </Card>
    </div>
  );
}
