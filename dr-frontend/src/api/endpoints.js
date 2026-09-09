import apiClient from "./client";

import {
  USE_DUMMY,
  DUMMY_QUALITY,
  DUMMY_BORDERLINE_QUALITY,
  DUMMY_UNGRADABLE_QUALITY,
  DUMMY_ENHANCE,
  DUMMY_GRADE,
  DUMMY_HUMAN_REVIEW,
  DUMMY_REPORT,
} from "../dummy/mockData";


/* =========================================================
   IMAGE QUALITY
   ========================================================= */

export async function checkQuality(file) {
  if (USE_DUMMY) {
    await delay(500);

    const filename =
      file?.name?.toLowerCase() || "";


    /* -----------------------------------------------
       API ERROR TEST
       ----------------------------------------------- */

    if (
      filename.includes("api-error") ||
      filename.includes("error")
    ) {
      const error = new Error(
        "Screening service is temporarily unavailable."
      );

      error.code = "ERR_BAD_RESPONSE";

      error.response = {
        status: 500,

        data: {
          detail:
            "Screening service is temporarily unavailable.",
        },
      };

      throw error;
    }


    /* -----------------------------------------------
       TIMEOUT TEST
       ----------------------------------------------- */

    if (
      filename.includes("timeout")
    ) {
      const error = new Error(
        "The screening service timed out. Please try again."
      );

      error.code = "ECONNABORTED";

      error.request = {};

      throw error;
    }


    /* -----------------------------------------------
       UNGRADABLE TEST IMAGE
       ----------------------------------------------- */

    if (
      filename.includes("ungradable") ||
      filename.includes("reject") ||
      filename.includes("poor")
    ) {
      return {
        ...DUMMY_UNGRADABLE_QUALITY,
      };
    }


    /* -----------------------------------------------
       BORDERLINE TEST IMAGE
       ----------------------------------------------- */

    if (
      filename.includes("borderline") ||
      filename.includes("usable")
    ) {
      return {
        ...DUMMY_BORDERLINE_QUALITY,
      };
    }


    /* -----------------------------------------------
       NORMAL GRADABLE IMAGE
       ----------------------------------------------- */

    return {
      ...DUMMY_QUALITY,
    };
  }


  /* -----------------------------------------------
     REAL BACKEND
     ----------------------------------------------- */

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await apiClient.post(
      "/api/quality",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
}


/* =========================================================
   IMAGE ENHANCEMENT
   ========================================================= */

export async function enhanceImage(file) {
  if (USE_DUMMY) {
    await delay(700);

    return {
      ...DUMMY_ENHANCE,
    };
  }


  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await apiClient.post(
      "/api/enhance",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
}


/* =========================================================
   DR GRADING
   ========================================================= */

export async function gradeImage(file) {
  if (USE_DUMMY) {
    await delay(900);

    const filename =
      file?.name?.toLowerCase() || "";


    /* -----------------------------------------------
       HUMAN REVIEW TEST
       ----------------------------------------------- */

    if (
      filename.includes("human-review") ||
      filename.includes("human_review") ||
      filename.includes("review")
    ) {
      return {
        ...DUMMY_HUMAN_REVIEW,
      };
    }


    /* -----------------------------------------------
       NORMAL GRADING
       ----------------------------------------------- */

    return {
      ...DUMMY_GRADE,
    };
  }


  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await apiClient.post(
      "/api/grade",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
}


/* =========================================================
   SCREENING REPORT
   ========================================================= */

export async function generateReport(file) {
  if (USE_DUMMY) {
    await delay(800);

    return {
      ...DUMMY_REPORT,

      generated_at:
        new Date().toISOString(),
    };
  }


  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await apiClient.post(
      "/api/report",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
}


/* =========================================================
   SMALL DELAY FOR DEMO PIPELINE
   ========================================================= */

function delay(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

/* =========================================================
   CLINICAL REPORT PDF
   ========================================================= */

export async function generateClinicalReportPdf(file, reportData) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  formData.append("report_data", JSON.stringify(reportData));

  const response = await apiClient.post(
    "/api/report/pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
      timeout: 35000,
    }
  );

  return response.data;
}


/* =========================================================
   WHATSAPP NUMBER VALIDATION
   ========================================================= */

export async function validateWhatsAppNumber(phoneNumber) {
  const response = await apiClient.post(
    "/api/whatsapp/validate",
    {
      phone_number: phoneNumber,
    }
  );

  return response.data;
}


/* =========================================================
   WHATSAPP CLINICAL REPORT DELIVERY
   ========================================================= */

export async function sendClinicalReportToWhatsApp(
  file,
  phoneNumber,
  reportData
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  formData.append("phone_number", phoneNumber);
  formData.append("report_data", JSON.stringify(reportData));

  const response = await apiClient.post(
    "/api/whatsapp/send-report",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 35000,
    }
  );

  return response.data;
}
