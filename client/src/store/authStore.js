import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,        // { id, name, role }
      isLoggedIn: false,

      setUser: (userData) =>
        set({ user: userData, isLoggedIn: true }),

      logout: () =>
        set({ user: null, isLoggedIn: false }),
    }),
    {
      name: "farmops-auth", // localStorage key
      partialise: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);