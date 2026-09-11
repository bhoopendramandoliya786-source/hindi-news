"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type NewsItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  status: string;
  language: string;
  isFeatured: boolean;
  isBreaking: boolean;
  createdAt: string;
  category: Category;
};

export default function AdminNewsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("HI");
  const [status, setStatus] = useState("PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);
  const [message, setMessage] = useState("");

  async function loadNews() {
    try {
      setLoadingNews(true);

      const response = await fetch("/api/admin/news", {
        cache: "no-store"
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "News load नहीं हुई।");
        return;
      }

      setNews(data.news);
    } catch {
      setMessage("News load करने में समस्या हुई।");
    } finally {
      setLoadingNews(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch("/api/categories", {
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);

        if (data.categories.length > 0) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch {
      console.error("Categories could not be loaded.");
    }
  }

  useEffect(() => {
    loadNews();
    loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          content,
          imageUrl,
          sourceName,
          sourceUrl,
          categoryId,
          language,
          status,
          isFeatured,
          isBreaking
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "News create नहीं हुई।");
        return;
      }

      setMessage("✅ News successfully create हो गई!");

      setTitle("");
      setDescription("");
      setContent("");
      setImageUrl("");
      setSourceName("");
      setSourceUrl("");
      setIsFeatured(false);
      setIsBreaking(false);

      await loadNews();
    } catch {
      setMessage("❌ कुछ गलत हो गया।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-2xl font-black text-gray-950">
              📰 News Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Hindi News की खबरें manage करें
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-black text-gray-950">
              ➕ Add News
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="खबर का शीर्षक"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="खबर का छोटा विवरण"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="पूरी खबर"
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Category चुनें</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-orange-600">
                    अभी कोई category नहीं मिली।
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Image URL
                </label>

                <input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Source Name
                </label>

                <input
                  value={sourceName}
                  onChange={(event) => setSourceName(event.target.value)}
                  placeholder="News source"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Source URL
                </label>

                <input
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://example.com/news"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Language
                  </label>

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  >
                    <option value="HI">हिंदी</option>
                    <option value="EN">English</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) =>
                    setIsFeatured(event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <span className="text-sm font-bold text-gray-700">
                  ⭐ Featured News
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(event) =>
                    setIsBreaking(event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <span className="text-sm font-bold text-red-700">
                  🔴 Breaking News
                </span>
              </label>

              {message && (
                <div className="rounded-lg bg-gray-100 p-3 text-sm font-semibold text-gray-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "News save हो रही है..." : "Publish / Save News"}
              </button>
            </form>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-950">
                  सभी News
                </h2>

                <p className="text-sm text-gray-500">
                  Database में मौजूद latest news
                </p>
              </div>

              <button
                type="button"
                onClick={loadNews}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200"
              >
                🔄 Refresh
              </button>
            </div>

            {loadingNews ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                News load हो रही है...
              </div>
            ) : news.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500 ring-1 ring-gray-200">
                अभी कोई news नहीं मिली।
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-32 w-full rounded-lg object-cover sm:w-44"
                        />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gray-100 text-4xl sm:w-44">
                          📰
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            {item.category.name}
                          </span>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                            {item.status}
                          </span>

                          {item.isBreaking && (
                            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                              🔴 BREAKING
                            </span>
                          )}

                          {item.isFeatured && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-xl font-black text-gray-950">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 text-xs font-semibold text-gray-400">
                          {item.language === "HI"
                            ? "हिंदी"
                            : "English"}

                          {item.sourceName
                            ? ` • ${item.sourceName}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
  }
                    
