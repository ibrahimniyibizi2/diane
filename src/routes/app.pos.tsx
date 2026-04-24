import { createFileRoute } from "@tanstack/react-router";
import { useData, type SaleLineService, type SaleLineProduct } from "@/lib/store";
import { useT, formatRWF } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, User, Scissors, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/app/pos")({
  component: PosPage,
});

const SERVICE_TYPES = ["cut", "braid", "color", "wash"] as const;

function PosPage() {
  const t = useT();
  const workers = useData((s) => s.workers);
  const products = useData((s) => s.products);
  const sales = useData((s) => s.sales);
  const addSale = useData((s) => s.addSale);

  const [clientName, setClientName] = useState("");
  const [workerId, setWorkerId] = useState<string>(workers[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mobile_money" | "card">("cash");
  const [serviceLines, setServiceLines] = useState<SaleLineService[]>([]);
  const [productLines, setProductLines] = useState<SaleLineProduct[]>([]);

  const servicesTotal = serviceLines.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const productsTotal = productLines.reduce((a, b) => a + b.unitPrice * b.qty, 0);
  const total = servicesTotal + productsTotal;

  const worker = useMemo(() => workers.find((w) => w.id === workerId), [workers, workerId]);

  const addServiceLine = () =>
    setServiceLines((s) => [...s, { serviceType: "cut", amount: 0 }]);
  const addProductLine = () => {
    const first = products[0];
    if (!first) {
      toast.error(t("products"));
      return;
    }
    setProductLines((p) => [
      ...p,
      { productId: first.id, name: first.name, unitPrice: first.costPrice, qty: 1 },
    ]);
  };

  const updateService = (i: number, patch: Partial<SaleLineService>) =>
    setServiceLines((s) => s.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const updateProduct = (i: number, patch: Partial<SaleLineProduct>) =>
    setProductLines((s) => s.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const reset = () => {
    setClientName("");
    setServiceLines([]);
    setProductLines([]);
    setPaymentMethod("cash");
  };

  const charge = () => {
    if (!workerId) {
      toast.error(t("selectWorker"));
      return;
    }
    if (serviceLines.length === 0 && productLines.length === 0) {
      toast.error(t("emptySale"));
      return;
    }
    const autoName = `Client-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    addSale({
      clientName: clientName.trim() || autoName,
      workerId,
      services: serviceLines.filter((s) => s.amount > 0),
      products: productLines.filter((p) => p.qty > 0),
      paymentMethod,
    });
    toast.success(`${t("saleRegistered")} · ${formatRWF(total)}`);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-7 w-7" />
            {t("pos")}
          </h1>
          <p className="text-muted-foreground">{t("newSale")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Client + Worker */}
          <Card className="p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1"><User className="h-3 w-3" />{t("clientName")}</Label>
                <Input
                  placeholder={t("walkIn")}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("worker")}</Label>
                <Select value={workerId} onValueChange={setWorkerId}>
                  <SelectTrigger><SelectValue placeholder={t("selectWorker")} /></SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} · {w.payModel === "salary" ? t("salaryModel") : `${w.commission}%`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Services */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2"><Scissors className="h-4 w-4" />{t("services")}</h2>
              <Button size="sm" variant="outline" className="gap-1" onClick={addServiceLine}>
                <Plus className="h-3 w-3" />{t("addServiceLine")}
              </Button>
            </div>
            {serviceLines.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <div className="space-y-2">
                {serviceLines.map((line, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select value={line.serviceType} onValueChange={(v) => updateService(i, { serviceType: v })}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((s) => (
                          <SelectItem key={s} value={s}>{t(s as any)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="w-32"
                      placeholder="0"
                      value={line.amount || ""}
                      onChange={(e) => updateService(i, { amount: Number(e.target.value) })}
                    />
                    <Button size="icon" variant="ghost" onClick={() => setServiceLines((s) => s.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Products */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" />{t("products")}</h2>
              <Button size="sm" variant="outline" className="gap-1" onClick={addProductLine}>
                <Plus className="h-3 w-3" />{t("addProductLine")}
              </Button>
            </div>
            {productLines.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <div className="space-y-2">
                {productLines.map((line, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select
                      value={line.productId}
                      onValueChange={(v) => {
                        const p = products.find((x) => x.id === v);
                        if (p) updateProduct(i, { productId: p.id, name: p.name, unitPrice: p.costPrice });
                      }}
                    >
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      className="w-20"
                      value={line.qty}
                      min={1}
                      onChange={(e) => updateProduct(i, { qty: Math.max(1, Number(e.target.value)) })}
                    />
                    <Input
                      type="number"
                      className="w-28"
                      value={line.unitPrice}
                      onChange={(e) => updateProduct(i, { unitPrice: Number(e.target.value) })}
                    />
                    <Button size="icon" variant="ghost" onClick={() => setProductLines((s) => s.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-5 h-fit lg:sticky lg:top-4 space-y-4">
          <h2 className="font-semibold">{t("shiftSummary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("servicesTotal")}</span><span>{formatRWF(servicesTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("productsTotal")}</span><span>{formatRWF(productsTotal)}</span></div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>{t("grandTotal")}</span>
              <span>{formatRWF(total)}</span>
            </div>
            {worker && worker.payModel === "commission" && servicesTotal > 0 && (
              <div className="flex justify-between text-xs text-primary pt-1">
                <span>{t("commissionAmount")} ({worker.commission}%)</span>
                <span>{formatRWF(Math.round((servicesTotal * worker.commission) / 100))}</span>
              </div>
            )}
          </div>

          <div>
            <Label>{t("paymentMethod")}</Label>
            <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t("cashMethod")}</SelectItem>
                <SelectItem value="mobile_money">{t("mobileMoney")}</SelectItem>
                <SelectItem value="card">{t("card")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 text-base"
            style={{ background: "var(--gradient-primary)" }}
            onClick={charge}
            disabled={total === 0}
          >
            {t("charge")} · {formatRWF(total)}
          </Button>
        </Card>
      </div>

      {/* Recent sales */}
      <Card className="p-5">
        <h2 className="font-semibold mb-3">{t("recentSales")}</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <div className="space-y-2">
            {sales.slice(0, 8).map((s) => {
              const w = workers.find((x) => x.id === s.workerId);
              return (
                <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{s.clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {w?.name ?? "—"} · {format(new Date(s.createdAt), "MMM d HH:mm")}
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {s.services.map((sv, i) => (
                        <Badge key={`s${i}`} variant="secondary" className="text-[10px]">{t(sv.serviceType as any)}</Badge>
                      ))}
                      {s.products.map((p, i) => (
                        <Badge key={`p${i}`} variant="outline" className="text-[10px]">{p.name} ×{p.qty}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="font-semibold">{formatRWF(s.total)}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
