import { clerkMiddleware } from '@clerk/astro/server';
import { defineMiddleware, sequence } from 'astro:middleware';

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

// Clerk middleware populates Astro.locals.auth(); route guards live on each page.
export const onRequest = sequence(optimizationMiddleware, clerkMiddleware());
