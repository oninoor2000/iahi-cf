import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const baseFn = createServerFn();

/**
 * @description Get value from cookie
 * @param key - The key of the cookie
 * @returns The value of the cookie
 * @example
 * ```ts
 * const value = await getValueFromCookie("cookieName");
 * ```
 */
export const getValueFromCookieFn = baseFn
  .inputValidator((data: { key: string }) => ({ key: data.key }))
  .handler(async (ctx) => {
    const { key } = ctx.data;
    return getCookie(key);
  });

/**
 * @description Set value to cookie
 * @param key - The key of the cookie
 * @param value - The value of the cookie
 * @param options - The options for the cookie
 * @example
 * ```ts
 * await setValueToCookie("cookieName", "cookieValue", { path: "/", maxAge: 60 * 60 * 24 * 7 });
 * ```
 */
export const setValueToCookieFn = baseFn
  .inputValidator(
    (data: {
      key: string;
      value: string;
      options: { path?: string; maxAge?: number; domain?: string };
    }) => ({ key: data.key, value: data.value, options: data.options }),
  )
  .handler(async (ctx) => {
    const { key, value, options } = ctx.data;
    setCookie(key, value, {
      path: options.path ?? "/",
      maxAge: options.maxAge ?? 60 * 60 * 24 * 7, // default: 7 days
      ...(options.domain ? { domain: options.domain } : {}),
    });
  });
