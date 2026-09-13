# Hindi News — Locked Production Blueprint

This is the standing implementation contract for the project.

## Product
Hindi News is a Hindi utility/news portal covering:
- भारत, राजस्थान और दुनिया की ताज़ा खबरें
- सरकारी नौकरी / भर्ती
- परीक्षाएं
- एडमिट कार्ड
- रिजल्ट
- करंट अफेयर्स
- शिक्षा/करियर उपयोगी अपडेट

## Content standard
1. Automated inputs must be traceable to feeds or verifiable source information.
2. Clean, summarize and structure available information; never fabricate facts.
3. Never publish a full copied source article.
4. For jobs/exams/results/admit cards, official notifications and authority pages are the preferred source of truth; news feeds are discovery inputs where official feeds are unavailable.
5. Preserve source attribution.
6. Duplicate protection is required before publishing using external IDs, exact titles and normalized-title similarity.

## Traffic / SEO
- News = fresh discovery traffic.
- Rajasthan = regional search demand.
- Jobs/exams/admit cards/results = high-intent search traffic.
- Current affairs = repeat visits.
- Internal links connect utility hubs and articles.
- Search pages are noindex; home/category/article pages are crawlable.
- Canonicals and XML/news sitemaps remain enabled.
- Trending combines freshness with reader-interest rather than lifetime views alone.

## Automation
- RSS/Atom ingestion uses independent feeds, timeout protection, retry, parallel category fetching and dedupe.
- Automatic engine covers India, Rajasthan, World, Business, Technology, Sports, Entertainment, Jobs, Exams, Results, Admit Card and Current Affairs.
- News saver batches external-ID lookup and maintains recent-title duplicate protection.
- New/updated news revalidates important cached pages through the cron route.
- Vercel cron remains the production safety net; GitHub Actions may provide more frequent automation when configured.

## Performance
- Prefer ISR/revalidation over unnecessary dynamic rendering.
- Use narrow Prisma selects on list pages.
- Use Next/Image for news images.
- Keep article content-first and avoid blocking reads with view-count work.
- Third-party scripts and ads must not block primary content.

## Monetization
- Current allowed set: Banner + Native Banner + Social Bar.
- No popunder or forced redirect behavior.
- Do not duplicate global ad blocks before primary content.
- Ads must not obscure useful content.
- Ads do not guarantee Google traffic or a specific income target.

## Deployment
Repository: `bhoopendramandoliya786-source/hindi-news`
Branch: `main`
Vercel remains connected to `main`.

## Change policy
Future implementation should follow this blueprint without requiring the owner to repeat it. Work is only described as complete after repository updates and deployment/build safety are checked as far as connected tooling permits.
