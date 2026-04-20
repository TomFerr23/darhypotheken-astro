import { useChat } from "./ChatContext";
import { chatT, chatTWithParams } from "./chatTranslations";

export default function ChatThanks() {
  const { lead, locale, toggleOpen } = useChat();
  const t = (key: string) => chatT(locale, key);
  const firstName = lead?.name.split(" ")[0] ?? "";

  const phone = t("thanksCallNumber");
  const email = t("thanksEmailAddress");

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-[#f4f6fa] px-6 py-10 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#80C33F]/15">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-8 w-8 text-[#80C33F]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#1c3349]">
        {chatTWithParams(locale, "thanksTitle", { name: firstName })}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-[#64748b]">{t("thanksBody")}</p>

      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1c3349] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0a1e33]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
              clipRule="evenodd"
            />
          </svg>
          {t("thanksCallLabel")}: {phone}
        </a>
        <a
          href={`mailto:${email}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm font-semibold text-[#1c3349] hover:bg-[#f1f5f9]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
          </svg>
          {t("thanksEmailLabel")}
        </a>
        <button
          onClick={toggleOpen}
          className="mt-2 text-xs text-[#64748b] hover:text-[#1c3349]"
        >
          {t("thanksClose")}
        </button>
      </div>
    </div>
  );
}
