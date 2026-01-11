import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { defineMiddleware, sequence } from 'astro:middleware';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/submit(.*)',
  '/admin(.*)',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Compression and cache middleware
const optimizationMiddleware = defineMiddleware(async (context, next) => {
  const response = await next();
  const url = new URL(context.request.url);
  
  // Clone headers to modify
  const headers = new Headers(response.headers);
  
  // Add Vary header for compression
  const contentType = response.headers.get('content-type') || '';
  const shouldCompress = 
    contentType.includes('text/') ||
    contentType.includes('application/json') ||
    contentType.includes('application/javascript') ||
    contentType.includes('application/xml');
  
  if (shouldCompress) {
    headers.set('Vary', 'Accept-Encoding');
  }
  
  // Set cache headers based on route (skip for authenticated routes)
  if (!url.pathname.startsWith('/admin') && 
      !url.pathname.startsWith('/profile') && 
      !url.pathname.startsWith('/submit')) {
    
    if (url.pathname === '/' || url.pathname === '/directory') {
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    } else if (url.pathname.startsWith('/blogs/') || url.pathname.startsWith('/directory/')) {
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=604800');
    } else if (url.pathname === '/blogs') {
      headers.set('Cache-Control', 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400');
    } else if (url.pathname === '/privacy' || url.pathname === '/terms') {
      headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
    } else if (!url.pathname.startsWith('/sitemap.xml')) {
      headers.set('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
    }
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});

const authMiddleware = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = auth();

  // If the route is protected and user is not signed in, redirect to sign-in
  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn();
  }

  // For admin routes, check if user has admin role from Convex database
  if (isAdminRoute(context.request)) {
    if (!userId) {
      return redirectToSignIn();
    }

    // Fetch user role from Convex (runtime may be absent in type; cast for optional access)
    const convexUrl = (context.locals as any).runtime?.env?.PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;
    
    if (convexUrl) {
      try {
        const response = await fetch(`${convexUrl}/api/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: 'users:getUserByClerkId',
            args: { clerkId: userId },
            format: 'json',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const user = result.value;
          
          if (!user || user.role !== 'admin') {
            return context.redirect('/?error=unauthorized');
          }
        } else {
          // If query fails, deny access
          return context.redirect('/?error=unauthorized');
        }
      } catch (error) {
        console.error('[Middleware] Error checking admin role:', error);
        return context.redirect('/?error=unauthorized');
      }
    }
  }

  // Continue to the requested page
  return next();
});

// Export sequenced middleware
export const onRequest = sequence(optimizationMiddleware, authMiddleware);
