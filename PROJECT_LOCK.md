# Hindi News — Project Lock

This file is the implementation contract for the Hindi News project. Future changes should preserve these decisions unless the owner explicitly asks to change them.

## Product direction

Hindi News is being built as a Hindi utility/news portal, not only as a generic news feed:

- ताज़ा हिंदी समाचार
- राजस्थान समाचार
- सरकारी नौकरी / भर्ती
- आगे: परीक्षाएं, एडमिट कार्ड, रिजल्ट और करंट अफेयर्स as structured utility content
- Mobile-first reading experience
- Fast cached pages and strong internal linking
- Search-friendly, trustworthy, source-attributed content

## Content rules

1. Automatic content must come from verifiable feeds/sources.
2. The system may clean, summarize and structure source information, but must not invent facts.
3. Source attribution should remain visible where applicable.
4. Jobs/exam information should prefer official notifications and official authority pages as the source of truth.
5. Duplicate prevention is required before publishing.

## Traffic / SEO rules

- Homepage, category pages and article pages remain crawlable.
- Search pages remain noindex.
- Canonical URLs and XML sitemaps remain enabled.
- News sitemap should contain only recent published news.
- Internal links should connect related news and category hubs.
- Speed and useful content take priority over ad density.

## Automation

- GitHub Actions runs the database/news workflow every 15 minutes.
- Vercel cron remains as a production safety-net sync.
- RSS fetches use independent category feeds, timeout protection and retry handling.
- Automatic publishing must remain resilient when one feed fails.

## Monetization

Use clean display/native advertising without popunder or forced-redirect behavior.

Current Adsterra choices:

- Social Bar: sitewide lightweight script
- Native Banner: inside page content after useful content begins
- 300x250 Banner: inside page content, not before the main content

Advertising must not be allowed to replace or obscure the primary news content.

## Engineering priorities

1. Reliability and data correctness
2. Page speed / caching / image optimization
3. Article usefulness and structured information
4. News + jobs/exams content engine
5. SEO and indexing
6. Internal linking / search / trending
7. Monetization without damaging UX
8. Security and admin protection

## Deployment

- Repository: `bhoopendramandoliya786-source/hindi-news`
- Branch: `main`
- Vercel remains connected to `main`.
- Keep the current Vercel domain configuration; do not introduce a new domain unless explicitly requested.

## Operating principle

The owner should not have to repeatedly restate this blueprint. Changes should be implemented end-to-end, kept compatible with the existing production setup, and checked for build/deployment safety before being described as complete.
