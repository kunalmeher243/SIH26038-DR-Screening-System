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
    const normalizedRole =
      normalizeRole(role);

    const normalizedEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const namePart =
      normalizedEmail.split("@")[0] ||
      "User";

    const generatedName =
      normalizedRole ===
      "Ophthalmologist"
        ? formatUserName(
            namePart,
            normalizedRole
          )
        : formatUserName(
            namePart,
            normalizedRole
          );

    /*
     * -------------------------------------------------------
     * CURRENT DEVELOPMENT AUTH
     * -------------------------------------------------------
     *
     * This is still local/mock authentication.
     *
     * It is intentionally kept compatible with the existing
     * frontend architecture until the real authentication
     * backend is connected.
     * -------------------------------------------------------
     */

    const userPayload = {
      name: generatedName,

      email: normalizedEmail,

      role: normalizedRole,

      id: `usr_${Date.now()}`,

      /*
       * Used later by the role-specific dashboard.
       */
      portal:
        normalizedRole === "PHC Worker"
          ? "phc"
          : normalizedRole ===
            "Ophthalmologist"
          ? "doctor"
          : "patient",
    };

    const token = createMockToken();

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
    const normalizedRole =
      normalizeRole(role);

    const normalizedEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const formattedName =
      formatUserName(
        name,
        normalizedRole
      );

    const userPayload = {
      name: formattedName,

      email: normalizedEmail,

      role: normalizedRole,

      id: `usr_${Date.now()}`,

      portal:
        normalizedRole === "PHC Worker"
          ? "phc"
          : normalizedRole ===
            "Ophthalmologist"
          ? "doctor"
          : "patient",
    };

    const token = createMockToken();

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