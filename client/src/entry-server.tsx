import { type ReactElement } from "react";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom/server";
import AppProviders from "./app/AppProviders";
import { routes } from "./routes";
import {
  SITE_URL,
  allArticles,
  getArticlePath,
  getSeoForPath,
  renderSeoHead,
} from "./lib/seo";

const handler = createStaticHandler(routes);

function renderElementToString(element: ReactElement) {
  return new Promise<string>((resolve, reject) => {
    let didError = false;
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      reject(error);
    };

    const complete = (html: string) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      resolve(html);
    };

    const { pipe, abort } = renderToPipeableStream(element, {
      onAllReady() {
        const stream = new PassThrough();
        let html = "";

        stream.setEncoding("utf8");
        stream.on("data", (chunk) => {
          html += chunk;
        });
        stream.on("error", fail);
        stream.on("end", () => {
          if (didError) {
            fail(new Error("React reported an error during prerender."));
            return;
          }
          complete(html);
        });

        pipe(stream);
      },
      onShellError: fail,
      onError(error) {
        didError = true;
        console.error(error);
      },
    });

    timeout = setTimeout(() => {
      abort();
      fail(new Error("React prerender timed out."));
    }, 15000);
  });
}

export async function render(url: string) {
  const request = new Request(new URL(url, SITE_URL).href);
  const context = await handler.query(request);

  if (context instanceof Response) {
    throw new Error(`Static router returned HTTP ${context.status} for ${url}`);
  }

  const router = createStaticRouter(handler.dataRoutes, context);

  return renderElementToString(
    <AppProviders>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </AppProviders>,
  );
}

export function getPrerenderRoutes() {
  return ["/", "/articles", ...allArticles.map((article) => getArticlePath(article))];
}

export function getSitemapEntries() {
  return getPrerenderRoutes().map((path) => {
    const article = allArticles.find((candidate) => getArticlePath(candidate) === path);
    return {
      path,
      lastmod: article?.modifiedAt || article?.updatedAt || article?.publishedAt,
    };
  });
}

export { getSeoForPath, renderSeoHead };
