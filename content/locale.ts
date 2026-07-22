// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

export const locales = ["en", "tr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** A value that exists in every supported language. */
export type L10n<T> = Record<Locale, T>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Pick the localized side of an `L10n` value. */
export function t<T>(value: L10n<T>, locale: Locale): T {
  return value[locale];
}
