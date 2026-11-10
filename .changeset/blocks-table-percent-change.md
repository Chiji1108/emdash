---
"@emdash-cms/blocks": minor
---

Adds a `percent_change` format for Block Kit table columns, so plugin admin pages can show how much each row's value rose or fell, such as page views compared with the previous period.

Each row holds the change as a ratio, where `0.25` means 25% higher and `-0.1` means 10% lower:

```ts
columns: [{ key: "change", label: "Change", format: "percent_change" }],
rows: [{ change: 0.25 }, { change: -0.1 }, { change: "New" }],
```

The admin shows the ratio as a signed percentage in the viewer's locale, with an up arrow in green for an increase and a down arrow in red for a decrease, matching the `stats` block's trends. A change that rounds to zero shows a muted `0%`, a string shows as plain text, and `null` leaves the cell empty. A plugin that uses the format needs a release of EmDash that includes it; older releases reject the unknown format value.
