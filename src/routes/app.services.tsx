import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/store";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Scissors } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/services")({
  component: ServicesPage,
});

const SERVICE_TYPES = ["cut", "braid", "color", "wash"] as const;

function ServicesPage() {
  const t = useT();
  const services = useData((s) => s.services);
  const workers = useData((s) => s.workers);
  const addService = useData((s) => s.addService);
  const removeService = useData((s) => s.removeService);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    workerId: workers[0]?.id ?? "",
    serviceType: "cut",
    amountCharged: 0,
    paymentMethod: "cash" as const,
    materialCost: 0,
  });

  const worker = workers.find((w) => w.id === form.workerId);
  const previewCommission = worker ? Math.round((form.amountCharged * worker.commission) / 100) : 0;

  const submit = () => {
    if (!form.workerId || !form.amountCharged) return;
    addService({
      workerId: form.workerId,
      serviceType: t(form.serviceType as any),
      amountCharged: form.amountCharged,
      paymentMethod: form.paymentMethod,
      materialCost: form.materialCost,
    });
    setForm({ ...form, amountCharged: 0, materialCost: 0 });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("services")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}><Plus className="h-4 w-4" />{t("registerService")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("registerService")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("workers")}</Label>
                <Select value={form.workerId} onValueChange={(v) => setForm({ ...form, workerId: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("serviceType")}</Label>
                <Select value={form.serviceType} onValueChange={(v) => setForm({ ...form, serviceType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((s) => <SelectItem key={s} value={s}>{t(s as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("amountCharged")}</Label><Input type="number" value={form.amountCharged || ""} onChange={(e) => setForm({ ...form, amountCharged: Number(e.target.value) })} /></div>
              <div>
                <Label>{t("paymentMethod")}</Label>
                <Select value={form.paymentMethod} onValueChange={(v: any) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t("cashMethod")}</SelectItem>
                    <SelectItem value="mobile_money">{t("mobileMoney")}</SelectItem>
                    <SelectItem value="card">{t("card")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("materialCost")}</Label><Input type="number" value={form.materialCost || ""} onChange={(e) => setForm({ ...form, materialCost: Number(e.target.value) })} /></div>
              <div className="p-3 rounded-md bg-muted text-sm flex justify-between">
                <span>{t("commissionAmount")}</span>
                <span className="font-semibold text-primary">{formatRWF(previewCommission)}</span>
              </div>
              <Button onClick={submit} className="w-full">{t("save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {services.length === 0 ? (
          <Card className="p-12 text-center">
            <Scissors className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">—</p>
          </Card>
        ) : services.map((s) => {
          const w = workers.find((x) => x.id === s.workerId);
          return (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-accent)" }}>
                  <Scissors className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-medium">{s.serviceType}</div>
                  <div className="text-xs text-muted-foreground">{w?.name} · {format(new Date(s.createdAt), "MMM d, HH:mm")}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold">{formatRWF(s.amountCharged)}</div>
                  <Badge variant="outline" className="text-xs">+{formatRWF(s.commissionAmount)}</Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
