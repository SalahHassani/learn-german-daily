import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  buildBreadcrumbJsonLd,
  buildCanonicalUrl,
  buildPageMetadata,
  getPublicSitemapPaths,
} from "../../../lib/seo";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.SITE_URL;
});

test("buildCanonicalUrl returns undefined when site URL is unconfigured and absolute URL when configured", () => {
  assert.equal(buildCanonicalUrl("/lessons/begruessung"), undefined);

  process.env.NEXT_PUBLIC_SITE_URL = "https://example.org/";
  assert.equal(
    buildCanonicalUrl("/lessons/begruessung"),
    "https://example.org/lessons/begruessung"
  );
  assert.equal(
    buildCanonicalUrl("levels/a1"),
    "https://example.org/levels/a1"
  );
});

test("buildPageMetadata marks private progress page as noindex", () => {
  const progressMeta = buildPageMetadata({
    title: "Your German Learning Progress",
    description: "Local progress overview.",
    path: "/progress",
    noIndex: true,
  });

  assert.deepEqual(progressMeta.robots, {
    index: false,
    follow: false,
  });

  const homeMeta = buildPageMetadata({
    title: "Learn German Daily",
    description: "A little German. Every day.",
    path: "/",
  });

  assert.deepEqual(homeMeta.robots, {
    index: true,
    follow: true,
  });
});

test("getPublicSitemapPaths includes / and /levels and excludes /progress", async () => {
  const paths = await getPublicSitemapPaths();
  assert.ok(paths.includes("/"));
  assert.ok(paths.includes("/levels"));
  assert.ok(!paths.includes("/progress"));
});

test("buildBreadcrumbJsonLd builds ordered ListItem entries", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.org";
  const jsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Levels", path: "/levels" },
  ]) as {
    "@type": string;
    itemListElement: Array<{ position: number; name: string; item: string }>;
  };

  assert.equal(jsonLd["@type"], "BreadcrumbList");
  assert.equal(jsonLd.itemListElement.length, 2);
  assert.equal(jsonLd.itemListElement[0].position, 1);
  assert.equal(jsonLd.itemListElement[0].item, "https://example.org/");
  assert.equal(jsonLd.itemListElement[1].position, 2);
});

