"use client";

import { useEffect, useRef } from "react";

interface MainProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Client wrapper for <main> — sets up IntersectionObserver to add `.visible`
 * to every `.fade-in` element when it enters the viewport. A MutationObserver
 * picks up new elements after client-side navigation (App Router soft nav).
 */
export default function Main({ children, className, id }: MainProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const observe = (root: Element) => {
      root.querySelectorAll(".fade-in:not(.visible)").forEach((t) => io.observe(t));
    };

    // Observe existing elements on mount
    observe(el);

    // Pick up elements added during soft navigation
    const mo = new MutationObserver(() => observe(el));
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <main ref={ref} id={id} className={className}>
      {children}
    </main>
  );
}
