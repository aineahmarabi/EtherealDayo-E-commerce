import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminAuthState {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authenticate: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: "ethereal-admin-auth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
