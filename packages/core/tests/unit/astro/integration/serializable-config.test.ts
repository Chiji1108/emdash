import { describe, expect, it } from "vitest";

import {
	buildSerializableConfig,
	emdash,
	resolveExtraSitemaps,
} from "../../../../src/astro/integration/index.js";

describe("buildSerializableConfig", () => {
	it("passes the update-check opt-out to the runtime config", () => {
		expect(buildSerializableConfig({ updateCheck: false }).updateCheck).toBe(false);
	});

	it("passes extra sitemaps to the runtime config", () => {
		expect(
			buildSerializableConfig({ sitemap: { sitemaps: ["/sitemap-pages.xml"] } }).sitemap,
		).toEqual({ sitemaps: ["/sitemap-pages.xml"] });
	});
});

describe("sitemap option", () => {
	it("keeps site paths percent-encoded and URLs normalized", () => {
		expect(
			resolveExtraSitemaps([
				"/sitemap-pages.xml",
				"/サイトマップ.xml?lang=ja",
				"https://Shop.Example.com/sitemap.xml",
			]),
		).toEqual([
			"/sitemap-pages.xml",
			"/%E3%82%B5%E3%82%A4%E3%83%88%E3%83%9E%E3%83%83%E3%83%97.xml?lang=ja",
			"https://shop.example.com/sitemap.xml",
		]);
	});

	it("fails integration setup for entries that are neither a site path nor an http(s) URL", () => {
		for (const entry of [
			"sitemap-pages.xml",
			"//cdn.example.com/a.xml",
			"ftp://example.com/a.xml",
		]) {
			expect(() => emdash({ sitemap: { sitemaps: [entry] } })).toThrow(
				/Invalid sitemap\.sitemaps entry/,
			);
		}
	});

	it("fails integration setup when sitemaps is not an array", () => {
		expect(() =>
			emdash({ sitemap: { sitemaps: "/sitemap-pages.xml" as unknown as string[] } }),
		).toThrow(/sitemap\.sitemaps must be an array/);
	});
});

describe("updateCheck option", () => {
	it("rejects an invalid minimum release age during integration setup", () => {
		expect(() => emdash({ updateCheck: { minimumReleaseAge: "soon" } })).toThrow(
			/updateCheck\.minimumReleaseAge.*soon/,
		);
		expect(() => emdash({ updateCheck: { minimumReleaseAge: "48h" } })).not.toThrow();
	});
});
