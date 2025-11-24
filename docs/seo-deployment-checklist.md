# SEO Deployment Checklist

## Pre-Deployment Configuration

### 1. Update Environment Variable
Update your production environment with the correct site URL:

```bash
# Production environment
PUBLIC_SITE_URL=https://churchprompt.directory
```

**Where to set this:**
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Railway/Render**: Environment Variables section
- **Docker**: Update docker-compose.yml or deployment configuration

### 2. Verify Google Analytics
Ensure tracking ID `G-KJ8FFWP84E` is correct for production.

## Post-Deployment Verification

### 1. Test Pages (5 minutes)
Visit these URLs and verify they load correctly:

- [ ] `https://your-domain.com/directory`
- [ ] `https://your-domain.com/directory?category=sermons`
- [ ] `https://your-domain.com/directory?search=prayer`
- [ ] `https://your-domain.com/directory/[any-prompt-id]`

### 2. Validate Meta Tags (10 minutes)

**Check any directory page:**
- [ ] View page source (Right-click → View Page Source)
- [ ] Verify `<title>` tag is correct
- [ ] Verify `<meta name="description">` is present
- [ ] Verify `<link rel="canonical">` points to correct URL
- [ ] Verify Open Graph tags (`og:title`, `og:description`, `og:url`)
- [ ] Verify Twitter Card tags

**Check an individual prompt page:**
- [ ] Repeat all checks above
- [ ] Verify `article:published_time` is present
- [ ] Verify `article:author` is correct
- [ ] Verify JSON-LD structured data is present

### 3. Test Structured Data (5 minutes)

Use Google's Rich Results Test:
1. Go to: https://search.google.com/test/rich-results
2. Enter your directory URL: `https://your-domain.com/directory`
3. Wait for results
4. [ ] Verify "CollectionPage" schema detected
5. [ ] Check for any errors or warnings

Repeat for a prompt page:
1. Enter prompt URL: `https://your-domain.com/directory/[prompt-id]`
2. [ ] Verify "Article" schema detected
3. [ ] Check breadcrumb navigation
4. [ ] Verify no critical errors

### 4. Test Social Sharing (10 minutes)

**Facebook Sharing Debugger:**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your directory URL
3. [ ] Verify preview looks correct
4. [ ] Check og:title, og:description
5. Repeat for a prompt page

**Twitter Card Validator:**
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URL
3. [ ] Verify card preview looks correct
4. Repeat for a prompt page

**LinkedIn Post Inspector:**
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL
3. [ ] Verify preview looks correct

### 5. Google Analytics Check (24-48 hours after deployment)

1. Go to Google Analytics dashboard
2. Navigate to: Reports → Engagement → Pages and screens
3. [ ] Verify directory pages are tracked separately
4. [ ] Check that page titles are showing correctly
5. [ ] Verify category-filtered pages show unique URLs
6. [ ] Confirm individual prompt pages are tracked

### 6. Google Search Console Setup (If not already done)

1. Go to: https://search.google.com/search-console
2. Add your property (domain or URL prefix)
3. Verify ownership
4. [ ] Submit sitemap (if you have one)
5. [ ] Request indexing for key pages
6. Wait 2-3 days, then check:
   - [ ] Coverage report for indexing status
   - [ ] Any crawl errors
   - [ ] Enhancement reports for structured data

## Quick Validation Script

You can use this curl command to quickly check meta tags:

```bash
# Check directory page
curl -s https://your-domain.com/directory | grep -E '<title>|<meta|<link rel="canonical"'

# Check specific prompt page
curl -s https://your-domain.com/directory/YOUR_PROMPT_ID | grep -E '<title>|<meta|<link rel="canonical"'
```

## Common Issues & Solutions

### Issue: Canonical URLs show localhost
**Solution**: Verify `PUBLIC_SITE_URL` environment variable is set correctly in production

### Issue: No page tracking in Google Analytics
**Solution**: 
- Check browser console for gtag errors
- Verify tracking ID is correct
- Wait 24-48 hours for data to appear
- Test with Google Analytics Debugger extension

### Issue: Structured data errors
**Solution**:
- Check JSON-LD syntax in browser dev tools
- Verify all required Schema.org properties
- Ensure dates are in ISO 8601 format
- Make sure URLs are absolute

### Issue: Social sharing shows wrong preview
**Solution**:
- Clear cache in Facebook Debugger / Twitter Validator
- Verify Open Graph tags in page source
- Check that images (if added) are accessible
- Wait a few minutes and retry

## Monitoring Schedule

### Daily (First Week)
- [ ] Check Google Analytics for page tracking
- [ ] Monitor Search Console for crawl errors

### Weekly (First Month)
- [ ] Review top-performing pages
- [ ] Check structured data validity
- [ ] Monitor organic search traffic

### Monthly (Ongoing)
- [ ] Audit meta descriptions for top pages
- [ ] Review Search Console performance
- [ ] Update content based on search queries
- [ ] Check for broken canonical URLs

## Success Metrics

After 30 days, you should see:
- ✅ All directory pages tracked individually in Google Analytics
- ✅ Each prompt page tracked with unique URL
- ✅ Structured data validated in Search Console
- ✅ No critical crawl errors
- ✅ Social sharing working correctly
- ✅ Organic search traffic starting to appear

## Need Help?

If you encounter issues:
1. Check browser console for JavaScript errors
2. Validate HTML structure
3. Review server logs for SSR errors
4. Test with different browsers
5. Use Google's testing tools for specific feedback

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Validator](https://validator.schema.org)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger)
