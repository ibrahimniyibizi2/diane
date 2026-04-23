import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/store";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export const Route = createFileRoute("/app/cash")({
  component: CashPage,
});

function CashPage() {
  const t = useT();
  const transactions = useData((s) => s.transactions);
  const addTransaction = useData((s) => s.addTransaction);
  const removeTransaction = useData((s) => s.removeTransaction);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "income" as "income" | "expense", category: "service", amount: 0, description: "" });

  const income = transactions.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const submit = () => {
    if (!form.amount) return;
    addTransaction(form);
    setForm({ type: "income", category: "service", amount: 0, description: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("cash")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}><Plus className="h-4 w-4" />{t("addTransaction")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("addTransaction")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t("income")}</SelectItem>
                    <SelectItem value="expense">{t("expense")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("category")}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="salary, electricity, water..." /></div>
              <div><Label>{t("amount")}</Label><Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div><Label>{t("description")}</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={submit} className="w-full">{t("save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground mb-1">{t("income")}</div>
          <div className="text-2xl font-bold text-success">{formatRWF(income)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground mb-1">{t("expense")}</div>
          <div className="text-2xl font-bold text-destructive">{formatRWF(expense)}</div>
        </Card>
        <Card className="p-5" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-xs text-primary-foreground/80 mb-1">{t("balance")}</div>
          <div className="text-2xl font-bold text-primary-foreground">{formatRWF(balance)}</div>
        </Card>
      </div>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">—</Card>
        ) : transactions.map((tx) => (
          <Card key={tx.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {tx.type === "income" ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-medium">{tx.description || tx.category}</div>
                <div className="text-xs text-muted-foreground">{tx.category} · {format(new Date(tx.createdAt), "MMM d, HH:mm")}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`font-bold ${tx.type === "income" ? "text-success" : "text-destructive"}`}>
                {tx.type === "income" ? "+" : "-"}{formatRWF(tx.amount)}
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeTransaction(tx.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
