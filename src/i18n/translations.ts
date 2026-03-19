import nl from "./nl.json";
import en from "./en.json";

const messages: Record<string, Record<string, any>> = { nl, en };

export type Locale = "nl" | "en";

export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split("/");
  return maybeLocale === "en" ? "en" : "nl";
}

export function t(locale: string, key: string): string {
  const parts = key.split(".");
  let value: any = messages[locale] || messages["nl"];
  for (const part of parts) {
    value = value?.[part];
  }
  return typeof value === "string" ? value : key;
}

export function tWithParams(
  locale: string,
  key: string,
  params: Record<string, string | number>
): string {
  let str = t(locale, key);
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}
