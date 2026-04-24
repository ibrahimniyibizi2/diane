import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/store";
import { useSettings } from "@/lib/settings";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileBarChart, FileDown, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import { isToday, format } from "date-fns";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { buildDailyReportPDF, buildReportText } from "@/lib/pdf";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const t = useT();
  const services = useData((s) => s.services);
  const transactions = useData((s) => s.transactions);
  const workers = useData((s) => s.workers);
  const sales = useData((s) => s.sales);
  const products = useData((s) => s.products);
  const settings = useSettings();

  const todayServices = services.filter((s) => isToday(new Date(s.createdAt)));
  const income = transactions.filter((tx) => tx.type === "income" && isToday(new Date(tx.createdAt))).reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter((tx) => tx.type === "expense" && isToday(new Date(tx.createdAt))).reduce((a, b) => a + b.amount, 0);
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

  const text = () =>
    buildReportText({ settings, services, workers, transactions, sales, products });

  const filename = () => `${(settings.salonName || "salon").replace(/\s+/g, "-")}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  const exportPdf = () => {
    const doc = buildDailyReportPDF({ settings, services, workers, transactions, sales, products });
    doc.save(filename());
  };

  const sendEmail = () => {
    if (!settings.ownerEmail) {
      toast.error("Set the owner email in Settings first");
      return;
    }
    const subject = encodeURIComponent(`${settings.salonName} — Daily Report — ${format(new Date(), "MMM d, yyyy")}`);
    const body = encodeURIComponent(text());
    window.open(`mailto:${settings.ownerEmail}?subject=${subject}&body=${body}`);
  };

  const sendWhatsApp = () => {
    const num = settings.whatsappNumber.replace(/\D/g, "");
    if (!num) {
      toast.error("Set the WhatsApp number in Settings first");
      return;
    }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text())}`, "_blank");
  };

  const sendSMS = () => {
    if (!settings.smsNumber) {
      toast.error("Set the SMS number in Settings first");
      return;
    }
    // Opens device SMS composer; works on mobile + most desktops
    const body = encodeURIComponent(text());
    window.open(`sms:${settings.smsNumber}?body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("dailyReport")}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMM d, yyyy")} · {settings.salonName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={exportPdf}>
            <FileDown className="h-4 w-4" />PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={sendEmail}>
            <Mail className="h-4 w-4" />{t("sendEmail")}
          </Button>
          <Button className="gap-2 bg-success text-success-foreground hover:bg-success/90" onClick={sendWhatsApp}>
            <MessageCircle className="h-4 w-4" />{t("sendWhatsApp")}
          </Button>
          <Button variant="outline" className="gap-2" onClick={sendSMS}>
            <MessageSquare className="h-4 w-4" />SMS
          </Button>
          <Button asChild variant="ghost" size="icon" title="Settings">
            <Link to="/app/settings"><SettingsIcon className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {(!settings.ownerEmail || !settings.whatsappNumber || !settings.smsNumber) && (
        <Card className="p-4 border-dashed">
          <p className="text-sm">
            Set recipients in{" "}
            <Link to="/app/settings" className="text-primary underline">Settings</Link>{" "}
            to enable Email, WhatsApp and SMS sending.
          </p>
        </Card>
      )}

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
        <pre className="text-xs bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap font-mono">{text()}</pre>
      </Card>
    </div>
  );
}
