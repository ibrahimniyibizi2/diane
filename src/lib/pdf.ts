import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, isToday } from "date-fns";
import type { Service, Worker, Transaction, Sale, Product } from "@/lib/store";
import type { SalonSettings } from "@/lib/settings";

interface BuildArgs {
  settings: SalonSettings;
  services: Service[];
  workers: Worker[];
  transactions: Transaction[];
  sales: Sale[];
  products: Product[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(n) + " RWF";

export function buildDailyReportPDF({
  settings,
  services,
  workers,
  transactions,
  sales,
  products,
}: BuildArgs) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const today = new Date();

  // ---------- Header band ----------
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(settings.salonName || "Salon", 14, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Daily Report", 14, 20);
  doc.text(format(today, "EEEE, MMM d, yyyy"), pageW - 14, 20, { align: "right" });

  doc.setTextColor(20, 20, 20);
  let y = 38;

  // ---------- KPIs ----------
  const todayServices = services.filter((s) => isToday(new Date(s.createdAt)));
  const todayTx = transactions.filter((t) => isToday(new Date(t.createdAt)));
  const todaySales = sales.filter((s) => isToday(new Date(s.createdAt)));

  const income = todayTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = todayTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const profit = income - expense;
  const totalCommission = todayServices.reduce((a, s) => a + s.commissionAmount, 0);

  const kpis: [string, string][] = [
    ["Total Services", String(todayServices.length)],
    ["Total Sales", String(todaySales.length)],
    ["Income", fmt(income)],
    ["Expenses", fmt(expense)],
    ["Profit", fmt(profit)],
    ["Commissions", fmt(totalCommission)],
  ];

  const cardW = (pageW - 28 - 10) / 3;
  const cardH = 18;
  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 14 + col * (cardW + 5);
    const cy = y + row * (cardH + 4);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, cy, cardW, cardH, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 120);
    doc.text(kpi[0], x + 3, cy + 6);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 30);
    doc.text(kpi[1], x + 3, cy + 13);
    doc.setFont("helvetica", "normal");
  });
  y += Math.ceil(kpis.length / 3) * (cardH + 4) + 4;

  // ---------- By worker ----------
  const byWorker = workers.map((w) => {
    const ws = todayServices.filter((s) => s.workerId === w.id);
    return {
      name: w.name,
      role: w.role,
      payModel: w.payModel,
      count: ws.length,
      total: ws.reduce((a, b) => a + b.amountCharged, 0),
      commission: ws.reduce((a, b) => a + b.commissionAmount, 0),
      payout:
        w.payModel === "salary"
          ? w.salary
          : ws.reduce((a, b) => a + b.commissionAmount, 0),
    };
  });

  autoTable(doc, {
    startY: y,
    head: [["Worker", "Role", "Pay model", "Services", "Revenue", "Payout"]],
    body: byWorker.map((b) => [
      b.name,
      b.role,
      b.payModel,
      String(b.count),
      fmt(b.total),
      fmt(b.payout),
    ]),
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    didDrawPage: (d) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Workers performance", 14, d.cursor!.y - (d.table.body.length === 0 ? 4 : 0) - (d.settings.startY === y ? 3 : 3));
      doc.setFont("helvetica", "normal");
    },
  });
  // @ts-expect-error lastAutoTable is added by plugin
  y = doc.lastAutoTable.finalY + 8;

  // ---------- Sales ----------
  if (todaySales.length > 0) {
    autoTable(doc, {
      startY: y + 4,
      head: [["Time", "Client", "Worker", "Items", "Method", "Total"]],
      body: todaySales.map((s) => {
        const w = workers.find((x) => x.id === s.workerId);
        const itemCount = s.services.length + s.products.reduce((a, b) => a + b.qty, 0);
        return [
          format(new Date(s.createdAt), "HH:mm"),
          s.clientName,
          w?.name ?? "—",
          String(itemCount),
          s.paymentMethod,
          fmt(s.total),
        ];
      }),
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Sales", 14, y);
    doc.setFont("helvetica", "normal");
    // @ts-expect-error lastAutoTable
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---------- Transactions ----------
  if (todayTx.length > 0) {
    autoTable(doc, {
      startY: y + 4,
      head: [["Time", "Type", "Category", "Description", "Amount"]],
      body: todayTx.map((t) => [
        format(new Date(t.createdAt), "HH:mm"),
        t.type,
        t.category,
        t.description,
        fmt(t.amount),
      ]),
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Transactions", 14, y);
    doc.setFont("helvetica", "normal");
    // @ts-expect-error lastAutoTable
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---------- Products / stock ----------
  if (products.length > 0) {
    autoTable(doc, {
      startY: y + 4,
      head: [["Product", "Cost price", "In stock"]],
      body: products.map((p) => [p.name, fmt(p.costPrice), String(p.quantity)]),
      headStyles: { fillColor: [100, 116, 139], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Stock", 14, y);
    doc.setFont("helvetica", "normal");
  }

  // ---------- Footer on every page ----------
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text(
      `${settings.salonName} · Generated ${format(today, "yyyy-MM-dd HH:mm")}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Page ${i} / ${pages}`,
      pageW - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" }
    );
  }

  return doc;
}

export function buildReportText(args: BuildArgs) {
  const { settings, services, workers, transactions, sales } = args;
  const today = new Date();
  const todayServices = services.filter((s) => isToday(new Date(s.createdAt)));
  const todayTx = transactions.filter((t) => isToday(new Date(t.createdAt)));
  const todaySales = sales.filter((s) => isToday(new Date(s.createdAt)));
  const income = todayTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = todayTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const profit = income - expense;

  const lines = [
    `📊 ${settings.salonName} — Daily Report`,
    format(today, "EEEE, MMM d, yyyy"),
    ``,
    `Services: ${todayServices.length}`,
    `Sales: ${todaySales.length}`,
    `Income: ${fmt(income)}`,
    `Expenses: ${fmt(expense)}`,
    `Profit: ${fmt(profit)}`,
    ``,
    `👥 By worker:`,
    ...workers.map((w) => {
      const ws = todayServices.filter((s) => s.workerId === w.id);
      const total = ws.reduce((a, b) => a + b.amountCharged, 0);
      const payout =
        w.payModel === "salary" ? w.salary : ws.reduce((a, b) => a + b.commissionAmount, 0);
      return `- ${w.name}: ${ws.length} svc · ${fmt(total)} · payout ${fmt(payout)}`;
    }),
  ];
  return lines.join("\n");
}
