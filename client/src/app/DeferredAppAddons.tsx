import { lazy, Suspense, useEffect, useState } from "react";

const AccessibilityToolbar = lazy(
  () => import("../components/accessibility/AccessibilityToolbar")
);
const ToastViewport = lazy(() => import("../components/feedback/ToastViewport"));

const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 800;

function useIdleReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout?: number }
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (win.requestIdleCallback) {
      const handle = win.requestIdleCallback(() => setReady(true), {
        timeout: IDLE_TIMEOUT_MS,
      });
      return () => win.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(() => setReady(true), FALLBACK_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, []);

  return ready;
}

export default function DeferredAppAddons() {
  const ready = useIdleReady();

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <ToastViewport />
      <AccessibilityToolbar />
    </Suspense>
  );
}
