"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useTransition, type ReactNode, type MouseEvent } from "react";

export type Direction = "nav-forward" | "nav-back";

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  direction?: Direction;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

type Resolver = () => void;
let pendingResolvers: Resolver[] = [];

/**
 * Computes natural directional transition based on source and destination routes.
 */
export function computeDirection(fromPath: string, toPath: string): Direction {
  if (toPath === "/" && fromPath !== "/") return "nav-back";
  if (toPath === "/modules" && fromPath.startsWith("/modules/m")) return "nav-back";

  // Check module numbering (e.g. /modules/m3-... vs /modules/m2-...)
  const fromMatch = fromPath.match(/\/modules\/m(\d+)/);
  const toMatch = toPath.match(/\/modules\/m(\d+)/);
  if (fromMatch && toMatch) {
    const fromNum = parseInt(fromMatch[1], 10);
    const toNum = parseInt(toMatch[1], 10);
    if (toNum < fromNum) return "nav-back";
    if (toNum > fromNum) return "nav-forward";
  }

  // Hierarchy order
  const order = ["/", "/modules", "/prelab", "/notebook", "/analisis", "/laporan", "/referensi"];
  const fromIdx = order.findIndex((p) => p === fromPath || (p !== "/" && fromPath.startsWith(p)));
  const toIdx = order.findIndex((p) => p === toPath || (p !== "/" && toPath.startsWith(p)));

  if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
    return "nav-back";
  }

  return "nav-forward";
}

/**
 * Resolves any pending View Transitions once the new page is mounted.
 */
export function resolvePendingTransitions() {
  const list = pendingResolvers.splice(0, pendingResolvers.length);
  for (const resolve of list) {
    try {
      resolve();
    } catch {
      // ignore
    }
  }
}

/**
 * Safely executes a View Transition, ensuring that browser AbortErrors
 * (e.g., when transitions are interrupted or skipped during quick clicks/traversals)
 * are cleanly handled and never cause unhandled promise rejections.
 */
export function safeStartViewTransition(
  callback: () => Promise<void> | void,
  onFinished?: () => void
) {
  if (typeof document === "undefined" || typeof document.startViewTransition !== "function") {
    callback();
    onFinished?.();
    return;
  }

  try {
    const transition = document.startViewTransition(callback);

    // Suppress benign AbortError rejections on all ViewTransition promise channels
    transition.ready?.catch(() => {});
    transition.updateCallbackDone?.catch(() => {});
    transition.finished
      ?.catch(() => {})
      .finally(() => {
        onFinished?.();
      });

    return transition;
  } catch {
    // If startViewTransition synchronously throws (e.g. document not active)
    callback();
    onFinished?.();
  }
}

/**
 * Client watcher component that listens for pathname changes, popstate (browser back/forward),
 * the HTML Navigation API (for Chrome/Edge back button traversal), and keyboard Back shortcuts (Backspace / Alt+Left).
 * Coordinates reversible two-way View Transitions smoothly with Next.js.
 */
