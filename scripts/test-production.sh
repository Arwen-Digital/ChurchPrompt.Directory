#!/bin/bash
# Quick test script to verify production Convex and deployment

echo "Testing Production Environment..."
echo ""

PROD_URL="https://neighborly-caribou-951.convex.cloud"

echo "1. Testing Categories Endpoint..."
CATEGORIES=$(curl -s -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"path": "categories:getCategories", "args": {}, "format": "json"}')

CAT_COUNT=$(echo "$CATEGORIES" | jq '.value | length' 2>/dev/null)
echo "   Found $CAT_COUNT categories"

if [ "$CAT_COUNT" -gt 0 ]; then
  echo "   ✅ Categories available"
  echo "$CATEGORIES" | jq '.value[] | {categoryId, name, promptCount}' 2>/dev/null | head -20
else
  echo "   ❌ No categories found!"
fi

echo ""
echo "2. Testing Prompts Endpoint..."
PROMPTS=$(curl -s -X POST "$PROD_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"path": "prompts:getApprovedPrompts", "args": {"limit": 12}, "format": "json"}')

PROMPT_COUNT=$(echo "$PROMPTS" | jq '.value.prompts | length' 2>/dev/null)
FEATURED_COUNT=$(echo "$PROMPTS" | jq '[.value.prompts[] | select(.featured == true)] | length' 2>/dev/null)

echo "   Found $PROMPT_COUNT prompts ($FEATURED_COUNT featured)"

if [ "$FEATURED_COUNT" -gt 0 ]; then
  echo "   ✅ Featured prompts available"
else
  echo "   ⚠️  No featured prompts found"
fi

echo ""
echo "3. Checking Production Website..."
HTML=$(curl -s https://churchprompt.directory)

if echo "$HTML" | grep -q "Browse by Category"; then
  echo "   ✅ Page loads successfully"
else
  echo "   ❌ Page might not be loading correctly"
fi

# Check if categories are in the HTML
if echo "$HTML" | grep -q "Administrative Tasks"; then
  echo "   ✅ Categories are present in HTML"
else
  echo "   ❌ Categories NOT found in HTML - rebuild needed!"
fi

echo ""
echo "Done!"
