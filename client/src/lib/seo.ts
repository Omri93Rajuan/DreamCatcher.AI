import articlesData from "@/components/articles/articlesData.json";
import { resolveArticleCover } from "@/components/articles/coverImages";
import logoUrl from "@/assets/logo.webp";
import type { Article } from "@/lib/api/types";
import { stripMarkdown } from "@/lib/utils/articlesUtils";
import { getArticleSeoEnhancement } from "@/lib/articleSeoEnhancements";

export const SITE_URL = "https://dreamaicatcher.com";
export const SITE_NAME = "DreamCatcher.AI";
const DEFAULT_ROBOTS =
  "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
const JEWISH_DREAM_KEYWORDS = [
  "פירוש חלומות לפי היהדות",
  "פתרון חלומות לפי היהדות",
  "פירוש חלומות ביהדות",
  "חלום לפי היהדות",
  "פירוש חלומות לפי חז\"ל",
  "פירוש חלומות לפי הקבלה",
  "פתרון חלומות בעברית",
  "מה אומר החלום שלי",
  "פענוח חלומות",
  "משמעות חלומות",
  "חלומות ביהדות",
  "בינה מלאכותית לחלומות",
];
const ISRAEL_AUDIENCE_KEYWORDS = [
  "פירוש חלומות לישראלים",
  "פירוש חלומות ליהודים",
  "פירוש חלומות בעברית",
  "חלומות לפי מסורת ישראל",
  "משמעות חלומות ביהדות",
];
const DEFAULT_META = {
  language: "he-IL",
  "geo.region": "IL",
  "geo.placename": "Israel",
  audience: "ישראלים יהודים שמחפשים פירוש חלומות לפי היהדות",
};

export type SeoDescriptor = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  robots?: string;
  meta?: Record<string, string | undefined>;
  openGraph?: Record<string, string | undefined>;
  twitter?: Record<string, string | undefined>;
  jsonLd?: unknown;
};

export const allArticles = articlesData as Article[];

function cleanDescription(text: string, maxLength = 160) {
  const clean = stripMarkdown(text).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, SITE_URL)
    .href;
}

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function articleWordCount(article: Article) {
  return stripMarkdown(article.content)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
}

function articleReadingTimeIso(article: Article) {
  const minutes = Math.max(1, Math.ceil(articleWordCount(article) / 220));
  return `PT${minutes}M`;
}

function keywordThings(values: string[]) {
  return uniqueStrings(values).map((name) => ({
    "@type": "Thing",
    name,
  }));
}

export function getArticleSlug(article: Article) {
  return article.slug || article.id;
}

export function getArticleBySlug(slug?: string) {
  if (!slug) return undefined;
  return allArticles.find((article) => getArticleSlug(article) === slug);
}

export function getArticlePath(article: Article) {
  return `/articles/${getArticleSlug(article)}`;
}

export function getArticleCanonical(article: Article) {
  return absoluteUrl(getArticlePath(article));
}

export function getArticleImageUrl(article?: Article) {
  const src = article?.coverUrl ? resolveArticleCover(article.coverUrl) : logoUrl;
  return absoluteUrl(src || logoUrl);
}

export function getHomeSeo(): SeoDescriptor {
  const canonical = absoluteUrl("/");
  const image = absoluteUrl(logoUrl);
  const title = `פירוש חלומות לפי היהדות עם AI | ${SITE_NAME}`;
  const description =
    "פירוש חלומות לפי היהדות בעברית לישראלים ויהודים: כתבו חלום וקבלו משמעות, סמלים, רגשות ותובנות בהשראת חז\"ל, קבלה ומסורת ישראל.";

  return {
    title,
    description,
    canonical,
    keywords: [...JEWISH_DREAM_KEYWORDS, ...ISRAEL_AUDIENCE_KEYWORDS],
    robots: DEFAULT_ROBOTS,
    meta: DEFAULT_META,
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:type": "website",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:locale": "he_IL",
      "og:locale:alternate": "en_US",
      "og:image": image,
      "og:image:alt": "DreamCatcher.AI - פירוש חלומות לפי היהדות",
    },
    twitter: {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
    },
    jsonLd: createHomeJsonLd(canonical, description, image),
  };
}

