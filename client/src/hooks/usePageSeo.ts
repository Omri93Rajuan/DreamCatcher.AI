import { useEffect } from "react";
import type { SeoDescriptor } from "@/lib/seo";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
}

function upsertCanonical(href: string) {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.rel = "canonical";
    document.head.appendChild(node);
  }
  node.href = href;
}

function upsertJsonLd(jsonLd?: unknown) {
  const id = "page-jsonld";
  const existing = document.getElementById(id);

  if (!jsonLd) {
    existing?.remove();
    return;
  }

  const node =
    existing ||
    Object.assign(document.createElement("script"), {
      id,
      type: "application/ld+json",
    });

  node.textContent = JSON.stringify(jsonLd);
  if (!existing) document.head.appendChild(node);
}

export function usePageSeo(seo: SeoDescriptor) {
  useEffect(() => {
    document.title = seo.title;
    document.head
      .querySelectorAll('meta[data-page-seo="property"]')
      .forEach((node) => node.remove());

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: seo.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: seo.robots || "index, follow",
    });
    upsertCanonical(seo.canonical);

    for (const [property, content] of Object.entries(seo.openGraph || {})) {
      if (!content) continue;
      upsertMeta(`meta[property="${property}"]`, {
        property,
        content,
        "data-page-seo": "property",
      });
    }

    upsertJsonLd(seo.jsonLd);
  }, [seo]);
}
