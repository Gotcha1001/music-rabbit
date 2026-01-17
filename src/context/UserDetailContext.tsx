// import { createContext, useContext } from "react";
// import { Id } from "../../convex/_generated/dataModel";

// // Match the actual Convex user schema
// export interface UserDetail {
//   _id: Id<"users">;
//   _creationTime: number;
//   clerkId: string;
//   role: "admin" | "teacher" | "student";
//   email: string;
//   instrument?: string;
//   tokenIdentifier: string;
// }

// export const UserDetailContext = createContext<
//   | {
//       userDetail: UserDetail | undefined;
//       setUserDetail: React.Dispatch<
//         React.SetStateAction<UserDetail | undefined>
//       >;
//     }
//   | undefined
// >(undefined);

// export const useUserDetail = () => {
//   const context = useContext(UserDetailContext);
//   if (!context)
//     throw new Error("useUserDetail must be used within UserDetailProvider");
//   return context;
// };

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

  // THESE 3 WERE MISSING — ADD THEM NOW
  timezone?: string;
  country?: string;
  state?: string;
}

export const UserDetailContext = createContext<
  | {
      userDetail: UserDetail | null; // ← better: null instead of undefined
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
