import { createSlug } from "./slug";
import type { NormalizedNews } from "./news-fetcher";

export type ProcessedNews = NormalizedNews & {
  slug: string;
  content: string;
};

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}

function cleanDescription(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildArticleContent(article: NormalizedNews) {
  const title = cleanTitle(article.title);
  const description = cleanDescription(article.description || "");
  const sentences = description
    .split(/(?<=[।!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const sections: string[] = ["## खबर का सार", description || title];

  if (sentences.length > 1) {
    sections.push(
      "## मुख्य बिंदु",
      sentences.slice(0, 6).map((sentence) => `- ${sentence}`).join("\n")
    );
  }

  sections.push(
    "## प्रकाशन जानकारी",
    article.publishedAt
      ? `यह अपडेट ${new Date(article.publishedAt).toLocaleString("hi-IN", { dateStyle: "long", timeStyle: "short" })} के आसपास प्रकाशित हुआ है।`
      : "प्रकाशन समय समाचार फ़ीड में उपलब्ध नहीं था।"
  );

  sections.push(
    "## स्रोत और सत्यापन",
    article.sourceName
      ? `यह खबर ${article.sourceName} की उपलब्ध समाचार फ़ीड से प्राप्त जानकारी पर आधारित है। मूल स्रोत की जानकारी को बिना अतिरिक्त अपुष्ट तथ्यों के प्रस्तुत किया गया है।`
      : "यह खबर उपलब्ध समाचार फ़ीड में दी गई जानकारी पर आधारित है।"
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
    description: cleanDescription(article.description || "") || title,
    content: buildArticleContent({ ...article, title }),
    slug: createSlug(title, uniqueSuffix),
  };
}
