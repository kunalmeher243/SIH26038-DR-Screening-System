import apiClient from "./client";


/*
 * =========================================================
 * ERROR HELPER
 * =========================================================
 */

function getApiError(error) {
  return (
    error?.userMessage ||
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "The screening service is unavailable."
  );
}


/*
 * =========================================================
 * FORM DATA HELPER
 * =========================================================
 */

function createImageFormData(file) {
  if (!file) {
    throw new Error(
      "No retinal image was provided."
    );
  }

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  return formData;
}


/*
 * =========================================================
 * HEALTH
 * =========================================================
 *
 * GET /health
 */

export async function checkHealth() {
  try {

    const response =
      await apiClient.get(
        "/health"
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * IMAGE QUALITY
 * =========================================================
 *
 * POST /api/quality
 *
 * REAL BACKEND
 */

export async function checkQuality(file) {

  try {

    const response =
      await apiClient.post(
        "/api/quality",
        createImageFormData(file),
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * IMAGE ENHANCEMENT
 * =========================================================
 *
 * POST /api/enhance
 *
 * REAL BACKEND
 */

export async function enhanceImage(file) {

  try {

    const response =
      await apiClient.post(
        "/api/enhance",
        createImageFormData(file),
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * DIABETIC RETINOPATHY GRADING
 * =========================================================
 *
 * POST /api/grade
 *
 * REAL MODEL API
 */

export async function gradeImage(file) {

  try {

    const response =
      await apiClient.post(
        "/api/grade",
        createImageFormData(file),
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * SCREENING REPORT
 * =========================================================
 *
 * POST /api/report
 *
 * REAL BACKEND
 */

export async function generateReport(file) {

  try {

    const response =
      await apiClient.post(
        "/api/report",
        createImageFormData(file),
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * FORMAL CLINICAL PDF
 * =========================================================
 *
 * POST /api/report/pdf
 *
 * This is the application report-PDF endpoint.
 */

export async function generateClinicalReportPdf(
  file,
  reportData
) {

  const formData =
    new FormData();


  if (file) {

    formData.append(
      "file",
      file
    );

  }


  formData.append(
    "report_data",
    JSON.stringify(
      reportData
    )
  );


  try {

    const response =
      await apiClient.post(
        "/api/report/pdf",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },

          responseType:
            "blob",

          timeout:
            35000,
        }
      );

    return response.data;

  } catch (error) {

    /*
     * Axios can return backend errors
     * as Blob when responseType is blob.
     */

    if (
      error?.response?.data
      instanceof Blob
    ) {

      try {

        const text =
          await error.response.data.text();

        if (text) {

          const parsed =
            JSON.parse(text);

          if (parsed?.detail) {

            error.userMessage =
              typeof parsed.detail ===
              "string"

                ? parsed.detail

                : JSON.stringify(
                    parsed.detail
                  );
          }
        }

      } catch {
        // Keep normal error.
      }
    }


    error.userMessage =
      error.userMessage ||
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * WHATSAPP NUMBER VALIDATION
 * =========================================================
 *
 * POST /api/whatsapp/validate
 *
 * This belongs to the application backend,
 * not the ML model itself.
 */

export async function validateWhatsAppNumber(
  phoneNumber
) {

  try {

    const response =
      await apiClient.post(
        "/api/whatsapp/validate",
        {
          phone_number:
            phoneNumber,
        }
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}


/*
 * =========================================================
 * WHATSAPP REPORT DELIVERY
 * =========================================================
 *
 * POST /api/whatsapp/send-report
 */

export async function sendClinicalReportToWhatsApp(
  file,
  phoneNumber,
  reportData
) {

  const formData =
    new FormData();


  if (file) {

    formData.append(
      "file",
      file
    );

  }


  formData.append(
    "phone_number",
    phoneNumber
  );


  formData.append(
    "report_data",
    JSON.stringify(
      reportData
    )
  );


  try {

    const response =
      await apiClient.post(
        "/api/whatsapp/send-report",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },

          timeout:
            35000,
        }
      );

    return response.data;

  } catch (error) {

    error.userMessage =
      getApiError(error);

    throw error;
  }
}