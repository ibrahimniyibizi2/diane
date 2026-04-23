import { createFileRoute } from "@tanstack/react-router";
import { useData, type Worker } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Phone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/workers")({
  component: WorkersPage,
});

function WorkersPage() {
  const t = useT();
  const workers = useData((s) => s.workers);
  const addWorker = useData((s) => s.addWorker);
  const removeWorker = useData((s) => s.removeWorker);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Worker, "id" | "createdAt">>({
    name: "", phone: "", role: "barber", commission: 40, paymentType: "daily",
  });

  const submit = () => {
    if (!form.name) return;
    addWorker(form);
    setForm({ name: "", phone: "", role: "barber", commission: 40, paymentType: "daily" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("workers")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}><Plus className="h-4 w-4" />{t("addWorker")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("addWorker")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>{t("name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t("phone")}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div>
                <Label>{t("role")}</Label>
                <Select value={form.role} onValueChange={(v: Worker["role"]) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barber">{t("barber")}</SelectItem>
                    <SelectItem value="trancista">{t("trancista")}</SelectItem>
                    <SelectItem value="employee">{t("employee")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("commission")}</Label><Input type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: Number(e.target.value) })} /></div>
              <div>
                <Label>{t("paymentType")}</Label>
                <Select value={form.paymentType} onValueChange={(v: Worker["paymentType"]) => setForm({ ...form, paymentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("daily")}</SelectItem>
                    <SelectItem value="weekly">{t("weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={submit} className="w-full">{t("save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((w) => (
          <Card key={w.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{w.name}</div>
                  <Badge variant="secondary" className="mt-1">{t(w.role as any)}</Badge>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeWorker(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" />{w.phone || "—"}</div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("commission")}</span><span className="font-medium">{w.commission}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentType")}</span><span className="font-medium">{t(w.paymentType as any)}</span></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
