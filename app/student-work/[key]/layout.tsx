import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getStudentEntityKey, getStudentEntityName } from "@/lib/student-entity";

interface Props { params: Promise<{ key: string }> }

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hindi-news-omega.vercel.app").replace(/\/$/, "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  try {
    const items = await db.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 2000,
      select: { title: true, description: true, publishedAt: true, category: { select: { slug: true, name: true } } },
    });
    const matches = items.filter((item) => getStudentEntityKey(item.title, item.category.slug) === key);
    if (!matches.length) return { title: "Student Update", robots: { index: false, follow: true } };
    const entityName = getStudentEntityName(matches[0].title);
    const description = `भारत और राजस्थान में ${entityName} से जुड़े latest notification, form, admit card, answer key, result और अगले official step की जानकारी एक जगह।`;
    return {
      title: `${entityName} | Latest Updates, Result, Admit Card | Student Update`,
      description: matches[0].description?.slice(0, 155) || description,
      keywords: [entityName, `${entityName} result`, `${entityName} admit card`, `${entityName} answer key`, `${entityName} notification`, `${entityName} form`],
      alternates: { canonical: `${SITE_URL}/student-work/${key}` },
      openGraph: {
        type: "article",
        url: `${SITE_URL}/student-work/${key}`,
        title: `${entityName} | Latest Updates | Student Update`,
        description,
        siteName: "Student Update",
        locale: "hi_IN",
      },
      twitter: { card: "summary_large_image", title: `${entityName} | Student Update`, description },
    };
  } catch {
    return { title: "Student Update", robots: { index: false, follow: true } };
  }
}

export default function StudentWorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
