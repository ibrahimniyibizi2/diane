import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "boss" | "worker";
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type PayModel = "commission" | "salary";
export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: "barber" | "trancista" | "employee";
  payModel: PayModel; // commission or fixed salary
  commission: number; // percentage (used when payModel = commission)
  salary: number; // fixed salary amount (used when payModel = salary)
  paymentType: "daily" | "weekly" | "monthly";
  createdAt: string;
}

export interface Service {
  id: string;
  workerId: string;
  serviceType: string;
  amountCharged: number;
  paymentMethod: "cash" | "mobile_money" | "card";
  materialCost: number;
  commissionAmount: number;
  shiftId: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  shiftId: string | null;
  createdAt: string;
}

export interface Shift {
  id: string;
  openedAt: string;
  closedAt: string | null;
  openedBy: string;
  closedBy: string | null;
  status: "open" | "closed";
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email) => {
        await new Promise((r) => setTimeout(r, 400));
        set({
          user: {
            id: "u1",
            name: email.split("@")[0] || "Owner",
            email,
            role: "admin",
          },
        });
      },
      signup: async (name, email) => {
        await new Promise((r) => setTimeout(r, 400));
        set({ user: { id: "u1", name, email, role: "admin" } });
      },
      logout: () => set({ user: null }),
    }),
    { name: "salon-auth" }
  )
);

export interface SaleLineService {
  serviceType: string;
  amount: number;
}
export interface SaleLineProduct {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
}
export interface Sale {
  id: string;
  clientName: string; // "Walk-in" if not specified
  workerId: string;
  services: SaleLineService[];
  products: SaleLineProduct[];
  total: number;
  paymentMethod: "cash" | "mobile_money" | "card";
  shiftId: string | null;
  createdAt: string;
}

interface DataState {
  workers: Worker[];
  services: Service[];
  products: Product[];
  transactions: Transaction[];
  shifts: Shift[];
  sales: Sale[];
  addWorker: (w: Omit<Worker, "id" | "createdAt">) => void;
  updateWorker: (id: string, w: Partial<Worker>) => void;
  removeWorker: (id: string) => void;
  addService: (s: Omit<Service, "id" | "createdAt" | "commissionAmount" | "shiftId">) => void;
  removeService: (id: string) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt" | "shiftId">) => void;
  removeTransaction: (id: string) => void;
  openShift: (userId: string) => void;
  closeShift: (userId: string) => void;
  currentShift: () => Shift | null;
  addSale: (sale: Omit<Sale, "id" | "createdAt" | "shiftId" | "total">) => void;
}

