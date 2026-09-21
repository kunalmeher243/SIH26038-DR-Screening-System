import axios from "axios";

/*
 * =========================================================
 * RETINATRACK API CLIENT
 * =========================================================
 *
 * Your backend/model server:
 *
 * http://10.173.166.53:8080
 *
 * You can override this using:
 *
 * VITE_API_URL=http://10.173.166.53:8080
 *
 * No dummy/mock API is used.
 * =========================================================
 */

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://10.173.166.53:8080",

  timeout: 35000,
});


/*
 * =========================================================
 * RESPONSE ERROR HANDLING
 * =========================================================
 */

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message;

    if (detail) {
      error.userMessage =
        typeof detail === "string"
          ? detail
          : JSON.stringify(detail);
    }

    else if (
      error?.code === "ECONNABORTED"
    ) {
      error.userMessage =
        "The screening service timed out. Please try again.";
    }

    else if (!error?.response) {
      error.userMessage =
        "Unable to connect to the screening backend.";
    }

    return Promise.reject(error);
  }
);


export default apiClient;