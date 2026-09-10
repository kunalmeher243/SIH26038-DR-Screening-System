import { create } from "zustand";

let toastTimeout = null;

const useToastStore = create((set) => ({
  message: "",
  type: "error", // "error" | "success" | "warning" | "info"
  visible: false,

  showToast: (message, type = "error") => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    set({
      message,
      type,
      visible: true,
    });

    // Auto-dismiss in exactly 5000ms as per requirements
    toastTimeout = setTimeout(() => {
      set({ visible: false, message: "" });
      toastTimeout = null;
    }, 5000);
  },

  hideToast: () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    set({ visible: false, message: "" });
  },
}));

export default useToastStore;
