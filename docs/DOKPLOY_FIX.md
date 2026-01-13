# Dokploy Deployment Guide - Fix Missing Categories

## Current Issue
Categories and featured prompts are not showing on https://churchprompt.directory because the production build doesn't have access to the correct Convex URL during build time.

## Root Cause
In Dokploy, when using static site generation (`prerender = true` in Astro), environment variables must be available during the **BUILD phase**, not just runtime. The site fetches categories from Convex at build time and bakes them into the static HTML.

## Step-by-Step Fix

### 1. Check Current Dokploy Environment Variables

In your Dokploy dashboard:

1. Navigate to your application
2. Go to "Environment Variables" section
3. Verify these variables are present:

```bash
PUBLIC_CONVEX_URL=https://neighborly-caribou-951.convex.cloud
CONVEX_URL=https://neighborly-caribou-951.convex.cloud
PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
```

**Note:** Replace the placeholder values with your actual Clerk keys from your Clerk dashboard.

**CRITICAL**: Make sure these are set as **Environment Variables**, NOT as:
- ❌ Build Args only
- ❌ Runtime-only variables
- ❌ Secrets that are hidden during build

### 2. Ensure Convex Production Has Data

Before rebuilding, verify your production Convex has data:

```bash
# Test from your local machine
curl -s -X POST https://neighborly-caribou-951.convex.cloud/api/query \
  -H "Content-Type: application/json" \
  -d '{"path": "categories:getCategories", "args": {}, "format": "json"}' | jq '.value | length'

# Should return: 6 (or more)
```

If it returns 0 or errors, you need to seed your production Convex first:

```bash
# Deploy to production Convex
CONVEX_DEPLOY_KEY="prod:neighborly-caribou-951|eyJ2MiI6ImZmMWNhYzIxZWM3NDRkNjE5NWI3NDc4Mzk0NjNmYzI2In0=" npx convex deploy

# Or if you have it configured in your project
npx convex deploy --prod
```

### 3. Update Dokploy Configuration (Already Done)

The following files have been updated with better error handling:

- ✅ `nixpacks.toml` - Now validates PUBLIC_CONVEX_URL during build
- ✅ `src/pages/index.astro` - Added logging for category/prompt fetching
- ✅ `scripts/verify-build.sh` - Script to verify build environment

### 4. Commit and Push Changes

```bash
git add .
git commit -m "fix: add build-time environment validation for Dokploy deployment"
git push origin main
```

### 5. Trigger Rebuild in Dokploy

**Option A: Through Dashboard**
1. Go to your Dokploy application
2. Click "Redeploy" or "Rebuild Application"
3. Watch the build logs

**Option B: Force push**
```bash
git commit --allow-empty -m "chore: trigger Dokploy rebuild"
git push origin main
```

### 6. Monitor Build Logs

In Dokploy build logs, you should see:

```
======================================
Build Environment Check
======================================
PUBLIC_CONVEX_URL=https://neighborly-caribou-951.convex.cloud
CONVEX_URL=https://neighborly-caribou-951.convex.cloud
======================================
Running npm build...

[Build] Fetching categories from: https://neighborly-caribou-951.convex.cloud
[Build] Fetched 6 categories successfully
[Build] Fetching featured prompts from: https://neighborly-caribou-951.convex.cloud
[Build] Fetched 6 featured prompts
======================================
Build completed successfully
======================================
```

### 7. Verify Production Site

After deployment completes:

1. Visit https://churchprompt.directory
2. You should see:
   - ✅ 6 category cards in "Browse by Category" section
   - ✅ Up to 6 featured prompt cards in "Featured Prompts" section

### 8. If Categories Still Don't Show

**Diagnostic Steps:**

1. **Check build logs** - Look for error messages during category fetch
2. **Verify environment variables** in Dokploy:
   - Make sure `PUBLIC_CONVEX_URL` is visible during build
   - NOT marked as secret/runtime-only
3. **Test Convex directly**:
   ```bash
   curl -X POST https://neighborly-caribou-951.convex.cloud/api/query \
     -H "Content-Type: application/json" \
     -d '{"path": "categories:getCategories", "args": {}, "format": "json"}'
   ```
4. **Check for CORS issues** - Make sure Convex allows requests from your build environment

## Common Dokploy Issues

### Issue 1: "PUBLIC_CONVEX_URL not set!" Error
**Solution**: Environment variable is not available during build phase. Go to Dokploy → Environment Variables → Make sure it's a regular env var, not build-arg-only.

### Issue 2: Build succeeds but categories still empty
**Solution**: The build used the wrong Convex URL or built before data existed. Check build logs for the actual URL used.

### Issue 3: Convex returns empty array
**Solution**: Production Convex database is empty. Run `npx convex deploy --prod` and seed it with `npm run migrate:seed`.

## Technical Details

**Why this happens:**
1. Astro's `prerender = true` generates static HTML at build time
2. The `index.astro` file fetches categories from Convex during build
3. The fetched data is baked into the static HTML
4. If `PUBLIC_CONVEX_URL` is wrong/missing during build, HTML has empty arrays
5. Users see the empty static HTML (no client-side loading happens)

**Environment Variable Flow in Dokploy:**
```
Dokploy Env Vars → nixpacks.toml → npm run build → Astro build → Fetch from Convex → Static HTML
```

If env vars aren't available at any step, the build fails or produces empty HTML.
