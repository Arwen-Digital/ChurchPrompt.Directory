# SEO Implementation Guide

## Overview
This document outlines the SEO optimizations implemented for the Church Prompt Directory to improve search engine visibility and tracking in Google Analytics.

## Changes Made

### 1. Directory Index Page (`/directory`)
**File**: `src/pages/directory/index.astro`

**Features Added**:
- **Dynamic Page Titles**: Title changes based on category or search filters
  - Default: "Browse AI Prompts for Church Ministry | Church Prompt Directory"
  - Category filtered: "{Category Name} AI Prompts for Churches | Church Prompt Directory"
  - Search results: "Search Results: "{query}" | Church Prompt Directory"

- **Dynamic Meta Descriptions**: Context-aware descriptions based on page state
  
- **Canonical URLs**: Proper canonical URL for SEO consolidation

- **Open Graph Tags**: Full Open Graph support for social media sharing
  - `og:type`, `og:url`, `og:title`, `og:description`, `og:site_name`

- **Twitter Cards**: Enhanced Twitter sharing experience
  - `twitter:card`, `twitter:url`, `twitter:title`, `twitter:description`

- **Keywords Meta Tag**: Relevant keywords for church AI prompts

- **JSON-LD Structured Data**: 
  - Schema.org `CollectionPage` type
  - Breadcrumb navigation structure
  - Part of website hierarchy

### 2. Individual Prompt Pages (`/directory/[id]`)
**File**: `src/pages/directory/[id].astro`

**Features Added**:
- **Server-Side Data Fetching**: Fetches prompt data during SSR for accurate meta tags

- **Dynamic Page Titles**: Uses actual prompt title
  - Format: "{Prompt Title} | Church Prompt Directory"

- **Dynamic Meta Descriptions**: Uses prompt excerpt or content preview

- **Canonical URLs**: Unique canonical URL for each prompt

- **Article-Specific Open Graph Tags**:
  - `article:published_time`, `article:modified_time`
  - `article:author`, `article:section`
  - `article:tag` for each tag

- **Twitter Card Support**: Summary with large image card type

- **Keywords from Tags**: Automatically uses prompt tags as meta keywords

- **Rich JSON-LD Structured Data**:
  - Schema.org `Article` type
  - Author information
  - Publication/modification dates
  - Interaction statistics (usage count, execution count)
  - Breadcrumb navigation
  - Article section (category)
  - Keywords from tags

### 3. Layout Enhancements

#### BaseLayout.astro
- Added named slot `<slot name="head" />` for child layouts to inject additional head content
- Enhanced Google Analytics configuration with `page_path` tracking for better page-level analytics

#### MainLayout.astro
- Added passthrough for `head` slot to allow pages to inject custom meta tags

### 4. Configuration Updates

#### astro.config.mjs
- Added `site` configuration pointing to `process.env.PUBLIC_SITE_URL` or fallback
- Enables proper canonical URL generation using `Astro.site`

#### .env.local
- Added `PUBLIC_SITE_URL` environment variable
- Set to `http://localhost:4321` for development
- **Production**: Update to actual domain (e.g., `https://churchprompt.directory`)

## Google Analytics Improvements

### Before
- Generic page tracking without specific page paths
- Limited visibility into user navigation patterns
- No differentiation between directory views with different filters

### After
- **Page Path Tracking**: Each route properly tracked with unique URL
- **Filter Tracking**: Category and search filters reflected in page URLs and titles
- **Individual Prompt Tracking**: Each prompt page tracked separately by ID
- **Better Event Attribution**: Page views properly associated with content

## Environment Variables

### Development
```env
PUBLIC_SITE_URL=http://localhost:4321
```

### Production
```env
PUBLIC_SITE_URL=https://churchprompt.directory
```

## Structured Data Benefits

### Collection Page (Directory)
- Helps search engines understand the directory structure
- Provides breadcrumb navigation
- Indicates content organization

