import apiClient from "./client";

import {
  USE_DUMMY,
  DUMMY_QUALITY,
  DUMMY_ENHANCE,
  DUMMY_GRADE,
  DUMMY_REPORT,
} from "../dummy/mockData";


// ----------------------------------------
// Helper: create FormData
// ----------------------------------------

const createFormData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};


// ----------------------------------------
// 1. IMAGE QUALITY
// ----------------------------------------

export const assessQuality = async (file) => {
  // Dummy mode
  if (USE_DUMMY) {
    return DUMMY_QUALITY;
  }

  // Real API
  const response = await apiClient.post(
    "/api/quality",
    createFormData(file)
  );

  return response.data;
};


// ----------------------------------------
// 2. IMAGE ENHANCEMENT
// ----------------------------------------

export const enhanceImage = async (file) => {
  // Dummy mode
  if (USE_DUMMY) {
    return DUMMY_ENHANCE;
  }

  // Real API
  const response = await apiClient.post(
    "/api/enhance",
    createFormData(file)
  );

  return response.data;
};


// ----------------------------------------
// 3. DR GRADING
// ----------------------------------------

export const gradeImage = async (file) => {
  // Dummy mode
  if (USE_DUMMY) {
    return DUMMY_GRADE;
  }

  // Real API
  const response = await apiClient.post(
    "/api/grade",
    createFormData(file)
  );

  return response.data;
};


// ----------------------------------------
// 4. SCREENING REPORT
// ----------------------------------------

export const generateReport = async (file) => {
  // Dummy mode
  if (USE_DUMMY) {
    return DUMMY_REPORT;
  }

  // Real API
  const response = await apiClient.post(
    "/api/report",
    createFormData(file)
  );

  return response.data;
};