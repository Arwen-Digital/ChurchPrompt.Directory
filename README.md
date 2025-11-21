# Church Prompt Directory

Astro + React application backed by Convex (data + functions) and Clerk (authentication). This README documents the current integration, environment setup, and operational tasks.

## Core Stack

- Astro (pages, layouts, hybrid rendering)
- React islands for interactive components (Directory, Prompt Detail, Profile, Admin)
- Convex for data storage, queries, mutations, and HTTP webhooks
- Clerk for authentication and user/session management
- TailwindCSS for styling

## Project Structure (High-Level)

```text
src/
  pages/          # Astro route files
  components/     # React components
  layouts/        # Astro layouts (MainLayout wraps pages)
  data/           # Initial static JSON (migrated into Convex)
convex/           # Convex functions (queries, mutations, http, schema)
```

## Environment Variables

Create `.env.local` with:

```env
PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud
CONVEX_URL=https://<your-convex-deployment>.convex.cloud
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Set webhook secret inside Convex (stored server-side):

```bash
npx convex env set CLERK_WEBHOOK_SECRET "<svix-webhook-secret>"
```

## Running

```bash
npm install
npm run dev
```

Convex dev (optional separate terminal):

```bash
npx convex dev
```

## Convex Deployment

Push function changes:

```bash
CONVEX_DEPLOYMENT=dev:<deployment-slug> npx convex deploy --yes
```

## Clerk Integration

1. Create a Clerk application (dev environment).
2. Add publishable & secret keys to `.env.local`.
3. Create JWT Template named `convex`:
   - Audience (`aud`): `convex`
   - Issuer (`iss`): Your Clerk domain (e.g. `https://example.clerk.accounts.dev`)
4. Add Convex auth provider in `convex/auth.config.ts`:

   ```ts
   export default { providers: [{ domain: "https://example.clerk.accounts.dev", applicationID: "convex" }] };
   ```

5. Use `ConvexProviderWithClerk` inside `ConvexClientProvider` to bridge auth.

## Webhook Configuration (Task 17)

Endpoint: `POST https://<your-convex-deployment>.convex.cloud/clerk/webhook`

Steps:

- In Clerk Dashboard → Webhooks → Add Endpoint.
- URL: `https://<deployment>.convex.cloud/clerk/webhook`
- Events: select `user.created`, `user.updated`, `user.deleted`.
- Copy signing secret (Svix) and set in Convex:

```bash
npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."
```

- Send test event – expect `200 ok`.
- Check Convex logs for entries like:

- `[clerk.webhook] received type=user.created clerkId=...`
- `[clerk.webhook] user.created persisted clerkId=...`

Troubleshooting:

- 400 `Missing Svix headers`: ensure you used a real Clerk webhook, not manual curl without headers.
- 400 `Invalid signature`: secret mismatch; re-set with `convex env set`.
- Convex query returns `identity: null`: verify JWT template exists (`aud=convex`, correct issuer) and user is signed in.

## Role-Based UI

- Role stored in Convex `users` table (`role: 'user' | 'admin'`).
- Header shows Admin badge and `/admin` link only for admins.
- Profile page displays role badge + Manage Prompts link.
- PromptDetail shows admin actions (Edit/Delete) if user is admin.
Utilities: `src/lib/roleUtils.ts`.

## Anonymous View Tracking

- LocalStorage limit (10 views) with guard modal encouraging sign-up.
- Utilities in `src/lib/anonymousTracking.ts`.

## Key Convex Functions

- Queries: `prompts.getApprovedPrompts`, `prompts.getPromptById`, `users.getCurrentUser`.
- Mutations: `prompts.incrementUsageCount`, `users.ensureCurrentUser`.
- Webhook: `handleClerkWebhook` in `convex/webhooks.ts`.

## Next Operational Tasks

- Add property tests (outlined in specs) for queries/mutations/webhooks.
- Environment validation module (`lib/env.ts`).
- Deployment guide for production (Vercel/Netlify + Convex).

## Scripts

Data migration (example placeholder):

```bash
SEED_URL="https://<deployment>.convex.cloud" SEED_SECRET="<secret>" npm run migrate:seed
```

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `identity: null` in Convex logs | Bad/missing JWT template | Create `convex` template, add `aud` claim |
| Webhook 400 invalid signature | Wrong Svix secret | Reset via `convex env set` |
| Admin UI missing | Role not set | Ensure user record has `role: 'admin'` |
| Usage count not incrementing | Mutation error | Check Convex logs for `incrementUsageCount` |


---
This README replaces the Astro starter template content and documents the current integration state.