export function getArticlesSeo(): SeoDescriptor {
  const canonical = absoluteUrl("/articles");
  const image = absoluteUrl(logoUrl);
  const title = `מאמרים על פירוש חלומות לפי היהדות | ${SITE_NAME}`;
  const description =
    "מאמרים בעברית על פירוש חלומות לפי היהדות: נחש, מים, נפילה, מרדף, שיניים, נפטרים וסמלים חוזרים לפי חז\"ל, קבלה ומסורת ישראל.";

  return {
    title,
    description,
    canonical,
    keywords: [
      ...JEWISH_DREAM_KEYWORDS,
      ...ISRAEL_AUDIENCE_KEYWORDS,
      "מאמרים על חלומות",
      "סמלים בחלומות לפי היהדות",
    ],
    robots: DEFAULT_ROBOTS,
    meta: DEFAULT_META,
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:type": "website",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:locale": "he_IL",
      "og:image": image,
    },
    twitter: {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
    },
    jsonLd: createArticlesJsonLd(canonical, description, image),
  };
}

export function getArticleDescription(article: Article) {
  const enhancement = getArticleSeoEnhancement(article.id);
  if (enhancement?.metaDescription) return enhancement.metaDescription;
  return cleanDescription(article.excerpt || article.content);
}

export function getArticleSeo(article: Article): SeoDescriptor {
  const enhancement = getArticleSeoEnhancement(article.id);
  const canonical = getArticleCanonical(article);
  const description = getArticleDescription(article);
  const image = getArticleImageUrl(article);
  const modifiedAt = article.modifiedAt || article.updatedAt;
  const title = enhancement?.metaTitle || article.title;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    canonical,
    keywords: [
      ...(enhancement
        ? [enhancement.focusKeyword, ...enhancement.searchPhrases]
        : []),
      ...(article.tags || []),
      "פירוש חלומות לפי היהדות",
      "פירוש חלומות לפי חז\"ל",
      "חלומות ביהדות",
    ],
    robots: DEFAULT_ROBOTS,
    meta: DEFAULT_META,
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:image": image,
      "og:type": "article",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:locale": "he_IL",
      "og:locale:alternate": "en_US",
      "article:published_time": article.publishedAt,
      "article:modified_time": modifiedAt,
      "article:section": "פירוש חלומות לפי היהדות",
    },
    twitter: {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
    },
    jsonLd: createArticleJsonLd(article, description, image, canonical),
  };
}

export function getSeoForPath(pathname: string): SeoDescriptor {
  const path = new URL(pathname, SITE_URL).pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return getHomeSeo();
  if (path === "/articles") return getArticlesSeo();
  if (path.startsWith("/articles/")) {
    const slug = decodeURIComponent(path.replace("/articles/", ""));
    const article = getArticleBySlug(slug);
    if (article) return getArticleSeo(article);
  }
  return getHomeSeo();
}

export function getRelatedArticles(article: Article, limit = 3) {
  const tags = new Set(article.tags || []);
  const scored = allArticles
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => ({
      article: candidate,
      score: (candidate.tags || []).filter((tag) => tags.has(tag)).length,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        Date.parse(b.article.publishedAt || "") -
        Date.parse(a.article.publishedAt || "")
      );
    });

  return scored.slice(0, limit).map((entry) => entry.article);
}