export function TransitionWatcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Resolve any active view transition when the new route commits to the DOM
  useEffect(() => {
    resolvePendingTransitions();
  }, [pathname]);

  // Suppress benign AbortError in the window unhandledrejection event
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason?.name === "AbortError" ||
        reason?.message?.includes("Transition was skipped") ||
        reason?.message?.includes("The operation was aborted") ||
        String(reason).includes("Transition was skipped")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);

  // Handle browser Back / Forward events (Navigation API + popstate fallback + keyboard shortcuts)
  useEffect(() => {
    let activeVt: any = null;

    // 1. Navigation API (Modern Chromium - Chrome, Edge) for Browser Back / Forward buttons
    const handleNavigate = (event: any) => {
      // ONLY intercept browser back / forward traversal history events
      if (event.navigationType !== "traverse") return;
      if (!event.canIntercept || event.downloadRequest || event.formData) return;

      const currentIdx = (window as any).navigation?.currentEntry?.index ?? 0;
      const targetIdx = event.destination.index ?? 0;
      const isBack = targetIdx <= currentIdx;

      const direction: Direction = isBack ? "nav-back" : "nav-forward";
      const root = document.documentElement;

      if (typeof document.startViewTransition === "function") {
        event.intercept({
          scroll: "manual",
          async handler() {
            root.classList.remove("nav-forward", "nav-back");
            root.classList.add(direction);

            activeVt = safeStartViewTransition(
              () =>
                new Promise<void>((resolve) => {
                  const wrappedResolve = () => {
                    resolve();
                  };
                  pendingResolvers.push(wrappedResolve);
                  setTimeout(wrappedResolve, 800);
                }),
              () => {
                root.classList.remove(direction);
              }
            );

            try {
              if (activeVt?.finished) await activeVt.finished;
            } catch {
              // ignore
            }
          },
        });
      }
    };

    if (typeof window !== "undefined" && "navigation" in window) {
      (window as any).navigation.addEventListener("navigate", handleNavigate);
    }

    // 2. Standard popstate fallback (Firefox / Safari / older browsers)
    const handlePopState = () => {
      const root = document.documentElement;
      root.classList.remove("nav-forward");
      root.classList.add("nav-back");

      if (typeof document.startViewTransition === "function" && !activeVt) {
        safeStartViewTransition(
          () =>
            new Promise<void>((resolve) => {
              const wrappedResolve = () => {
                resolve();
              };
              pendingResolvers.push(wrappedResolve);
              setTimeout(wrappedResolve, 1200);
            }),
          () => {
            root.classList.remove("nav-back");
          }
        );
      }
    };

    window.addEventListener("popstate", handlePopState);

    // 3. Keyboard Back Shortcuts (Backspace or Alt + ArrowLeft when not in form inputs)
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const activeTag = activeEl?.tagName?.toLowerCase();
      const isEditable =
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select" ||
        activeEl?.hasAttribute("contenteditable") ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isEditable) return;

      if (e.key === "Backspace" || (e.altKey && e.key === "ArrowLeft")) {
        if (window.location.pathname !== "/") {
          e.preventDefault();
          triggerBackTransition(router, "/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (typeof window !== "undefined" && "navigation" in window) {
        (window as any).navigation.removeEventListener("navigate", handleNavigate);
      }
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return null;
}

/**
 * Triggers a smooth reversed View Transition to go back in browser history.
 */
export function triggerBackTransition(router: ReturnType<typeof useRouter>, fallbackHref: string = "/") {
  const root = document.documentElement;
  root.classList.remove("nav-forward", "nav-back");
  root.classList.add("nav-back");

  if (typeof document.startViewTransition !== "function") {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
    return;
  }

  safeStartViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const wrappedResolve = () => {
          resolve();
        };

        pendingResolvers.push(wrappedResolve);

        setTimeout(wrappedResolve, 1200);

        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }),
    () => {
      root.classList.remove("nav-back");
    }
  );
}

/**
 * Anchor that drives a directional route transition.
 *
 * Uses the View Transitions API synchronized with Next.js App Router navigation.
 * Pre-fetches the route on hover for instantaneous responsiveness and applies
 * smooth slide and crossfade animations. Direction is automatically detected
 * (or can be explicitly passed as 'nav-forward' or 'nav-back').
 */
export function TransitionLink({
  href,
  direction,
  className,
  children,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const resolvedDirection = direction ?? computeDirection(pathname, href);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (onClick) onClick(e);

    // Let the browser own new-tab / modified / non-primary clicks.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || e.defaultPrevented) return;
    e.preventDefault();

    if (pathname === href) {
      return;
    }

    const root = document.documentElement;

    if (typeof document.startViewTransition !== "function") {
      startTransition(() => {
        router.push(href);
      });
      return;
    }

    // Clean up any stale classes and set current direction
    root.classList.remove("nav-forward", "nav-back");
    root.classList.add(resolvedDirection);

    safeStartViewTransition(
      () =>
        new Promise<void>((resolve) => {
          const wrappedResolve = () => {
            resolve();
          };

          pendingResolvers.push(wrappedResolve);

          // Fallback safety timeout if route update doesn't trigger a pathname change
          setTimeout(wrappedResolve, 1200);

          startTransition(() => {
            router.push(href);
          });
        }),
      () => {
        root.classList.remove(resolvedDirection);
      }
    );
  }

  function handlePointerEnter() {
    try {
      router.prefetch(href);
    } catch {
      // ignore
    }
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      {...rest}
    >
      {children}
    </a>
  );
}

interface BackButtonProps {
  fallbackHref?: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

/**
 * Dedicated back button that triggers a reversed 'nav-back' transition.
 */
export function BackButton({
  fallbackHref = "/",
  className,
  children,
  ...rest
}: BackButtonProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleBack(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const root = document.documentElement;

    if (typeof document.startViewTransition !== "function") {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackHref);
      }
      return;
    }

    root.classList.remove("nav-forward", "nav-back");
    root.classList.add("nav-back");

    safeStartViewTransition(
      () =>
        new Promise<void>((resolve) => {
          const wrappedResolve = () => {
            resolve();
          };

          pendingResolvers.push(wrappedResolve);

          setTimeout(wrappedResolve, 1200);

          startTransition(() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push(fallbackHref);
            }
          });
        }),
      () => {
        root.classList.remove("nav-back");
      }
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleBack}
      {...rest}
    >
      {children || (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-container)]">
          <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Kembali</span>
        </span>
      )}
    </button>
  );
}