// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";
import { runCommand } from "./commands";

type Entry = { input: string; lines: string[]; tone: "normal" | "error" };

/** True when a keystroke belongs to whatever the visitor is typing into. */
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

export function CommandConsole({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [recall, setRecall] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  // `~` opens from anywhere; `/` also opens, but only when not already typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (open && event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (open || isTyping(event.target) || event.metaKey || event.ctrlKey) return;
      if (event.key === "`" || event.key === "~" || event.key === "/") {
        event.preventDefault();
        restoreFocus.current = document.activeElement as HTMLElement;
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else restoreFocus.current?.focus?.();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [history]);

  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const input = value.trim();
      if (!input) return;

      const output = runCommand(input, {
        locale,
        dict,
        navigate: (href) => {
          setOpen(false);
          router.push(href);
        },
        clear: () => setHistory([]),
      });

      setHistory((prev) => [
        ...prev,
        { input, lines: output?.lines ?? [], tone: output?.tone ?? "normal" },
      ]);
      setValue("");
      setRecall(null);
    },
    [value, locale, dict, router],
  );

  /**
   * Keeps Tab inside the dialog.
   *
   * `aria-modal` is a promise to assistive technology that the rest of the
   * page is unreachable; without this the very next Tab lands on the page
   * behind, and the promise is a lie. Today the console holds exactly one
   * focusable element, so this almost always just swallows the key — the
   * cycling branch is here so it stays correct when it holds two.
   */
  const trapFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;

    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const edge = event.shiftKey ? first : last;
    if (document.activeElement !== edge && focusable.length > 1) return;

    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  };

  /** Up/down walk previously entered commands, as a shell would. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    if (history.length === 0) return;
    event.preventDefault();

    // `recall` indexes into history; null means "at the empty prompt".
    const from = recall ?? history.length;
    const next = event.key === "ArrowUp" ? from - 1 : from + 1;

    if (next < 0) return;
    if (next >= history.length) {
      setRecall(null);
      setValue("");
      return;
    }
    setRecall(next);
    setValue(history[next].input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          restoreFocus.current = document.activeElement as HTMLElement;
          setOpen(true);
        }}
        aria-label={dict.console.open}
        className="fixed bottom-5 left-5 z-40 flex h-9 w-9 items-center justify-center border border-line bg-void/80 text-dim backdrop-blur-sm transition-colors hover:border-signal hover:text-signal"
      >
        <TerminalSquare size={15} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[70] flex items-start justify-center bg-void/80 px-4 pt-[12vh] backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={dict.console.title}
              onKeyDown={trapFocus}
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl border border-line bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">
                  {dict.console.title}
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-dim">
                  {dict.console.hint}
                </span>
              </div>

              {/* Focusable on purpose: it scrolls, and the focus trap below
                  only cycles what it can find — an unlisted scroll region
                  would be one a keyboard could never reach. */}
              <div
                ref={logRef}
                tabIndex={0}
                role="log"
                aria-live="polite"
                aria-label={dict.console.title}
                className="max-h-[46vh] overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
              >
                {history.map((entry, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-dim">
                      <span className="text-signal">$</span> {entry.input}
                    </p>
                    {entry.lines.map((line, j) => (
                      <p
                        key={j}
                        className={`whitespace-pre-wrap ${
                          entry.tone === "error" ? "text-alert" : "text-bone/80"
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <form
                onSubmit={submit}
                className="flex items-center gap-2 border-t border-line px-4 py-3"
              >
                <span aria-hidden="true" className="font-mono text-sm text-signal">
                  $
                </span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  onKeyDown={onKeyDown}
                  aria-label={dict.console.placeholder}
                  placeholder={dict.console.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-sm text-bone outline-none placeholder:text-dim/60"
                />
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
