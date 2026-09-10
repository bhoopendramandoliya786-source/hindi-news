"use client";

import { FormEvent, useState } from "react";

export default function AdminSetupPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret,
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Admin account create नहीं हुआ।");
        return;
      }

      setMessage("✅ Admin account successfully create हो गया!");

      setSecret("");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("❌ कुछ गलत हो गया। फिर से कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 md:p-8">
          <div className="mb-8 text-center">
            <div className="text-4xl">🔐</div>

            <h1 className="mt-3 text-3xl font-black text-gray-950">
              Admin Setup
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create your Hindi News admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Setup Secret
              </label>

              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Admin"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
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
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Account बन रहा है..." : "Create Admin Account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
