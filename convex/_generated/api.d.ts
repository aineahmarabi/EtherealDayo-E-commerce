/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as brands from "../brands.js";
import type * as customers from "../customers.js";
import type * as discountCodes from "../discountCodes.js";
import type * as inquiries from "../inquiries.js";
import type * as orders from "../orders.js";
import type * as pageViews from "../pageViews.js";
import type * as products from "../products.js";
import type * as search from "../search.js";
import type * as settings from "../settings.js";
import type * as shipping from "../shipping.js";
import type * as uploads from "../uploads.js";
import type * as variants from "../variants.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  brands: typeof brands;
  customers: typeof customers;
  discountCodes: typeof discountCodes;
  inquiries: typeof inquiries;
  orders: typeof orders;
  pageViews: typeof pageViews;
  products: typeof products;
  search: typeof search;
  settings: typeof settings;
  shipping: typeof shipping;
  uploads: typeof uploads;
  variants: typeof variants;
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
