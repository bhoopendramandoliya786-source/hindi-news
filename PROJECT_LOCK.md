# Hindi News — Project Lock

This file is the implementation contract for the Hindi News project. Future changes should preserve these decisions unless the owner explicitly asks to change them.

## Product direction
- ताज़ा हिंदी समाचार
- राजस्थान समाचार
- सरकारी नौकरी / भर्ती
- परीक्षाएं
- एडमिट कार्ड
- रिजल्ट
- करंट अफेयर्स
- Mobile-first, fast cached reading experience
- Strong internal linking and search-friendly category hubs

## Content rules
1. Automatic content must come from verifiable feeds/sources.
2. The system may clean, summarize and structure source information, but must not invent facts or copy full source articles.
3. Source attribution remains visible where applicable.
4. Jobs/exam information should prefer official notifications and official authority pages as the source of truth.
5. Utility discovery now includes multi-source Google News RSS feeds for jobs, exams, results, admit cards and current affairs; these are discovery inputs, not permission to invent missing details.
6. Duplicate prevention is required before publishing.

## Traffic / SEO rules
- Homepage, category pages and article pages remain crawlable.
- Search pages remain noindex.
- Canonical URLs and XML sitemaps remain enabled.
- News sitemap contains only recent published news.
- Internal links connect articles and category hubs.
- Speed and useful content take priority over ad density.
- Trending uses freshness + reader-interest scoring instead of raw lifetime views alone.

## Automation
- GitHub Actions runs the database/news workflow every 15 minutes.
- Vercel cron remains a production safety-net sync.
- RSS fetches use independent category feeds, 8-second timeout protection and retry handling.
- Automatic publishing is resilient when individual feeds fail.
- News automation covers India, Rajasthan, World, Business, Technology, Sports, Entertainment, Jobs, Exams, Results, Admit Card and Current Affairs.

## Monetization
Use clean display/native advertising without popunder or forced-redirect behavior.
- Social Bar: sitewide lightweight script
- Native Banner: inside page content after useful content begins
- 300x250 Banner: inside page content, not before the main content
Advertising must not replace or obscure primary content.

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
- Keep the current Vercel domain configuration unless explicitly requested otherwise.

## Operating principle
The owner should not have to repeatedly restate this blueprint. Changes should be implemented end-to-end, kept compatible with the existing production setup, and checked for build/deployment safety before being described as complete.
