import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChatProvider, useChat } from "./ChatContext";
import ChatPanel from "./ChatPanel";

/**
 * Lock the underlying page from scrolling while the sheet is open on mobile.
 * Desktop keeps normal scroll since the chat is a floating card and the user
 * may want to reference the page content behind it.
 *
 * iOS Safari ignores `overflow: hidden` on <body> for rubber-band gestures.
 * The bulletproof pattern: pin the body with `position: fixed` at its
 * current scroll offset while the sheet is open, then restore on close.
 */
function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    // Only lock on mobile (<= 767px to match the sheet breakpoint)
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    // Snapshot prev styles so we can restore exactly on close
    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      body.style.touchAction = prev.bodyTouchAction;
      html.style.overflow = prev.htmlOverflow;
      // Restore the scroll position the user was at before opening the sheet
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

function ChatFab() {
  const { isOpen, toggleOpen } = useChat();
  useBodyScrollLock(isOpen);

  return (
    <>
      {/* FAB — hidden while panel is open on mobile so it doesn't cover the sheet */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#80C33F] text-white shadow-lg transition-all hover:bg-[#6daa33] hover:shadow-xl active:scale-95 ${
          isOpen ? "max-md:hidden" : ""
        }`}
        aria-label="Chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Scrim — only on mobile. Fades in behind the sheet, tap to
                dismiss. touch-action: none on the scrim makes sure vertical
                drags on it don't leak to the page underneath. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleOpen}
              style={{ touchAction: "none" }}
              className="fixed inset-0 z-[55] bg-black/40 md:hidden"
              aria-hidden
            />

            {/* Panel —
               Desktop: floating card top-right of the FAB (400×640).
               Mobile: bottom sheet pinned to bottom, 88dvh so the page peeks above. */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed bottom-24 right-6 z-[60] flex w-[400px] h-[640px] max-h-[calc(100dvh-120px)] max-md:inset-x-0 max-md:bottom-0 max-md:right-auto max-md:w-full max-md:h-[100dvh] max-md:max-h-[100dvh]"
            >
              <ChatPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ChatWidget({ locale = "nl" }: { locale?: string }) {
  return (
    <ChatProvider locale={locale}>
      <ChatFab />
    </ChatProvider>
  );
}
