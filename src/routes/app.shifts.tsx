import { createFileRoute } from "@tanstack/react-router";
import { useAuth, useData } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/shifts")({
  component: ShiftsPage,
});

function ShiftsPage() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const shifts = useData((s) => s.shifts);
  const openShift = useData((s) => s.openShift);
  const closeShift = useData((s) => s.closeShift);
  const current = useData((s) => s.currentShift());

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

      <div className="space-y-2">
        <h2 className="font-semibold">History</h2>
        {shifts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">—</Card>
        ) : shifts.slice().reverse().map((s) => (
          <Card key={s.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{format(new Date(s.openedAt), "MMM d, yyyy")}</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(s.openedAt), "HH:mm")} → {s.closedAt ? format(new Date(s.closedAt), "HH:mm") : "—"}
              </div>
            </div>
            <Badge variant={s.status === "open" ? "default" : "secondary"}>{s.status === "open" ? t("shiftOpen") : t("shiftClosed")}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
