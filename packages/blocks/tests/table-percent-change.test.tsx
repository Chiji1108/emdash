import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TableBlockComponent } from "../src/blocks/table.js";
import type { TableBlock } from "../src/types.js";
import { validateBlocks } from "../src/validation.js";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

function changeTable(values: unknown[]): TableBlock {
	return {
		type: "table",
		page_action_id: "pages",
		columns: [
			{ key: "path", label: "Page" },
			{ key: "change", label: "Change", format: "percent_change" },
		],
		rows: values.map((change, i) => ({ path: `/p${i}`, change })),
	};
}

function changeCell(path: string): HTMLElement {
	return screen.getByText(path).closest("tr")!.lastElementChild as HTMLElement;
}

describe("table percent_change format", () => {
	it("colors increases green and decreases red, with an arrow and a sign", () => {
		render(<TableBlockComponent block={changeTable([0.25, -0.1])} onAction={() => {}} />);

		const up = changeCell("/p0");
		expect(up.textContent).toBe("+25%");
		expect(up.querySelector(".text-green-600 svg")).toBeTruthy();

		const down = changeCell("/p1");
		expect(down.textContent).toBe("-10%");
		expect(down.querySelector(".text-red-600 svg")).toBeTruthy();
	});

	it("shows at most one fractional digit", () => {
		render(<TableBlockComponent block={changeTable([0.1234])} onAction={() => {}} />);
		expect(changeCell("/p0").textContent).toBe("+12.3%");
	});

	it("mutes zero and values that round to zero, without an arrow", () => {
		render(<TableBlockComponent block={changeTable([0, 0.0004, -0.0004])} onAction={() => {}} />);
		for (const path of ["/p0", "/p1", "/p2"]) {
			const cell = changeCell(path);
			expect(cell.textContent).toBe("0%");
			expect(cell.querySelector(".text-kumo-subtle")).toBeTruthy();
			expect(cell.querySelector("svg")).toBeNull();
		}
	});

	it("leaves the cell empty for null and non-finite values", () => {
		render(
			<TableBlockComponent
				block={changeTable([null, undefined, Number.POSITIVE_INFINITY, Number.NaN])}
				onAction={() => {}}
			/>,
		);
		for (const path of ["/p0", "/p1", "/p2", "/p3"]) {
			expect(changeCell(path).textContent).toBe("");
		}
	});

	it("passes a string through as plain text", () => {
		render(<TableBlockComponent block={changeTable(["New"])} onAction={() => {}} />);
		const cell = changeCell("/p0");
		expect(cell.textContent).toBe("New");
		expect(cell.querySelector("svg")).toBeNull();
	});

	it("formats the percentage in the viewer's locale", () => {
		const NumberFormat = Intl.NumberFormat;
		// A function expression, because the renderer calls it with `new`.
		vi.spyOn(Intl, "NumberFormat").mockImplementation(function (_locales, options) {
			return new NumberFormat("de-DE", options);
		});
		render(<TableBlockComponent block={changeTable([0.125])} onAction={() => {}} />);
		expect(changeCell("/p0").textContent).toBe("+12,5 %");
	});

	it("passes validation", () => {
		expect(validateBlocks([changeTable([0.25])])).toEqual({ valid: true, errors: [] });
	});
});
