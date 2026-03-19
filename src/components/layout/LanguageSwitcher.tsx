interface LanguageSwitcherProps {
  locale: string;
  className?: string;
}

export default function LanguageSwitcher({
  locale,
  className = "",
}: LanguageSwitcherProps) {
  function handleSwitch(targetLocale: string) {
    if (targetLocale === locale) return;

    const pathname = window.location.pathname;

    let newPath: string;
    if (targetLocale === "en") {
      // Going from nl to en: prefix with /en
      newPath = `/en${pathname === "/" ? "" : pathname}`;
    } else {
      // Going from en to nl: remove /en prefix
      newPath = pathname.replace(/^\/en(\/|$)/, "/");
    }

    window.location.href = newPath || "/";
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-medium ${className}`}
    >
      <button
        onClick={() => handleSwitch("nl")}
        className={`transition-opacity hover:opacity-80 ${
          locale === "nl" ? "font-bold" : "opacity-60"
        }`}
        aria-label="Switch to Dutch"
      >
        NL
      </button>
      <span className="opacity-40">/</span>
      <button
        onClick={() => handleSwitch("en")}
        className={`transition-opacity hover:opacity-80 ${
          locale === "en" ? "font-bold" : "opacity-60"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
