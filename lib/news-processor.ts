import { createSlug } from "./slug";
import type { NormalizedNews } from "./news-fetcher";

export type ProcessedNews = NormalizedNews & {
  slug: string;
  content: string;
};

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}

function buildArticleContent(article: NormalizedNews) {
  const title = cleanTitle(article.title);
  const description = (article.description || "").replace(/\s+/g, " ").trim();
  const sections = [`## खबर का सार`, description || title];

  if (article.publishedAt) {
    sections.push(`## प्रकाशन जानकारी`, `यह खबर ${new Date(article.publishedAt).toLocaleString("hi-IN", { dateStyle: "long", timeStyle: "short" })} के आसपास प्रकाशित हुई है।`);
  }

  sections.push(
    `## जरूरी बात`,
    "यह लेख उपलब्ध समाचार फ़ीड में दी गई जानकारी को साफ़ और पढ़ने योग्य रूप में प्रस्तुत करता है। अतिरिक्त तथ्य या अपुष्ट जानकारी जोड़े बिना ही सामग्री तैयार की जाती है। अधिक सत्यापित जानकारी मिलने पर खबर अपडेट की जा सकती है।"
  );

  return sections.join("\n\n");
}

export function processNews(
  article: NormalizedNews,
  uniqueSuffix: string
): ProcessedNews {
  const title = cleanTitle(article.title);
  return {
    ...article,
    title,
    content: buildArticleContent({ ...article, title }),
    slug: createSlug(title, uniqueSuffix),
  };
}
