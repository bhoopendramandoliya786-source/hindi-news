"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const response = await fetch("/api/categories", {
        cache: "no-store"
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Categories load नहीं हुईं।");
        return;
      }

      setCategories(data.categories);
    } catch {
      setMessage("Categories load करने में समस्या हुई।");
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Category name डालें।");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Category create नहीं हुई।");
        return;
      }

      setMessage("✅ Category successfully create हो गई!");

      setName("");
      setDescription("");

      await loadCategories();
    } catch {
      setMessage("❌ कुछ गलत हो गया।");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: string) {
    const confirmed = window.confirm(
      "क्या आप यह category delete करना चाहते हैं?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/categories?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Category delete नहीं हुई।");
        return;
      }

      setMessage("✅ Category delete हो गई!");

      await loadCategories();
    } catch {
      setMessage("❌ Category delete करने में समस्या हुई।");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-2xl font-black text-gray-950">
              📂 Category Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              News categories manage करें
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

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[380px_1fr]">

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-black text-gray-950">
              ➕ Add Category
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Category Name
                </label>

                <input
                  id="category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="जैसे राजस्थान"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Category का छोटा description"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {message && (
                <div className="rounded-lg bg-gray-100 p-3 text-sm font-semibold text-gray-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Save हो रहा है..."
                  : "Category Save करें"}
              </button>
            </form>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-950">
                  सभी Categories
                </h2>

                <p className="text-sm text-gray-500">
                  Database में मौजूद categories
                </p>
              </div>

              <button
                type="button"
                onClick={loadCategories}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200"
              >
                🔄 Refresh
              </button>
            </div>

            {loadingCategories ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                Categories load हो रही हैं...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500 ring-1 ring-gray-200">
                अभी कोई category नहीं है।
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-black text-gray-950">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-gray-400">
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCategory(category.id)
                      }
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
  
