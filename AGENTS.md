# Architecture rules
- Calculate inventory value through `src/lib/inventoryValue.ts` so all views use the same cost basis.
- Prepare and validate purchase order inputs through `src/lib/purchaseOrderInput.ts` so optional dates never reach PostgreSQL as empty strings.
- WhatsApp group sending uses a user-confirmed browser queue, never stored provider credentials; the retired automatic endpoint returns 410.
- Use libphonenumber-js for international phone validation and Papa Parse for CSV contacts so country lengths and quoted fields are handled by maintained parsers.
- Run focused business-rule regressions with `bun run test` before reporting changes complete.
