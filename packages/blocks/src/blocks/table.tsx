import { Badge } from "@cloudflare/kumo";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { useState } from "react";

import { renderElement } from "../render-element.js";
import type {
	ActionElement,
	BlockInteraction,
	LinkTargetResolver,
	TableBlock,
	TableColumn,
} from "../types.js";
import { cn, formatRelativeTime } from "../utils.js";

/** A ratio (`0.25` = 25% higher) as a signed percentage, colored like the stats block's trends. */
function formatPercentChange(value: unknown, str: string): React.ReactNode {
	if (typeof value !== "number") return str;
	if (!Number.isFinite(value)) return "";
	const label = new Intl.NumberFormat(undefined, {
		style: "percent",
		maximumFractionDigits: 1,
		signDisplay: "exceptZero",
	}).format(value);
	// Round as the label does, so a value shown as 0% is not colored as a rise or fall.
	const direction = Math.sign(value) * Math.round(Math.abs(value) * 1000);
	if (direction === 0) return <span className="text-kumo-subtle">{label}</span>;
	const Arrow = direction > 0 ? ArrowUp : ArrowDown;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1",
				direction > 0 ? "text-green-600" : "text-red-600",
			)}
		>
			<Arrow size={14} aria-hidden="true" />
			{label}
		</span>
	);
}

function formatCell(value: unknown, format: TableColumn["format"]): React.ReactNode {
	let str: string;
	if (value == null) {
		str = "";
	} else if (typeof value === "string") {
		str = value;
	} else if (typeof value === "number" || typeof value === "boolean") {
		str = String(value);
	} else if (typeof value === "object") {
		str = JSON.stringify(value);
	} else {
		str = "";
	}
	switch (format) {
		case "badge":
			return <Badge>{str}</Badge>;
		case "relative_time":
			return str ? formatRelativeTime(str) : "";
		case "number": {
			const num = Number(value);
			return Number.isNaN(num) ? str : num.toLocaleString();
		}
		case "percent_change":
			return formatPercentChange(value, str);
		case "code":
			return <code className="rounded bg-kumo-tint px-1.5 py-0.5 font-mono text-sm">{str}</code>;
		default:
			return str;
	}
}

export function TableBlockComponent({
	block,
	onAction,
	resolveLinkTarget,
}: {
	block: TableBlock;
	onAction: (interaction: BlockInteraction) => void;
	resolveLinkTarget?: LinkTargetResolver;
}) {
	const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

	function handleSort(key: string) {
		const next =
			sort?.key === key && sort.dir === "asc"
				? { key, dir: "desc" as const }
				: { key, dir: "asc" as const };
		setSort(next);
		onAction({
			type: "block_action",
			action_id: block.page_action_id,
			block_id: block.block_id,
			value: { sort: next },
		});
	}

	function handleLoadMore() {
		onAction({
			type: "block_action",
			action_id: block.page_action_id,
			block_id: block.block_id,
			value: { cursor: block.next_cursor, sort },
		});
	}

	if (block.rows.length === 0 && block.empty_text) {
		return <p className="py-4 text-center text-sm text-kumo-subtle">{block.empty_text}</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-start text-sm">
				<thead>
					<tr className="border-b border-kumo-line">
						{block.columns.map((col) => (
							<th
								key={col.key}
								className={cn(
									"px-3 py-2 text-start text-sm font-medium text-kumo-subtle",
									col.sortable && "cursor-pointer select-none",
									col.format === "element" && "text-end",
								)}
								onClick={col.sortable ? () => handleSort(col.key) : undefined}
							>
								<span className="inline-flex items-center gap-1">
									{col.label}
									{col.sortable &&
										sort?.key === col.key &&
										(sort.dir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
								</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{block.rows.map((row, i) => (
						<tr key={i} className="border-b border-kumo-line last:border-0">
							{block.columns.map((col) => (
								<td
									key={col.key}
									className={cn(
										"px-3 py-2 text-kumo-default",
										col.format === "element" && "text-end",
									)}
								>
									{col.format === "element"
										? row[col.key] != null &&
											renderElement(
												row[col.key] as ActionElement,
												onAction,
												undefined,
												resolveLinkTarget,
											)
										: formatCell(row[col.key], col.format)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			{block.next_cursor && (
				<div className="mt-2 flex justify-center">
					<button
						type="button"
						onClick={handleLoadMore}
						className="text-sm text-kumo-link hover:underline"
					>
						Load more
					</button>
				</div>
			)}
		</div>
	);
}