const seedWorkers: Worker[] = [
  { id: "w1", name: "Jean Bosco", phone: "+250788111222", role: "barber", payModel: "commission", commission: 40, salary: 0, paymentType: "daily", createdAt: new Date().toISOString() },
  { id: "w2", name: "Aline Uwase", phone: "+250788333444", role: "trancista", payModel: "commission", commission: 50, salary: 0, paymentType: "weekly", createdAt: new Date().toISOString() },
];

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      workers: seedWorkers,
      services: [],
      products: [
        { id: "p1", name: "Shampoo", costPrice: 3000, quantity: 12 },
        { id: "p2", name: "Hair gel", costPrice: 2500, quantity: 8 },
      ],
      transactions: [],
      shifts: [],
      sales: [],
      addWorker: (w) =>
        set((s) => ({
          workers: [...s.workers, { ...w, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
        })),
      updateWorker: (id, w) =>
        set((s) => ({ workers: s.workers.map((x) => (x.id === id ? { ...x, ...w } : x)) })),
      removeWorker: (id) => set((s) => ({ workers: s.workers.filter((x) => x.id !== id) })),
      addService: (svc) => {
        const worker = get().workers.find((w) => w.id === svc.workerId);
        const commissionAmount =
          worker && worker.payModel === "commission"
            ? Math.round((svc.amountCharged * worker.commission) / 100)
            : 0;
        const shift = get().currentShift();
        const newService: Service = {
          ...svc,
          id: crypto.randomUUID(),
          commissionAmount,
          shiftId: shift?.id ?? null,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          services: [newService, ...s.services],
          transactions: [
            {
              id: crypto.randomUUID(),
              type: "income",
              category: "service",
              amount: svc.amountCharged,
              description: `${svc.serviceType} — ${worker?.name ?? ""}`,
              shiftId: shift?.id ?? null,
              createdAt: new Date().toISOString(),
            },
            ...s.transactions,
          ],
        }));
      },
      removeService: (id) => set((s) => ({ services: s.services.filter((x) => x.id !== id) })),
      addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: crypto.randomUUID() }] })),
      updateProduct: (id, p) =>
        set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      removeProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
      addTransaction: (t) => {
        const shift = get().currentShift();
        set((s) => ({
          transactions: [
            { ...t, id: crypto.randomUUID(), shiftId: shift?.id ?? null, createdAt: new Date().toISOString() },
            ...s.transactions,
          ],
        }));
      },
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      openShift: (userId) => {
        if (get().currentShift()) return;
        set((s) => ({
          shifts: [
            ...s.shifts,
            {
              id: crypto.randomUUID(),
              openedAt: new Date().toISOString(),
              closedAt: null,
              openedBy: userId,
              closedBy: null,
              status: "open",
            },
          ],
        }));
      },
      closeShift: (userId) => {
        set((s) => ({
          shifts: s.shifts.map((sh) =>
            sh.status === "open"
              ? { ...sh, status: "closed", closedAt: new Date().toISOString(), closedBy: userId }
              : sh
          ),
        }));
      },
      currentShift: () => get().shifts.find((s) => s.status === "open") ?? null,
      addSale: (sale) => {
        const worker = get().workers.find((w) => w.id === sale.workerId);
        const shift = get().currentShift();
        const servicesTotal = sale.services.reduce((a, b) => a + (b.amount || 0), 0);
        const productsTotal = sale.products.reduce((a, b) => a + b.unitPrice * b.qty, 0);
        const total = servicesTotal + productsTotal;
        const saleId = crypto.randomUUID();
        const now = new Date().toISOString();
        const clientLabel = sale.clientName?.trim() || "Walk-in";

        // Per-service Service rows (with commission for commission workers)
        const newServiceRows: Service[] = sale.services.map((line) => {
          const commissionAmount =
            worker && worker.payModel === "commission"
              ? Math.round((line.amount * worker.commission) / 100)
              : 0;
          return {
            id: crypto.randomUUID(),
            workerId: sale.workerId,
            serviceType: line.serviceType,
            amountCharged: line.amount,
            paymentMethod: sale.paymentMethod,
            materialCost: 0,
            commissionAmount,
            shiftId: shift?.id ?? null,
            createdAt: now,
          };
        });

        // Decrement product stock
        const updatedProducts = get().products.map((p) => {
          const line = sale.products.find((l) => l.productId === p.id);
          return line ? { ...p, quantity: Math.max(0, p.quantity - line.qty) } : p;
        });

        // Single income transaction for the sale total
        const newTx: Transaction = {
          id: crypto.randomUUID(),
          type: "income",
          category: "sale",
          amount: total,
          description: `POS · ${clientLabel} · ${worker?.name ?? ""}`,
          shiftId: shift?.id ?? null,
          createdAt: now,
        };

        const newSale: Sale = {
          ...sale,
          id: saleId,
          clientName: clientLabel,
          total,
          shiftId: shift?.id ?? null,
          createdAt: now,
        };

        set((s) => ({
          sales: [newSale, ...s.sales],
          services: [...newServiceRows, ...s.services],
          products: updatedProducts,
          transactions: [newTx, ...s.transactions],
        }));
      },
    }),
    { name: "salon-data" }
  )
);
    { name: "salon-data" }
  )
);
