"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Top-of-page thin progress bar that shows on every client navigation
 * (link clicks, router.push, router.back) and on form submissions.
 *
 * Mounted in the root layout so it covers BOTH the public site (article
 * clicks, listing filters, city pages) and the admin panel (form posts,
 * server actions). Purely visual — no functional impact.
 */
export default function GlobalProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pathname changed → navigation complete → fade out
  useEffect(() => {
    if (active) {
      setProgress(100);
      const t = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Intercept clicks on internal anchor tags + button[type="submit"] clicks
  useEffect(() => {
    function start() {
      setActive(true);
      setProgress(10);
      // Fake incremental progress so it feels alive
      let p = 10;
      const tick = () => {
        p = Math.min(90, p + Math.random() * 15);
        setProgress(p);
        if (p < 90) {
          timerRef.current = setTimeout(tick, 150);
        }
      };
      timerRef.current = setTimeout(tick, 150);
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link) {
        const href = link.getAttribute("href");
        const targetAttr = link.getAttribute("target");
        // Skip external links, mailto/tel, in-page anchors, modifier-clicks (open in new tab)
        if (
          href &&
          !href.startsWith("#") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          !/^https?:\/\//i.test(href) &&
          targetAttr !== "_blank" &&
          !e.metaKey && !e.ctrlKey && !e.shiftKey && !(e as any).button
        ) {
          start();
        }
        return;
      }
      const submit = target.closest('button[type="submit"]');
      if (submit) {
        start();
      }
    }

    function onSubmit() {
      start();
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <div
        className="h-[3px] bg-gradient-to-r from-[#E8705A] via-[#E60023] to-[#E8705A] transition-[width,opacity] duration-200 ease-out shadow-[0_0_10px_rgba(230,0,35,0.5)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
