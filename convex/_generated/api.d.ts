/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as books from "../books.js";
import type * as inviteCodes from "../inviteCodes.js";
import type * as messages from "../messages.js";
import type * as payments from "../payments.js";
import type * as recordings from "../recordings.js";
import type * as schedules from "../schedules.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  books: typeof books;
  inviteCodes: typeof inviteCodes;
  messages: typeof messages;
  payments: typeof payments;
  recordings: typeof recordings;
  schedules: typeof schedules;
  storage: typeof storage;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
