# Cloudflare Pages configuration
# https://developers.cloudflare.com/pages/

# Build settings (set in Cloudflare Pages dashboard or via API):
#   Root directory:        .  (monorepo root)
#   Build command:         npm install && npm -w @rt-billing/admin-web run build
#   Build output:          apps/admin-web/out
#   Node version:          20

# Required environment variables (set in Pages dashboard → Settings → Environment variables):
#   NEXT_PUBLIC_API_URL   URL of deployed API server (e.g. https://api-rt-billing.example.com)
#
# Note: NEXT_PUBLIC_* vars are baked at build time, not runtime.
# So set them BEFORE running the build, not after.

# SPA routing is handled by public/_redirects in this repo.
# Caching & security headers are set in public/_headers.

# To deploy via CLI:
#   npm install -g wrangler
#   wrangler login
#   wrangler pages deploy apps/admin-web/out --project-name=rt-billing
#
# Or push to GitHub and connect the repo in Cloudflare Pages dashboard
# for automatic deploys on every push to main.
