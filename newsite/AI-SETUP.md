# New Prime AI project intake

This upgrade retains the existing pages and animations, replaces `/contact` with a three-step project intake, and adds a floating project assistant entry point elsewhere.

## Included

- Editable project scope, neighborhood/ZIP, property type, timeline, budget and contact details.
- Clearly labeled local text matching to suggest Foundation, Structural, Exterior and Interior services.
- Up to three photos, resized in-browser to JPEG (up to 1200px longest edge). Preview and remove photos before sharing.
- Optional AI conversation and photo review using the server-side OpenAI Responses API. The assistant does not certify conditions or generate binding prices.
- Review before sending, explicit sharing consent, input validation and honest delivery status.
- Downloadable text brief and an email draft fallback. Photos must be attached separately to email drafts.

## Run and deploy

From this folder, use Node 22 or newer:

```
npm ci
npm run dev
npm run build
node --test tests/intake.test.js
```

`npm run dev` previews the frontend only. For local API execution use the Vercel CLI (`vercel dev`). Deploy this folder as the Vercel project root, with Vite build command `npm run build` and output directory `dist`. The included rewrites preserve client-side page routes and API endpoints.

Set these in Vercel Environment Variables, then redeploy:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI API key; never use a `VITE_` prefix. |
| `OPENAI_MODEL` | Optional vision-capable Responses model; defaults to `gpt-4.1-mini`. |
| `LEAD_WEBHOOK_URL` | HTTPS endpoint you control that saves requests to your CRM/database or delivers them to your business inbox. |
| `LEAD_WEBHOOK_TOKEN` | Optional bearer token protecting that endpoint. |

No API key or business delivery account is included. Without configuration, the form and downloads still work, and API buttons explain that the service is not connected. They do not simulate successful AI review or delivery.

## Delivery integration

The webhook receives JSON with `reference` (UUID), `receivedAt`, `project`, `photos` (name + JPEG data URL), `consent`, and `source`. It must durably save or deliver the request before returning a 2xx status. Deduplicate by `reference`. A successful response shows the matching reference in the form. This project has no lead database or admin dashboard; persistence is the webhook receiver's responsibility.

Do not redirect this webhook. The handler rejects redirects to prevent forwarding its authorization header to another destination. Photos and contact fields are sent only when the customer submits with consent. AI requests omit the separate name/email/phone fields; anything a customer types into the description or chat is still shared with OpenAI after AI consent.

## Validation and launch checks

- Automated tests mock external services and cover invalid inputs, wrong methods/origins, consent, image signatures, API configuration, delivery failure/success, AI payload privacy, incomplete model responses and per-instance rate limiting.
- No live AI charge or real customer lead was generated during testing.
- Before launch, run a production build, inspect mobile/desktop layout, and test a real AI photo review and delivery to your configured receiver.
- Configure durable rate limiting and a spending budget at the hosting/provider level. The bundled in-memory guard is best-effort per server instance, not a global distributed quota.
- Confirm the existing business contact details, insurance claims and portfolio imagery before publication. They were inherited from the original source.
- Draft information lives in page memory and is lost on reload; downloads let the customer keep a copy. No localStorage is used for photos or contact data.

API reference: https://developers.openai.com/api/reference/resources/responses/methods/create

Base source: https://github.com/gim1203-hue/mr.usman.update/tree/main/newsite
