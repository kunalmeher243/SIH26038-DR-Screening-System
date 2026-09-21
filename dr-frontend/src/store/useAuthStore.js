import { create } from "zustand";

const STORAGE_KEY = "retinatrack_auth";

const VALID_ROLES = [
  "Patient",
  "PHC Worker",
  "Ophthalmologist",
];

/* =========================================================
   LOAD STORED AUTH
   ========================================================= */

const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed?.user || !parsed?.token) {
      return null;
    }

    if (!VALID_ROLES.includes(parsed.user.role)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "Failed to load authentication from localStorage:",
      error
    );

    return null;
  }
};

const initialStored = getStoredAuth();

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeRole(role) {
  return VALID_ROLES.includes(role)
    ? role
    : "Patient";
}

function formatUserName(name, role) {
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    return role === "Ophthalmologist"
      ? "Dr. User"
      : "User";
  }

  if (role === "Ophthalmologist") {
    return cleanName.toLowerCase().startsWith("dr.")
      ? cleanName
      : `Dr. ${cleanName}`;
  }

  return cleanName.replace(/^Dr\.\s*/i, "");
}

function createMockToken() {
  return `jwt_mock_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2)}`;
}

function persistAuth(user, token) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        token,
      })
    );
  } catch (error) {
    console.error(
      "Failed to persist authentication:",
      error
    );
  }
}

/* =========================================================
   STORE
   ========================================================= */

const useAuthStore = create((set, get) => ({
  /* =======================================================
     AUTH STATE
     ======================================================= */

  user: initialStored?.user || null,

  token: initialStored?.token || null,

  isAuthenticated: Boolean(
    initialStored?.token &&
      initialStored?.user
  ),

  /* =======================================================
     AUTH MODAL STATE
     ======================================================= */

  isAuthModalOpen: false,

  authModalMode: "login",

  selectedModalRole: "Patient",

  /* =======================================================
     OPEN LOGIN
     ======================================================= */

  openLogin: (defaultRole = "Patient") => {
    set({
      isAuthModalOpen: true,
      authModalMode: "login",
      selectedModalRole:
        normalizeRole(defaultRole),
    });
  },

  /* =======================================================
     OPEN SIGNUP
     ======================================================= */

  openSignUp: (defaultRole = "Patient") => {
    set({
      isAuthModalOpen: true,
      authModalMode: "signup",
      selectedModalRole:
        normalizeRole(defaultRole),
    });
  },

  /* =======================================================
     CLOSE AUTH MODAL
     ======================================================= */

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
    });
  },

  /* =======================================================
     CHANGE AUTH MODE
     ======================================================= */

  setAuthModalMode: (mode) => {
    if (
      mode !== "login" &&
      mode !== "signup"
    ) {
      return;
    }

    set({
      authModalMode: mode,
    });
  },

  /* =======================================================
     SELECT ROLE
     ======================================================= */

  setSelectedModalRole: (role) => {
    set({
      selectedModalRole:
        normalizeRole(role),
    });
  },

  /* =======================================================
     LOGIN
     ======================================================= */

  login: async ({
    email,
    password,
    role,
  }) => {
    // Determine the expected role the user is trying to log in as (for the UI)
    const normalizedRole = normalizeRole(role);

    // Call the backend to login using OAuth2 password flow (which uses form-data)
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    // We import apiClient dynamically to avoid circular dependencies if any
    const { default: apiClient } = await import("../api/client");
    
    const response = await apiClient.post("/api/auth/login", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const data = response.data;
    
    // Map backend role back to frontend role string if needed
    // "phc_worker" -> "PHC Worker", "doctor" -> "Ophthalmologist", "patient" -> "Patient"
    let uiRole = "Patient";
    let portal = "patient";
    if (data.role === "phc_worker") {
      uiRole = "PHC Worker";
      portal = "phc";
    } else if (data.role === "doctor") {
      uiRole = "Ophthalmologist";
      portal = "doctor";
    }
    
    const userPayload = {
      name: data.name,
      email: data.email,
      role: uiRole,
      id: `usr_${Date.now()}`,
      portal: portal,
    };
    
    const token = data.access_token;

    persistAuth(
      userPayload,
      token
    );

    set({
      user: userPayload,
      token,
      isAuthenticated: true,
      isAuthModalOpen: false,
    });

    return userPayload;
  },

  /* =======================================================
     SIGN UP
     ======================================================= */

  signup: async ({
    name,
    email,
    password,
    role,
  }) => {
    const normalizedRole = normalizeRole(role);
    
    let backendRole = "patient";
    if (normalizedRole === "PHC Worker") backendRole = "phc_worker";
    if (normalizedRole === "Ophthalmologist") backendRole = "doctor";

    const { default: apiClient } = await import("../api/client");
    
    await apiClient.post("/api/auth/register", {
      name,
      email,
      password,
      role: backendRole
    });
    
    // Automatically login after successful registration
    return get().login({ email, password, role });
  },

  /* =======================================================
     LOGOUT
     ======================================================= */

  logout: () => {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Failed to clear authentication:",
        error
      );
    }

    set({
      user: null,

      token: null,

      isAuthenticated: false,

      isAuthModalOpen: false,

      authModalMode: "login",

      selectedModalRole: "Patient",
    });
  },

  /* =======================================================
     ROLE SWITCHER
     =======================================================
     
     Development utility only.

     This should eventually be removed when real
     authentication/authorization is connected.
     ======================================================= */

  switchRole: (newRole) => {
    const {
      user,
      token,
    } = get();

    if (!user) {
      return;
    }

    const normalizedRole =
      normalizeRole(newRole);

    const updatedUser = {
      ...user,

      role: normalizedRole,

      portal:
        normalizedRole === "PHC Worker"
          ? "phc"
          : normalizedRole ===
            "Ophthalmologist"
          ? "doctor"
          : "patient",

      name: formatUserName(
        user.name,
        normalizedRole
      ),
    };

    persistAuth(
      updatedUser,
      token
    );

    set({
      user: updatedUser,
    });
  },

  /* =======================================================
     GET CURRENT PORTAL
     ======================================================= */

  getCurrentPortal: () => {
    const user = get().user;

    if (!user) {
      return null;
    }

    switch (user.role) {
      case "PHC Worker":
        return "phc";

      case "Ophthalmologist":
        return "doctor";

      case "Patient":
        return "patient";

      default:
        return null;
    }
  },

  /* =======================================================
     ROLE HELPERS
     ======================================================= */

  isPatient: () => {
    return get().user?.role === "Patient";
  },

  isPHCWorker: () => {
    return get().user?.role === "PHC Worker";
  },

  isOphthalmologist: () => {
    return (
      get().user?.role ===
      "Ophthalmologist"
    );
  },
}));

export default useAuthStore;