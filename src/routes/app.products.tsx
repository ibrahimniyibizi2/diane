import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/store";
import { formatRWF, useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Package } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const t = useT();
  const products = useData((s) => s.products);
  const addProduct = useData((s) => s.addProduct);
  const removeProduct = useData((s) => s.removeProduct);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", costPrice: 0, quantity: 0 });

  const submit = () => {
    if (!form.name) return;
    addProduct(form);
    setForm({ name: "", costPrice: 0, quantity: 0 });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("products")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}><Plus className="h-4 w-4" />{t("addProduct")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("addProduct")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>{t("name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t("costPrice")}</Label><Input type="number" value={form.costPrice || ""} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} /></div>
              <div><Label>{t("quantity")}</Label><Input type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
              <Button onClick={submit} className="w-full">{t("save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-accent)" }}>
                <Package className="h-5 w-5 text-accent-foreground" />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="font-semibold mb-2">{p.name}</div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("costPrice")}</span>
              <span className="font-medium">{formatRWF(p.costPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("quantity")}</span>
              <span className={`font-medium ${p.quantity < 5 ? "text-destructive" : ""}`}>{p.quantity}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
