import { getApprovedPrompts } from '../../convex/prompts';
import { getPublishedBlogs } from '../../convex/blogs';

// Define the shape of our data
interface SitemapItem {
    url: string;
    lastMod?: string;
    changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

export async function GET({ request }: { request: Request }) {
    const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
    let siteUrl = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;

    // Remove trailing slash if present to avoid double slashes
    if (siteUrl.endsWith('/')) {
        siteUrl = siteUrl.slice(0, -1);
    }

    if (!convexUrl) {
        return new Response('PUBLIC_CONVEX_URL not set', { status: 500 });
    }

    // 1. Fetch all prompts and blogs from Convex
    // We use direct fetch because we are in an SSR context
    let prompts: any[] = [];
    let blogs: any[] = [];

    try {
        // Fetch Prompts
        const promptsResp = await fetch(`${convexUrl}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: 'prompts:getApprovedPrompts',
                args: { limit: 1000 }, // Fetch enough to cover most/all
                format: 'json',
            }),
        });
        if (promptsResp.ok) {
            const json = await promptsResp.json();
            prompts = json.value?.prompts || [];
        }

        // Fetch Blogs
        const blogsResp = await fetch(`${convexUrl}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: 'blogs:getPublishedBlogs',
                args: {},
                format: 'json',
            }),
        });
        if (blogsResp.ok) {
            const json = await blogsResp.json();
            blogs = json.value || [];
        }

    } catch (e) {
        console.error('Error fetching data for sitemap:', e);
    }

    // 2. Define static pages
    const items: SitemapItem[] = [
        { url: `${siteUrl}/`, changeFreq: 'daily', priority: 1.0 },
        { url: `${siteUrl}/directory`, changeFreq: 'daily', priority: 0.9 },
        { url: `${siteUrl}/blogs`, changeFreq: 'weekly', priority: 0.8 },
        { url: `${siteUrl}/submit`, changeFreq: 'monthly', priority: 0.5 },
    ];

    // 3. Add Dynamic Prompts
    prompts.forEach((prompt) => {
        if (prompt.id) {
            items.push({
                url: `${siteUrl}/directory/${prompt.id}`,
                lastMod: new Date(prompt.updatedAt || prompt.createdAt).toISOString(),
                changeFreq: 'weekly',
                priority: 0.7,
            });
        }
    });

    // 4. Add Dynamic Blogs
    blogs.forEach((blog) => {
        if (blog.slug) {
            items.push({
                url: `${siteUrl}/blogs/${blog.slug}`,
                lastMod: new Date(blog.updatedAt || blog.createdAt).toISOString(),
                changeFreq: 'monthly',
                priority: 0.7,
            });
        }
    });

    // 5. Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${items
            .map(
                (item) => `
  <url>
    <loc>${item.url}</loc>
    ${item.lastMod ? `<lastmod>${item.lastMod}</lastmod>` : ''}
    ${item.changeFreq ? `<changefreq>${item.changeFreq}</changefreq>` : ''}
    ${item.priority ? `<priority>${item.priority}</priority>` : ''}
  </url>`
            )
            .join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
    });
}
