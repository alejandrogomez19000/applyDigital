import { create } from "zustand";

export interface NotificationStore {
  filters: string[];
  setFilters: (filters: string[]) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  filters: [],
  setFilters: (filters: string[]) => set({ filters }),
}));
