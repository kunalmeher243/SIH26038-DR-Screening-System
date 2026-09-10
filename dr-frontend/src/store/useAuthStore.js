import { create } from "zustand";

const STORAGE_KEY = "retinatrack_auth";

// Load initial state from localStorage if available
const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load auth from localStorage", err);
  }
  return null;
};

const initialStored = getStoredAuth();

const useAuthStore = create((set, get) => ({
  user: initialStored?.user || null,
  token: initialStored?.token || null,
  isAuthenticated: Boolean(initialStored?.token),
  
  // Auth Modal State
  isAuthModalOpen: false,
  authModalMode: "login", // "login" | "signup"
  selectedModalRole: "Patient", // "Patient" | "Ophthalmologist"

  openLogin: (defaultRole = "Patient") => {
    set({
      isAuthModalOpen: true,
      authModalMode: "login",
      selectedModalRole: defaultRole || "Patient",
    });
  },

  openSignUp: (defaultRole = "Patient") => {
    set({
      isAuthModalOpen: true,
      authModalMode: "signup",
      selectedModalRole: defaultRole || "Patient",
    });
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
    });
  },

  setAuthModalMode: (mode) => {
    set({ authModalMode: mode });
  },

  setSelectedModalRole: (role) => {
    set({ selectedModalRole: role });
  },

  login: async ({ email, password, role }) => {
    // In production or development with mock fallback:
    // Generate deterministic name and token for testing if not provided
    const namePart = email.split("@")[0];
    const formattedName =
      role === "Ophthalmologist"
        ? `Dr. ${namePart.charAt(0).toUpperCase() + namePart.slice(1)}`
        : namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const userPayload = {
      name: formattedName,
      email: email.toLowerCase(),
      role: role || "Patient",
      id: `usr_${Date.now()}`,
    };

    const token = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const authData = {
      user: userPayload,
      token,
      isAuthenticated: true,
      isAuthModalOpen: false,
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: userPayload, token })
      );
    } catch (e) {
      console.error("Storage error", e);
    }

    set(authData);
    return userPayload;
  },

  signup: async ({ name, email, password, role }) => {
    const formattedName =
      role === "Ophthalmologist" && !name.toLowerCase().startsWith("dr.")
        ? `Dr. ${name}`
        : name;

    const userPayload = {
      name: formattedName,
      email: email.toLowerCase(),
      role: role || "Patient",
      id: `usr_${Date.now()}`,
    };

    const token = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const authData = {
      user: userPayload,
      token,
      isAuthenticated: true,
      isAuthModalOpen: false,
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: userPayload, token })
      );
    } catch (e) {
      console.error("Storage error", e);
    }

    set(authData);
    return userPayload;
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Storage error", e);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
    });
  },

  // Developer utility to switch roles quickly in testing
  switchRole: (newRole) => {
    const { user, token } = get();
    if (!user) return;
    const updatedUser = {
      ...user,
      role: newRole,
      name:
        newRole === "Ophthalmologist" && !user.name.startsWith("Dr.")
          ? `Dr. ${user.name}`
          : user.name.replace(/^Dr\.\s*/, ""),
    };
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: updatedUser, token })
      );
    } catch (e) {
      console.error("Storage error", e);
    }
    set({ user: updatedUser });
  },
}));

export default useAuthStore;
