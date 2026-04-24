  
  import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    },
    {
      id: 2,
      name: "John Smith",
      email: "john@example.com",
      password: "john123",
      role: "agent",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      password: "sarah123",
      role: "agent",
    },
  ],
  isLoggedIn: false,

  // Login user
  login: (email, password) =>
    set((state) => {
      const foundUser = state.users.find(
        (u) => u.email === email && u.password === password
      );
      if (foundUser) {
        return { user: foundUser, isLoggedIn: true };
      }
      throw new Error("Invalid email or password");
    }),

  // Sign up new user
  signup: (name, email, password, role) =>
    set((state) => {
      const emailExists = state.users.find((u) => u.email === email);
      if (emailExists) {
        throw new Error("Email already exists");
      }
      const newUser = {
        id: Math.max(...state.users.map((u) => u.id), 0) + 1,
        name,
        email,
        password,
        role,
      };
      return {
        users: [...state.users, newUser],
        user: newUser,
        isLoggedIn: true,
      };
    }),

  // Logout user
  logout: () => set({ user: null, isLoggedIn: false }),

  // Add admin user
  addAdmin: (name, email, password) =>
    set((state) => {
      const emailExists = state.users.find((u) => u.email === email);
      if (emailExists) {
        throw new Error("Email already exists");
      }
      const newAdmin = {
        id: Math.max(...state.users.map((u) => u.id), 0) + 1,
        name,
        email,
        password,
        role: "admin",
      };
      return {
        users: [...state.users, newAdmin],
      };
    }),

  // Get all admins
  getAdmins: () => {
    const state = useAuthStore.getState();
    return state.users.filter((u) => u.role === "admin");
  },

  // Get all agents
  getAgents: () => {
    const state = useAuthStore.getState();
    return state.users.filter((u) => u.role === "agent");
  },
}));
