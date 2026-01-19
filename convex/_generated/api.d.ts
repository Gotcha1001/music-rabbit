/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as availability from "../availability.js";
import type * as bookCategories from "../bookCategories.js";
import type * as books from "../books.js";
import type * as crons from "../crons.js";
import type * as globalMessages from "../globalMessages.js";
import type * as inviteCodes from "../inviteCodes.js";
import type * as lessonManagement from "../lessonManagement.js";
import type * as lessonRatings from "../lessonRatings.js";
import type * as messages from "../messages.js";
import type * as payments from "../payments.js";
import type * as recordings from "../recordings.js";
import type * as schedules from "../schedules.js";
import type * as stats from "../stats.js";
import type * as storage from "../storage.js";
import type * as studentPackages from "../studentPackages.js";
import type * as tutorMemos from "../tutorMemos.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  availability: typeof availability;
  bookCategories: typeof bookCategories;
  books: typeof books;
  crons: typeof crons;
  globalMessages: typeof globalMessages;
  inviteCodes: typeof inviteCodes;
  lessonManagement: typeof lessonManagement;
  lessonRatings: typeof lessonRatings;
  messages: typeof messages;
  payments: typeof payments;
  recordings: typeof recordings;
  schedules: typeof schedules;
  stats: typeof stats;
  storage: typeof storage;
  studentPackages: typeof studentPackages;
  tutorMemos: typeof tutorMemos;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
