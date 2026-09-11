import Link from 'next/link';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // डेटाबेस से कैटेगरी ढूंढें
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: slug },
        { name: decodeURIComponent(slug) }
      ]
    },
    include: {
      news: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }
    }
  });

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">कैटेगरी नहीं मिली</h1>
        <p className="text-gray-600">इस कैटेगरी में अभी कोई खबर उपलब्ध नहीं है।</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← होमपेज पर जाएं
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="border-b-2 border-red-600 pb-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {category.name} समाचार
        </h1>
      </div>

      {category.news.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">
          अभी {category.name} में कोई ताज़ा खबर नहीं है।
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.news.map((item: any) => (
            <div 
              key={item.id} 
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <span className="text-xs text-red-600 font-semibold uppercase">
                  {category.name}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {item.description || item.content}
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString('hi-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
