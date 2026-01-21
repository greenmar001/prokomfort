import Link from "next/link";
import { getCategories } from "@/lib/wa";
import { Category } from "@/types";

export const revalidate = 3600;

export default async function Page() {
  let cats = await getCategories();

  // 1st level only
  cats = cats.filter(c => !c.parent_id || c.parent_id === 0);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Категории</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c: Category) => (
          <Link
            key={c.id}
            href={`/category/${c.id}`}
            className="rounded-xl border p-4 hover:shadow-sm"
          >
            <div className="font-medium">{c.name}</div>
            {c.count ? <div className="text-sm opacity-70 mt-1">{c.count} товаров</div> : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