### Article Pages (Individual Prompts)
- Enables rich snippets in search results
- Shows author information
- Displays publication dates
- May show interaction statistics
- Improves search result CTR with enhanced display

## Testing SEO Implementation

### 1. Validate Structured Data
Use Google's Rich Results Test:
```
https://search.google.com/test/rich-results
```

### 2. Check Open Graph Tags
Use Facebook's Sharing Debugger:
```
https://developers.facebook.com/tools/debug/
```

### 3. Verify Twitter Cards
Use Twitter Card Validator:
```
https://cards-dev.twitter.com/validator
```

### 4. Test Canonical URLs
Ensure canonical URLs resolve correctly and point to the correct pages

### 5. Monitor Google Analytics
- Check "Behavior > Site Content > All Pages" for proper page tracking
- Verify page titles appear correctly
- Monitor bounce rates and engagement by page

### 6. Search Console
- Submit sitemap (if not already done)
- Monitor index coverage
- Check for any crawl errors
- Review performance reports

## Best Practices Implemented

1. ✅ **Unique Titles**: Each page has a unique, descriptive title
2. ✅ **Descriptive Meta Descriptions**: Under 160 characters, compelling
3. ✅ **Canonical URLs**: Prevent duplicate content issues
4. ✅ **Structured Data**: JSON-LD format for rich snippets
5. ✅ **Social Sharing**: Open Graph and Twitter Card optimization
6. ✅ **Semantic HTML**: Proper heading hierarchy maintained
7. ✅ **Mobile-Friendly**: Viewport meta tag configured
8. ✅ **Analytics Integration**: Enhanced Google Analytics tracking

## Future Enhancements

### Recommended
1. **XML Sitemap**: Generate dynamic sitemap for all prompts
2. **robots.txt**: Configure crawl directives
3. **Image Optimization**: Add og:image for better social sharing
4. **Schema.org FAQPage**: If adding FAQ sections
5. **Review/Rating Schema**: If adding user reviews
6. **Category Landing Pages**: Dedicated pages for each category
7. **Pagination Meta Tags**: `rel="next"` and `rel="prev"` if implementing pagination

### Analytics
1. **Custom Events**: Track prompt copies, executions, favorites
2. **Enhanced E-commerce**: If adding paid features
3. **Search Tracking**: Monitor internal search queries
4. **Conversion Funnels**: Track user journey to subscription

## Troubleshooting

### Google Analytics Not Tracking Pages
- Verify `G-KJ8FFWP84E` is correct tracking ID
- Check browser console for gtag errors
- Ensure ad blockers are disabled during testing
- Allow 24-48 hours for data to appear in reports

### Structured Data Errors
- Validate JSON-LD syntax
- Ensure required properties are present
- Check date formats (ISO 8601)
- Verify URLs are absolute, not relative

### Canonical URL Issues
- Confirm `PUBLIC_SITE_URL` is set correctly
- Check `Astro.site` resolves properly
- Ensure HTTPS in production

## Deployment Checklist

Before deploying to production:

- [ ] Update `PUBLIC_SITE_URL` in production environment variables
- [ ] Verify all prompts have proper metadata
- [ ] Test sharing on Facebook, Twitter, LinkedIn
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Search Console property
- [ ] Configure Bing Webmaster Tools
- [ ] Test canonical URLs resolve correctly
- [ ] Verify Analytics tracking is working
- [ ] Check robots.txt configuration
- [ ] Validate structured data with Google's tools

## Maintenance

### Regular Tasks
- **Monthly**: Review Google Analytics for page performance
- **Monthly**: Check Search Console for crawl errors
- **Quarterly**: Audit meta descriptions for top-performing pages
- **Quarterly**: Review and update structured data as needed
- **As Needed**: Update site URL if domain changes
- **As Needed**: Refine keywords based on search queries

## References

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org)
- [Open Graph Protocol](https://ogp.me)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
