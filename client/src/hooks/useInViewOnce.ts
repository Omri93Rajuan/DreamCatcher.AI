import { useEffect, useRef, useState } from "react";

type Options = {
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInViewOnce<T extends HTMLElement>(options?: Options) {
  const rootMargin = options?.rootMargin ?? "200px";
  const threshold = options?.threshold ?? 0.1;
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isInView, rootMargin, threshold]);

  return { ref, isInView };
}
