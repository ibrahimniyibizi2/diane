import { createFileRoute } from "@tanstack/react-router";
import { useAuth, useData, type Shift } from "@/lib/store";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Square, Mail, MessageCircle, FileBarChart, ChevronDown, ChevronUp } from "lucide-react";
import { format, formatDistanceStrict } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const Route = createFileRoute("/app/shifts")({
  component: ShiftsPage,
});

function ShiftsPage() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const shifts = useData((s) => s.shifts);
  const services = useData((s) => s.services);
  const transactions = useData((s) => s.transactions);
  const workers = useData((s) => s.workers);
  const openShift = useData((s) => s.openShift);
  const closeShift = useData((s) => s.closeShift);
  const current = useData((s) => s.currentShift());
  const [expanded, setExpanded] = useState<string | null>(null);

  const buildShiftSummary = (shift: Shift) => {
    const sServices = services.filter((s) => s.shiftId === shift.id);
    const sTx = transactions.filter((tx) => tx.shiftId === shift.id);
    const income = sTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = sTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const profit = income - expense;
    const byWorker = workers
      .map((w) => {
        const ws = sServices.filter((s) => s.workerId === w.id);
        return {
          worker: w,
          count: ws.length,
          total: ws.reduce((a, b) => a + b.amountCharged, 0),
          commission: ws.reduce((a, b) => a + b.commissionAmount, 0),
        };
      })
      .filter((b) => b.count > 0);
    return { sServices, income, expense, profit, byWorker };
  };

  const buildText = (shift: Shift) => {
    const sum = buildShiftSummary(shift);
    const opened = format(new Date(shift.openedAt), "MMM d, HH:mm");
    const closed = shift.closedAt ? format(new Date(shift.closedAt), "MMM d, HH:mm") : "—";
    const lines = [
      `📊 ${t("shiftReport")}`,
      `${t("openedAt")}: ${opened}`,
      `${t("closedAt")}: ${closed}`,
      ``,
      `${t("totalServices")}: ${sum.sServices.length}`,
      `${t("totalEarned")}: ${formatRWF(sum.income)}`,
      `${t("totalSpent")}: ${formatRWF(sum.expense)}`,
      `${t("profit")}: ${formatRWF(sum.profit)}`,
      ``,
      `👥 ${t("byWorker")}:`,
      ...sum.byWorker.map((b) => `- ${b.worker.name}: ${b.count} → ${formatRWF(b.total)} (${t("commissionAmount")}: ${formatRWF(b.commission)})`),
    ];
    return lines.join("\n");
  };

  const sendEmail = (shift: Shift) => {
    const subject = encodeURIComponent(`${t("shiftReport")} — ${format(new Date(shift.openedAt), "MMM d")}`);
    const body = encodeURIComponent(buildText(shift));
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  const sendWhatsApp = (shift: Shift) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildText(shift))}`, "_blank");
  };

  const currentSum = current ? buildShiftSummary(current) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("shifts")}</h1>

      <Card className="p-6" style={{ background: current ? "var(--gradient-primary)" : undefined }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${current ? "bg-white/20" : "bg-muted"}`}>
              <Clock className={`h-7 w-7 ${current ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className={current ? "text-primary-foreground" : ""}>
              <div className="font-semibold text-lg">{current ? t("shiftOpen") : t("noShift")}</div>
              {current && <div className="text-sm opacity-80">{t("openedAt")}: {format(new Date(current.openedAt), "MMM d, HH:mm")}</div>}
            </div>
          </div>
          {current ? (
            <Button variant="secondary" className="gap-2" onClick={() => user && closeShift(user.id)}><Square className="h-4 w-4" />{t("closeShift")}</Button>
          ) : (
            <Button className="gap-2" onClick={() => user && openShift(user.id)} style={{ background: "var(--gradient-primary)" }}><Play className="h-4 w-4" />{t("openShift")}</Button>
          )}
        </div>
      </Card>

      {current && currentSum && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileBarChart className="h-5 w-5" />
            <h2 className="font-semibold">{t("shiftSummary")} (live)</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label={t("totalServices")} value={String(currentSum.sServices.length)} />
            <Stat label={t("totalEarned")} value={formatRWF(currentSum.income)} tone="success" />
            <Stat label={t("totalSpent")} value={formatRWF(currentSum.expense)} tone="destructive" />
            <Stat label={t("profit")} value={formatRWF(currentSum.profit)} tone="primary" />
          </div>
          {currentSum.byWorker.length > 0 && (
            <div className="mt-4 space-y-2">
              {currentSum.byWorker.map((b) => (
                <div key={b.worker.id} className="flex items-center justify-between p-3 rounded-md bg-muted/40 text-sm">
                  <span className="font-medium">{b.worker.name} <span className="text-muted-foreground">· {b.count}</span></span>
                  <span>{formatRWF(b.total)} <span className="text-primary">({formatRWF(b.commission)})</span></span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => sendEmail(current)}><Mail className="h-4 w-4" />{t("sendEmail")}</Button>
            <Button size="sm" className="gap-2 bg-success text-success-foreground hover:bg-success/90" onClick={() => sendWhatsApp(current)}><MessageCircle className="h-4 w-4" />{t("sendWhatsApp")}</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold">{t("history")}</h2>
        {shifts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">—</Card>
        ) : shifts.slice().reverse().map((s) => {
          const isOpen = expanded === s.id;
          const sum = buildShiftSummary(s);
          const dur = s.closedAt
            ? formatDistanceStrict(new Date(s.openedAt), new Date(s.closedAt))
            : formatDistanceStrict(new Date(s.openedAt), new Date());
          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-medium">{format(new Date(s.openedAt), "MMM d, yyyy")}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(s.openedAt), "HH:mm")} → {s.closedAt ? format(new Date(s.closedAt), "HH:mm") : "—"} · {dur}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.status === "open" ? "default" : "secondary"}>
                    {s.status === "open" ? t("shiftOpen") : t("shiftClosed")}
                  </Badge>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setExpanded(isOpen ? null : s.id)}>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isOpen ? t("hide") : t("viewReport")}
                  </Button>
                </div>
              </div>
              {isOpen && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Stat label={t("totalServices")} value={String(sum.sServices.length)} />
                    <Stat label={t("totalEarned")} value={formatRWF(sum.income)} tone="success" />
                    <Stat label={t("totalSpent")} value={formatRWF(sum.expense)} tone="destructive" />
                    <Stat label={t("profit")} value={formatRWF(sum.profit)} tone="primary" />
                  </div>
                  {sum.byWorker.length > 0 && (
                    <div className="space-y-1">
                      {sum.byWorker.map((b) => (
                        <div key={b.worker.id} className="flex items-center justify-between p-2 rounded bg-muted/40 text-xs">
                          <span>{b.worker.name} · {b.count}</span>
                          <span>{formatRWF(b.total)} <span className="text-primary">({formatRWF(b.commission)})</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => sendEmail(s)}><Mail className="h-4 w-4" />{t("sendEmail")}</Button>
                    <Button size="sm" className="gap-2 bg-success text-success-foreground hover:bg-success/90" onClick={() => sendWhatsApp(s)}><MessageCircle className="h-4 w-4" />{t("sendWhatsApp")}</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" | "primary" }) {
  const color =
    tone === "success" ? "text-success" :
    tone === "destructive" ? "text-destructive" :
    tone === "primary" ? "text-primary" : "";
  return (
    <div className="p-3 rounded-md bg-muted/40">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
