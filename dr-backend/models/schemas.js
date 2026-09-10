/**
 * Mongoose Models & Schemas for RetinaTrack AI (MERN Architecture)
 * Database Connection: mongodb://localhost:27017/retinatrack_db
 */

import mongoose from "mongoose";

/* =========================================================
   1. USER SCHEMA & MODEL
   ========================================================= */
export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Patient", "Ophthalmologist", "Admin"],
      default: "Patient",
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    hospitalAffiliation: {
      type: String,
      default: "District Primary Health Center",
    },
    specialization: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   2. SCREENING REPORT SCHEMA & MODEL
   ========================================================= */
export const ReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    eye: {
      type: String,
      enum: ["right", "left", "both"],
      default: "right",
    },
    imageQuality: {
      gradable: { type: Boolean, required: true },
      qualityScore: { type: Number, required: true },
      qualityLabel: { type: String, enum: ["GRADABLE", "BORDERLINE", "UNGRADABLE"] },
      recommendation: { type: String },
    },
    drGrading: {
      level: { type: Number, min: 0, max: 4, required: true },
      label: { type: String, required: true },
      confidence: { type: Number, required: true },
      calibratedConfidence: { type: Number },
      refer: { type: Boolean, required: true },
      routing: {
        type: String,
        enum: ["ROUTINE_SCREENING", "HUMAN_REVIEW", "PRIORITY_REFERRAL"],
      },
    },
    lesions: {
      microaneurysms: { type: Number, default: 0 },
      hemorrhages: { type: Number, default: 0 },
      hardExudates: { type: Number, default: 0 },
      softExudates: { type: Number, default: 0 },
      neovascularization: { type: Boolean, default: false },
    },
    anatomy: {
      opticDiscDetected: { type: Boolean, default: true },
      foveaDetected: { type: Boolean, default: true },
    },
    imageArtifacts: {
      rawImageUrl: { type: String },
      enhancedImageUrl: { type: String },
      gradcamHeatmapUrl: { type: String },
      lesionOverlayUrl: { type: String },
    },
    clinicalNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending_review", "validated", "referred", "archived"],
      default: "validated",
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   3. SPECIALIST PROFILE SCHEMA
   ========================================================= */
export const DoctorProfileSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    credentials: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    center: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    isAvailableForTeleTriage: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
export const DoctorProfile =
  mongoose.models.DoctorProfile || mongoose.model("DoctorProfile", DoctorProfileSchema);
