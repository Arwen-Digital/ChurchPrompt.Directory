# Fix for Missing Categories in Production (Dokploy)

## Problem
The production site at https://churchprompt.directory is not showing categories on the landing page because:

1. **Environment variables not available during BUILD phase** - Dokploy may have variables marked as "secrets" or "runtime-only", which makes them unavailable during the static build
2. **Wrong Convex URL during build** - The static site was built pointing to the dev Convex deployment instead of production
3. **Or built before data was seeded** - The build happened before categories/prompts were added to production Convex

## Solution for Dokploy

### Step 1: Verify Environment Variables in Dokploy

In Dokploy dashboard, go to your application's environment variables and ensure these are set **AND available during build time**:

**CRITICAL: Make sure variables are NOT marked as "Build Args" only - they need to be regular environment variables!**

```bash
PUBLIC_CONVEX_URL=https://neighborly-caribou-951.convex.cloud
CONVEX_URL=https://neighborly-caribou-951.convex.cloud
CONVEX_DEPLOY_URL=https://neighborly-caribou-951.convex.cloud

PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
```

**Note:** Replace the placeholder values with your actual Clerk keys from your Clerk dashboard.

**Important:** In Dokploy:
- These should be set as **Environment Variables** (not Build Args)
- They should be available during **both build and runtime**
- Don't mark `PUBLIC_CONVEX_URL` as a secret if it prevents build-time access

### Step 2: Deploy Convex Backend First

```bash
# Make sure you're using the production deployment
npx convex deploy --prod

# Or use the deploy key directly
CONVEX_DEPLOY_KEY=prod:neighborly-caribou-951|eyJ2MiI6ImZmMWNhYzIxZWM3NDRkNjE5NWI3NDc4Mzk0NjNmYzI2In0= npx convex deploy
```

### Step 3: Trigger Dokploy Rebuild

After ensuring environment variables are correct and Convex is deployed:

**Option A: Through Dokploy Dashboard**
1. Go to your application
2. Click "Redeploy" or "Rebuild"
3. Monitor the build logs for the environment variable check

**Option B: Push a commit**
```bash
git commit --allow-empty -m "Trigger rebuild with correct env vars"
git push origin main
```

### Step 4: Verify the Fix

After redeployment, check:

1. **Categories section** - Should show 6 category cards
2. **Featured prompts** - Should show up to 6 featured prompt cards
3. **Build logs** - Should see:
   ```
   [Build] Fetching categories from: https://neighborly-caribou-951.convex.cloud
   [Build] Fetched 6 categories successfully
   [Build] Fetching featured prompts from: https://neighborly-caribou-951.convex.cloud
   [Build] Fetched 6 featured prompts
   ```

## Technical Details

The issue occurs because:

1. `index.astro` has `prerender = true` which means it's built as a static HTML file at **build time**
2. During build, it fetches categories from `PUBLIC_CONVEX_URL`
3. If `PUBLIC_CONVEX_URL` points to dev, or if Convex was empty, the static HTML gets baked with empty arrays
4. The static HTML is served to users, so they see no categories

The fix ensures the production build uses the production Convex URL and that Convex has data before the build.

## Alternative: Use Client-Side Rendering (Not Recommended for SEO)

If you want to avoid this issue in the future, you could:

1. Remove `prerender = true` from `index.astro`
2. Make categories load client-side only

But this would hurt SEO and initial page load performance.

## Debugging

If categories still don't show after rebuild, check build logs for:

```
[Build] Fetching categories from: <URL>
[Build] Fetched X categories successfully
```

If you see errors or 0 categories, there's an issue with the Convex deployment or environment variables.