function createArticleJsonLd(
  article: Article,
  description: string,
  image: string,
  canonical: string,
) {
  const modifiedAt = article.modifiedAt || article.updatedAt;
  const enhancement = getArticleSeoEnhancement(article.id);
  const articleId = `${canonical}#article`;
  const webPageId = `${canonical}#webpage`;
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const breadcrumbId = `${canonical}#breadcrumb`;
  const articleKeywords = uniqueStrings([
    ...(article.tags || []),
    ...(enhancement
      ? [enhancement.focusKeyword, ...enhancement.searchPhrases]
      : []),
    "פירוש חלומות לפי היהדות",
    "פירוש חלומות לפי חז\"ל",
    "חלומות ביהדות",
  ]);
  const articleSchema = {
    "@id": articleId,
    "@type": "Article",
    headline: article.title,
    name: article.title,
    description,
    keywords: articleKeywords,
    inLanguage: "he-IL",
    isAccessibleForFree: true,
    articleSection: "פירוש חלומות לפי היהדות",
    wordCount: articleWordCount(article),
    timeRequired: articleReadingTimeIso(article),
    about: keywordThings(articleKeywords),
    image: [image],
    datePublished: article.publishedAt,
    ...(modifiedAt ? { dateModified: modifiedAt } : {}),
    author: {
      "@type": "Organization",
      name: article.author,
    },
    publisher: {
      "@id": organizationId,
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(logoUrl),
      },
    },
    mainEntityOfPage: {
      "@id": webPageId,
    },
  };

  const graph: unknown[] = [
      createOrganizationJsonLd(),
      createWebsiteJsonLd(),
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: canonical,
        name: `${article.title} | ${SITE_NAME}`,
        description,
        inLanguage: "he-IL",
        isPartOf: {
          "@id": websiteId,
        },
        breadcrumb: {
          "@id": breadcrumbId,
        },
        mainEntity: {
          "@id": articleId,
        },
      },
      createBreadcrumbJsonLd(canonical, [
        { name: "דף הבית", item: SITE_URL },
        { name: "מאמרים", item: absoluteUrl("/articles") },
        { name: article.title, item: canonical },
      ]),
      articleSchema,
    ];

  if (enhancement?.faqs?.length) {
    graph.push(
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        inLanguage: "he-IL",
        mainEntity: enhancement.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    );
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function createHomeJsonLd(canonical: string, description: string, image: string) {
  const websiteId = `${SITE_URL}/#website`;
  const webPageId = `${canonical}#webpage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      createOrganizationJsonLd(),
      createWebsiteJsonLd(),
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: canonical,
        name: `פירוש חלומות לפי היהדות | ${SITE_NAME}`,
        alternateName: "פירוש חלומות לפי היהדות",
        description,
        inLanguage: "he-IL",
        isPartOf: {
          "@id": websiteId,
        },
        about: keywordThings([...JEWISH_DREAM_KEYWORDS, ...ISRAEL_AUDIENCE_KEYWORDS]),
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: image,
        },
        audience: {
          "@type": "Audience",
          geographicArea: {
            "@type": "Country",
            name: "Israel",
          },
          audienceType: "ישראלים יהודים",
        },
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        alternateName: "פירוש חלומות לפי היהדות",
        url: canonical,
        image,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: "he-IL",
        description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "ILS",
        },
      },
    ],
  };
}

function createArticlesJsonLd(
  canonical: string,
  description: string,
  image: string,
) {
  const websiteId = `${SITE_URL}/#website`;
  const webPageId = `${canonical}#webpage`;
  const itemListId = `${canonical}#itemlist`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      createOrganizationJsonLd(),
      createWebsiteJsonLd(),
      {
        "@type": "CollectionPage",
        "@id": webPageId,
        url: canonical,
        name: `מאמרים על פירוש חלומות לפי היהדות | ${SITE_NAME}`,
        description,
        inLanguage: "he-IL",
        isPartOf: {
          "@id": websiteId,
        },
        breadcrumb: {
          "@id": `${canonical}#breadcrumb`,
        },
        mainEntity: {
          "@id": itemListId,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: image,
        },
      },
      createBreadcrumbJsonLd(canonical, [
        { name: "דף הבית", item: SITE_URL },
        { name: "מאמרים", item: canonical },
      ]),
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "מאמרים על פירוש חלומות לפי היהדות",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: allArticles.length,
        itemListElement: allArticles.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: getArticleCanonical(article),
          name: article.title,
        })),
      },
    ],
  };
}

function createOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["פירוש חלומות לפי היהדות", "DreamCatcher AI"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(logoUrl),
    },
  };
}

function createWebsiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: "פירוש חלומות לפי היהדות",
    url: SITE_URL,
    inLanguage: ["he-IL", "en"],
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

function createBreadcrumbJsonLd(
  canonical: string,
  items: Array<{ name: string; item: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonLdText(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderSeoHead(seo: SeoDescriptor) {
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    ...(seo.keywords?.length
      ? [
          `<meta name="keywords" content="${escapeHtml(
            uniqueStrings(seo.keywords).join(", "),
          )}" />`,
        ]
      : []),
    `<meta name="robots" content="${escapeHtml(seo.robots || "index, follow")}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];

  for (const [name, content] of Object.entries(seo.meta || {})) {
    if (!content) continue;
    tags.push(
      `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`,
    );
  }

  for (const [property, content] of Object.entries(seo.openGraph || {})) {
    if (!content) continue;
    tags.push(
      `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`,
    );
  }

  for (const [name, content] of Object.entries(seo.twitter || {})) {
    if (!content) continue;
    tags.push(
      `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`,
    );
  }

  if (seo.jsonLd) {
    tags.push(
      `<script type="application/ld+json">${jsonLdText(seo.jsonLd)}</script>`,
    );
  }

  return tags.join("\n    ");
}
