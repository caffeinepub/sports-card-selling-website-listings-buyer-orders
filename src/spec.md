# Specification

## Summary
**Goal:** Enhance the buyer purchase request flow to include optional offer details, and surface those details to sellers/admins while keeping existing order requests compatible after upgrade.

**Planned changes:**
- Update the listing detail purchase request form (authenticated buyers) to include optional offer price (numeric) and optional message to the seller (free text), with English labels and helper text.
- Persist the optional offer price and message in the backend order request data when the form is submitted, while keeping the form disabled for sold listings.
- Update the admin/seller order requests UI to display the buyer’s offer price and message when present, without breaking rendering for older requests that lack these fields, and keeping Accept/Reject working.
- Add a backward-compatible Motoko state migration so existing order requests remain readable and default the new fields to empty optional values after canister upgrade.

**User-visible outcome:** Buyers can submit purchase requests with an optional offer price and message from the listing detail page, and sellers/admins can see those details on order requests (when provided) without affecting older requests or existing actions.
