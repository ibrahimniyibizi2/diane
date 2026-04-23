import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "rw";

const dict = {
  // Common
  appName: { en: "Salon Manager", rw: "Salon Manager" },
  tagline: { en: "Manage your salon with ease", rw: "Yobora salon yawe byoroshye" },
  login: { en: "Log in", rw: "Injira" },
  logout: { en: "Log out", rw: "Sohoka" },
  signup: { en: "Sign up", rw: "Iyandikishe" },
  email: { en: "Email", rw: "Imeyili" },
  password: { en: "Password", rw: "Ijambo ry'ibanga" },
  name: { en: "Name", rw: "Izina" },
  phone: { en: "Phone", rw: "Telefoni" },
  role: { en: "Role", rw: "Inshingano" },
  save: { en: "Save", rw: "Bika" },
  cancel: { en: "Cancel", rw: "Hagarika" },
  delete: { en: "Delete", rw: "Siba" },
  edit: { en: "Edit", rw: "Hindura" },
  add: { en: "Add", rw: "Ongera" },
  total: { en: "Total", rw: "Igiteranyo" },
  amount: { en: "Amount", rw: "Amafaranga" },
  date: { en: "Date", rw: "Itariki" },
  actions: { en: "Actions", rw: "Ibikorwa" },
  search: { en: "Search", rw: "Shakisha" },
  back: { en: "Back", rw: "Subira" },
  // Nav
  dashboard: { en: "Dashboard", rw: "Imbonerahamwe" },
  workers: { en: "Workers", rw: "Abakozi" },
  services: { en: "Services", rw: "Serivisi" },
  products: { en: "Products", rw: "Ibicuruzwa" },
  cash: { en: "Cash Register", rw: "Konti" },
  shifts: { en: "Shifts", rw: "Igihe cy'akazi" },
  reports: { en: "Reports", rw: "Raporo" },
  // Roles
  admin: { en: "Admin", rw: "Umuyobozi" },
  boss: { en: "Boss", rw: "Nyiri salon" },
  worker: { en: "Worker", rw: "Umukozi" },
  barber: { en: "Barber", rw: "Umushishi" },
  trancista: { en: "Braider", rw: "Ubuza imisatsi" },
  employee: { en: "Employee", rw: "Umukozi" },
  // Workers
  addWorker: { en: "Add worker", rw: "Ongeraho umukozi" },
  commission: { en: "Commission %", rw: "Komisiyo %" },
  paymentType: { en: "Payment type", rw: "Uburyo bwo kwishyura" },
  daily: { en: "Daily", rw: "Buri munsi" },
  weekly: { en: "Weekly", rw: "Buri cyumweru" },
  monthly: { en: "Monthly", rw: "Buri kwezi" },
  // Services
  registerService: { en: "Register service", rw: "Andika serivisi" },
  serviceType: { en: "Service type", rw: "Ubwoko bwa serivisi" },
  cut: { en: "Haircut", rw: "Kogosha" },
  braid: { en: "Braiding", rw: "Kuboha" },
  color: { en: "Coloring", rw: "Gusiga ibara" },
  wash: { en: "Wash", rw: "Koza" },
  amountCharged: { en: "Amount charged", rw: "Amafaranga yishyuwe" },
  paymentMethod: { en: "Payment method", rw: "Uburyo bwo kwishyura" },
  cashMethod: { en: "Cash", rw: "Amafaranga" },
  mobileMoney: { en: "Mobile Money", rw: "Mobile Money" },
  card: { en: "Card", rw: "Karita" },
  materialCost: { en: "Material cost", rw: "Igiciro cy'ibikoresho" },
  commissionAmount: { en: "Commission", rw: "Komisiyo" },
  // Products
  addProduct: { en: "Add product", rw: "Ongeraho igicuruzwa" },
  costPrice: { en: "Cost price", rw: "Igiciro" },
  quantity: { en: "Quantity", rw: "Ingano" },
  // Cash
  income: { en: "Income", rw: "Amafaranga yinjiye" },
  expense: { en: "Expense", rw: "Amafaranga yasohotse" },
  balance: { en: "Balance", rw: "Bisigaye" },
  category: { en: "Category", rw: "Icyiciro" },
  description: { en: "Description", rw: "Sobanura" },
  addTransaction: { en: "Add transaction", rw: "Ongeraho" },
  // Shifts
  openShift: { en: "Open shift", rw: "Fungura igihe" },
  closeShift: { en: "Close shift", rw: "Funga igihe" },
  shiftOpen: { en: "Shift open", rw: "Igihe gifunguye" },
  shiftClosed: { en: "Shift closed", rw: "Igihe gifunze" },
  noShift: { en: "No active shift", rw: "Nta gihe gifunguye" },
  openedAt: { en: "Opened at", rw: "Byafunguwe" },
  closedAt: { en: "Closed at", rw: "Byafunzwe" },
  // Reports
  dailyReport: { en: "Daily report", rw: "Raporo y'umunsi" },
  totalServices: { en: "Total services", rw: "Serivisi zose" },
  totalEarned: { en: "Total earned", rw: "Yose yinjiye" },
  totalSpent: { en: "Total spent", rw: "Yose yasohotse" },
  profit: { en: "Profit", rw: "Inyungu" },
  byWorker: { en: "By worker", rw: "Ku mukozi" },
  sendEmail: { en: "Send by Email", rw: "Ohereza kuri Email" },
  sendWhatsApp: { en: "Send by WhatsApp", rw: "Ohereza kuri WhatsApp" },
  // Dashboard
  todayEarnings: { en: "Today's earnings", rw: "Amafaranga y'uyu munsi" },
  todayServices: { en: "Today's services", rw: "Serivisi z'uyu munsi" },
  activeWorkers: { en: "Active workers", rw: "Abakozi bakora" },
  weeklyTrend: { en: "Weekly trend", rw: "Icyumweru" },
  recentServices: { en: "Recent services", rw: "Serivisi za vuba" },
  // Auth
  loginTitle: { en: "Welcome back", rw: "Murakaza neza" },
  loginSubtitle: { en: "Sign in to manage your salon", rw: "Injira kugira ngo uyobore salon yawe" },
  signupTitle: { en: "Create account", rw: "Iyandikishe" },
  noAccount: { en: "No account?", rw: "Nta konti ufite?" },
  haveAccount: { en: "Have an account?", rw: "Ufite konti?" },
  demoLogin: { en: "Use any email/password (demo mode)", rw: "Koresha email iyo ari yo yose (demo)" },
  // Shift report
  shiftReport: { en: "Shift report", rw: "Raporo y'igihe cy'akazi" },
  shiftSummary: { en: "Shift summary", rw: "Incamake y'igihe" },
  duration: { en: "Duration", rw: "Igihe cyamaze" },
  history: { en: "History", rw: "Amateka" },
  viewReport: { en: "View report", rw: "Reba raporo" },
  hide: { en: "Hide", rw: "Hisha" },
} as const;

export type TKey = keyof typeof dict;

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
    }),
    { name: "salon-lang" }
  )
);

export function useT() {
  const lang = useI18n((s) => s.lang);
  return (key: TKey) => dict[key]?.[lang] ?? key;
}

export function formatRWF(n: number) {
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(n);
}
