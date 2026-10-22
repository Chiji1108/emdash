---
"emdash": minor
---

Adds `termsAreStructure` to seed taxonomies. When it is `true`, the taxonomy's `terms` are applied with the schema instead of as sample content, so they exist after the first-request seed and when the setup wizard skips sample content. A translation entry takes the flag from the entry it translates. Taxonomies without it behave as before.

```json
{
	"name": "department",
	"label": "Departments",
	"hierarchical": false,
	"collections": ["news"],
	"termsAreStructure": true,
	"terms": [{ "slug": "internal-medicine", "label": "Internal medicine" }]
}
```
