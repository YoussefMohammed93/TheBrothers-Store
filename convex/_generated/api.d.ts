/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as about from "../about.js";
import type * as analytics from "../analytics.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as contact from "../contact.js";
import type * as coupons from "../coupons.js";
import type * as features from "../features.js";
import type * as files from "../files.js";
import type * as footer from "../footer.js";
import type * as header from "../header.js";
import type * as hero from "../hero.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as newsletter from "../newsletter.js";
import type * as orders from "../orders.js";
import type * as partners from "../partners.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as settings from "../settings.js";
import type * as terms from "../terms.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  about: typeof about;
  analytics: typeof analytics;
  cart: typeof cart;
  categories: typeof categories;
  contact: typeof contact;
  coupons: typeof coupons;
  features: typeof features;
  files: typeof files;
  footer: typeof footer;
  header: typeof header;
  hero: typeof hero;
  http: typeof http;
  migrations: typeof migrations;
  newsletter: typeof newsletter;
  orders: typeof orders;
  partners: typeof partners;
  products: typeof products;
  reviews: typeof reviews;
  settings: typeof settings;
  terms: typeof terms;
  users: typeof users;
  wishlist: typeof wishlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
