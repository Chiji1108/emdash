---
"emdash": minor
---

Adds the `sitemap.sitemaps` option, which lists extra sitemaps in the built-in `/sitemap.xml` index. Sites with Astro pages outside collections can serve a sitemap for them and keep EmDash's index, instead of replacing `sitemap.xml` and maintaining the list of collection sitemaps by hand.

```js
emdash({
	sitemap: { sitemaps: ["/sitemap-pages.xml"] },
});
```

Entries are paths on the site or absolute http(s) URLs; other values fail the build.
