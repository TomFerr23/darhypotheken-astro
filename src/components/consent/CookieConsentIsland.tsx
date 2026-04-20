import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cT } from "./consentTranslations";
import { CONSENT_OPEN_EVENT, type ConsentCategories } from "@/lib/consent/types";
import {
  defaultCategories,
  readConsent,
  writeConsent,
} from "@/lib/consent/storage";

type Phase = "idle" | "banner" | "settings";

export default function CookieConsentIsland({
  locale = "nl",
}: {
  locale?: string;
}) {
  const t = useCallback((key: string) => cT(locale, key), [locale]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [categories, setCategories] = useState<ConsentCategories>(
    defaultCategories(),
  );

  // On mount: check whether we have a valid consent record. If not, show the
  // banner. Either way, expose a reopener via a custom event.
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setPhase("banner");
    } else {
      setCategories(existing.categories);
    }

    const openHandler = () => {
      const latest = readConsent();
      if (latest) setCategories(latest.categories);
      setPhase("settings");
    };
    window.addEventListener(CONSENT_OPEN_EVENT, openHandler);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openHandler);
  }, []);

  const close = () => setPhase("idle");

  const acceptAll = () => {
    const next: ConsentCategories = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setCategories(next);
    writeConsent(next);
    close();
  };

  const rejectAll = () => {
    const next = defaultCategories();
    setCategories(next);
    writeConsent(next);
    close();
  };

  const saveCustom = () => {
    writeConsent(categories);
    close();
  };

  const toggle = (key: keyof ConsentCategories) => {
    if (key === "essential") return;
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const catDefs = useMemo(
    () => [
      {
        key: "essential" as const,
        title: t("catEssentialTitle"),
        desc: t("catEssentialDesc"),
        locked: true,
      },
      {
        key: "analytics" as const,
        title: t("catAnalyticsTitle"),
        desc: t("catAnalyticsDesc"),
        locked: false,
      },
      {
        key: "marketing" as const,
        title: t("catMarketingTitle"),
        desc: t("catMarketingDesc"),
        locked: false,
      },
      {
        key: "preferences" as const,
        title: t("catPreferencesTitle"),
        desc: t("catPreferencesDesc"),
        locked: false,
      },
    ],
    [t],
  );

  if (phase === "idle") return null;

  return (
    <AnimatePresence>
      {phase === "banner" && (
        <motion.div
          key="banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="dar-cookie-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-3 sm:px-4 sm:pb-4"
        >
          <div className="w-full max-w-[680px] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 sm:p-5">
            <p
              id="dar-cookie-title"
              className="text-sm font-semibold text-[#1c3349]"
            >
              {t("bannerTitle")}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
              {t("bannerBody")}{" "}
              <a
                href={t("privacyLinkHref")}
                className="underline hover:text-[#060097]"
              >
                {t("privacyLink")}
              </a>
              .
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={rejectAll}
                className="rounded-xl bg-[#1c3349] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2336]"
              >
                {t("rejectAll")}
              </button>
              <button
                onClick={acceptAll}
                className="rounded-xl bg-[#1c3349] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2336]"
              >
                {t("acceptAll")}
              </button>
            </div>
            <button
              onClick={() => setPhase("settings")}
              className="mt-3 text-xs font-medium text-[#060097] underline hover:no-underline"
            >
              {t("customize")}
            </button>
          </div>
        </motion.div>
      )}

      {phase === "settings" && (
        <motion.div
          key="settings"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dar-cookie-settings-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-0 sm:items-center sm:px-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[88dvh] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
              <p
                id="dar-cookie-settings-title"
                className="text-base font-semibold text-[#1c3349]"
              >
                {t("modalTitle")}
              </p>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9]"
                aria-label={t("modalCancel")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-xs leading-relaxed text-[#475569]">
                {t("modalIntro")}
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {catDefs.map((cat) => {
                  const enabled = categories[cat.key];
                  return (
                    <div
                      key={cat.key}
                      className="flex items-start justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1c3349]">
                          {cat.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                          {cat.desc}
                        </p>
                      </div>
                      {cat.locked ? (
                        <span className="mt-0.5 shrink-0 rounded-full bg-[#1c3349]/10 px-2.5 py-1 text-[11px] font-medium text-[#1c3349]">
                          {t("catEssentialLocked")}
                        </span>
                      ) : (
                        <button
                          role="switch"
                          aria-checked={enabled}
                          onClick={() => toggle(cat.key)}
                          className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                            enabled ? "bg-[#80C33F]" : "bg-[#cbd5e1]"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              enabled ? "translate-x-[22px]" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e2e8f0] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
              <button
                onClick={rejectAll}
                className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c3349] hover:bg-[#f1f5f9]"
              >
                {t("rejectAll")}
              </button>
              <button
                onClick={acceptAll}
                className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c3349] hover:bg-[#f1f5f9]"
              >
                {t("acceptAll")}
              </button>
              <button
                onClick={saveCustom}
                className="rounded-xl bg-[#80C33F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6daa33]"
              >
                {t("modalSave")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
