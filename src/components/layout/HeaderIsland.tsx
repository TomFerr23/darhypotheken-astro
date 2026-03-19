import { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderIslandProps {
  items: { href: string; label: string }[];
  aanmeldenHref: string;
  aanmeldenText: string;
  locale: string;
}

export default function HeaderIsland({
  items,
  aanmeldenHref,
  aanmeldenText,
  locale,
}: HeaderIslandProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible only below nav breakpoint */}
      <button
        className="flex flex-col gap-1.5 nav:hidden"
        onClick={() => setOpen(true)}
        aria-label={locale === "nl" ? "Menu openen" : "Open menu"}
      >
        <span className="block h-0.5 w-6 bg-dar-cream" />
        <span className="block h-0.5 w-6 bg-dar-cream" />
        <span className="block h-0.5 w-6 bg-dar-cream" />
      </button>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-[60] bg-dar-navy transition-transform duration-300 ease-in-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="text-3xl text-dar-cream"
              aria-label={locale === "nl" ? "Menu sluiten" : "Close menu"}
            >
              &times;
            </button>
          </div>

          <nav className="mt-16 flex flex-col gap-8">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-semibold text-dar-cream"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={aanmeldenHref}
            onClick={() => setOpen(false)}
            className="mt-10 block rounded-full bg-dar-green px-5 py-3 text-center text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            {aanmeldenText}
          </a>

          <div className="mt-8">
            <LanguageSwitcher locale={locale} className="text-dar-cream text-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
