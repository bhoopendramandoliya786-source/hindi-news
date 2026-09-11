"use client";

import { FormEvent, useEffect, useState } from "react";

type Settings = {
  siteName: string;
  siteDescription: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  breakingEnabled: boolean;
};

const emptySettings: Settings = {
  siteName: "Hindi News",
  siteDescription: "",
  logoUrl: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  websiteUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  breakingEnabled: true
};

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(emptySettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "/api/admin/settings",
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message ||
            "Settings load नहीं हुईं।"
        );
        return;
      }

      setSettings({
        siteName: data.settings.siteName || "",
        siteDescription:
          data.settings.siteDescription || "",
        logoUrl: data.settings.logoUrl || "",
        contactEmail:
          data.settings.contactEmail || "",
        contactPhone:
          data.settings.contactPhone || "",
        address: data.settings.address || "",
        websiteUrl:
          data.settings.websiteUrl || "",
        facebookUrl:
          data.settings.facebookUrl || "",
        instagramUrl:
          data.settings.instagramUrl || "",
        youtubeUrl:
          data.settings.youtubeUrl || "",
        breakingEnabled:
          data.settings.breakingEnabled
      });
    } catch {
      setMessage(
        "Settings load करने में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateField(
    field: keyof Settings,
    value: string | boolean
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!settings.siteName.trim()) {
      setMessage(
        "Website name डालना जरूरी है।"
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(settings)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message ||
            "Settings save नहीं हुईं।"
        );
        return;
      }

      setSettings({
        siteName: data.settings.siteName || "",
        siteDescription:
          data.settings.siteDescription || "",
        logoUrl: data.settings.logoUrl || "",
        contactEmail:
          data.settings.contactEmail || "",
        contactPhone:
          data.settings.contactPhone || "",
        address: data.settings.address || "",
        websiteUrl:
          data.settings.websiteUrl || "",
        facebookUrl:
          data.settings.facebookUrl || "",
        instagramUrl:
          data.settings.instagramUrl || "",
        youtubeUrl:
          data.settings.youtubeUrl || "",
        breakingEnabled:
          data.settings.breakingEnabled
      });

      setMessage(
        "✅ Settings successfully save हो गईं!"
      );
    } catch {
      setMessage(
        "❌ Settings save करने में समस्या हुई।"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="font-semibold text-gray-500">
              Settings load हो रही हैं...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-2xl font-black text-gray-950">
              ⚙️ Website Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              अपनी news website की settings manage करें
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* BASIC SETTINGS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-black text-gray-950">
              📰 Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Website की मुख्य जानकारी
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Website Name
                </label>

                <input
                  value={settings.siteName}
                  onChange={(event) =>
                    updateField(
                      "siteName",
                      event.target.value
                    )
                  }
                  placeholder="Hindi News"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Website Description
                </label>

                <textarea
                  value={
                    settings.siteDescription || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "siteDescription",
                      event.target.value
                    )
                  }
                  placeholder="भारत और दुनिया की ताज़ा खबरें..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Logo URL
                </label>

                <input
                  value={settings.logoUrl || ""}
                  onChange={(event) =>
                    updateField(
                      "logoUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {settings.logoUrl && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-bold text-gray-500">
                    Logo Preview
                  </p>

                  <img
                    src={settings.logoUrl}
                    alt="Website logo"
                    className="max-h-20 max-w-xs object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* CONTACT */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-black text-gray-950">
              📞 Contact Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Visitors के लिए contact details
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Contact Email
                </label>

                <input
                  type="email"
                  value={
                    settings.contactEmail || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "contactEmail",
                      event.target.value
                    )
                  }
                  placeholder="news@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Contact Phone
                </label>

                <input
                  type="tel"
                  value={
                    settings.contactPhone || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "contactPhone",
                      event.target.value
                    )
                  }
                  placeholder="+91 9876543210"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Address
                </label>

                <textarea
                  value={settings.address || ""}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Office address"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* WEBSITE */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-black text-gray-950">
              🌐 Website & Social Media
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Website URL
                </label>

                <input
                  type="url"
                  value={
                    settings.websiteUrl || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "websiteUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Facebook
                  </label>

                  <input
                    type="url"
                    value={
                      settings.facebookUrl || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "facebookUrl",
                        event.target.value
                      )
                    }
                    placeholder="Facebook URL"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Instagram
                  </label>

                  <input
                    type="url"
                    value={
                      settings.instagramUrl || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "instagramUrl",
                        event.target.value
                      )
                    }
                    placeholder="Instagram URL"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    YouTube
                  </label>

                  <input
                    type="url"
                    value={
                      settings.youtubeUrl || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "youtubeUrl",
                        event.target.value
                      )
                    }
                    placeholder="YouTube URL"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NEWS SETTINGS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-black text-gray-950">
              🔴 News Settings
            </h2>

            <label className="mt-6 flex cursor-pointer items-center gap-4 rounded-xl bg-red-50 p-4">
              <input
                type="checkbox"
                checked={settings.breakingEnabled}
                onChange={(event) =>
                  updateField(
                    "breakingEnabled",
                    event.target.checked
                  )
                }
                className="h-5 w-5"
              />

              <div>
                <p className="font-bold text-red-700">
                  Breaking News Enabled
                </p>

                <p className="mt-1 text-xs text-red-600">
                  Website पर Breaking News feature को enable रखें।
                </p>
              </div>
            </label>
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="rounded-xl bg-gray-100 p-4 text-sm font-semibold text-gray-700">
              {message}
            </div>
          )}

          {/* SAVE */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-8 py-3 font-bold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Save हो रहा है..."
                : "💾 Save Settings"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
                }
          
