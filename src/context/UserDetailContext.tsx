"use client";
// context/UserDetailContext.tsx
import { createContext, useContext } from "react";
import { Id } from "../../convex/_generated/dataModel";

// This matches your actual Convex "users" table + all fields you use
export interface UserDetail {
  _id: Id<"users">;
  _creationTime: number;
  clerkId: string;
  role: "admin" | "teacher" | "student";
  email: string;
  name?: string;
  imageUrl?: string;
  instrument?: string;
  currentTeacher?: Id<"users">;
  tokenIdentifier: string;
  zoomLink?: string;

  // Timezone & location fields (already present)
  timezone?: string;
  country?: string;
  state?: string;

  // Teacher-specific profile fields
  degree?: string;
  institution?: string;
  bio?: string;
  specialties?: string[];
  hourlyRate?: number;

  // NEW: Phone / WhatsApp contact fields
  countryCode?: string; // e.g. "+27", "+1", "+44"
  phoneNumber?: string; // e.g. "821234567", "5551234567"
}

export const UserDetailContext = createContext<
  | {
      userDetail: UserDetail | null;
      setUserDetail: React.Dispatch<React.SetStateAction<UserDetail | null>>;
    }
  | undefined
>(undefined);

export const useUserDetail = () => {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error("useUserDetail must be used within UserDetailProvider");
  }
  return context;
};
