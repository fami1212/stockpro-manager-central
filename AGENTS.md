# Architecture rules
- Calculate inventory value through `src/lib/inventoryValue.ts` so all views use the same cost basis.
- Prepare and validate purchase order inputs through `src/lib/purchaseOrderInput.ts` so optional dates never reach PostgreSQL as empty strings.
- WhatsApp bulk sending goes through the `whatsapp-bulk-send` edge function using the app's shared Business number and Meta-approved templates (placeholders: {{1}} client name, {{n}} sender's company); the manual wa.me queue stays as fallback and no provider credentials are stored in the database.
- WhatsApp template administration (create/list/delete) goes through the `whatsapp-templates` edge function; only admins create or delete, non-admins may list approved templates.
- Use libphonenumber-js for international phone validation and Papa Parse for CSV contacts so country lengths and quoted fields are handled by maintained parsers.
- Run focused business-rule regressions with `bun run test` before reporting changes complete.
