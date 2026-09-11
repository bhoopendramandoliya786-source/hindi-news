import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    redirect("/admin/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.value
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-2xl font-black text-gray-950">
              📰 Hindi News Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              News website management dashboard
            </p>
          </div>

          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
            ADMIN
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white shadow-lg">
          <p className="text-sm font-semibold text-red-100">
            Welcome back
          </p>

          <h2 className="mt-1 text-3xl font-black">
            {user.name || "Admin"} 👋
          </h2>

          <p className="mt-2 text-sm text-red-100">
            {user.email}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="text-3xl">📰</div>

            <h3 className="mt-4 text-xl font-bold text-gray-950">
              News
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              News articles manage करें।
            </p>

            <button
              type="button"
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Manage News
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="text-3xl">📂</div>

            <h3 className="mt-4 text-xl font-bold text-gray-950">
              Categories
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Categories manage करें।
            </p>

            <button
              type="button"
              className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Manage Categories
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="text-3xl">⚙️</div>

            <h3 className="mt-4 text-xl font-bold text-gray-950">
              Settings
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Website settings manage करें।
            </p>

            <button
              type="button"
              className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Settings
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-xl font-black text-gray-950">
            Account Information
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="font-semibold text-gray-500">
                Name
              </span>

              <span className="font-bold text-gray-950">
                {user.name || "-"}
              </span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="font-semibold text-gray-500">
                Email
              </span>

              <span className="font-bold text-gray-950">
                {user.email}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">
                Role
              </span>

              <span className="font-bold text-red-600">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
            }
