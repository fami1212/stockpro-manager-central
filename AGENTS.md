# Architecture rules
- Calculate inventory value through `src/lib/inventoryValue.ts` so all views use the same cost basis.
- Prepare and validate purchase order inputs through `src/lib/purchaseOrderInput.ts` so optional dates never reach PostgreSQL as empty strings.
- No bulk WhatsApp sending exists in the app; individual client contact uses manual wa.me deep links only, with no Meta or WhatsApp Business credentials, connection, or tables. Do not reintroduce provider-side bulk send.
- Use libphonenumber-js for international phone validation and Papa Parse for CSV contacts so country lengths and quoted fields are handled by maintained parsers.
- Run focused business-rule regressions with `bun run test` before reporting changes complete.
