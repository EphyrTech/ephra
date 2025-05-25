import apiClient, { ApiError } from "./client";
import authService from "./auth";
import userService from "./user";
import journalService from "./journal";
import appointmentService from "./appointment";
import mediaService from "./media";
import specialistService from "./specialist";

// Export all services
export {
  apiClient,
  ApiError,
  authService,
  userService,
  journalService,
  appointmentService,
  mediaService,
  specialistService,
};

// Export types
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "./auth";
export type { UserProfile, ProfileUpdateData } from "./user";
export type { JournalEntry } from "./journal";
export type { Appointment } from "./appointment";
export type { Specialist, Availability } from "./specialist";
export type { MediaFile, UploadResponse } from "./media";
