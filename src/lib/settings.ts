import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SalonSettings {
  salonName: string;
  ownerEmail: string;
  whatsappNumber: string; // E.164 without + e.g. 250788123456
  smsNumber: string; // E.164 with or without +
  smsSenderId: string; // shown as From in SMS
}

interface SettingsState extends SalonSettings {
  update: (patch: Partial<SalonSettings>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      salonName: "My Salon",
      ownerEmail: "",
      whatsappNumber: "",
      smsNumber: "",
      smsSenderId: "Salon",
      update: (patch) => set((s) => ({ ...s, ...patch })),
    }),
    { name: "salon-settings" }
  )
);
