import Link from "next/link";
import { getCategories } from "@/lib/wa";
import { Category } from "@/types";
import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Интернет-магазин климатической техники PRO Комфорт",
  description: "Кондиционеры, котлы, водонагреватели и другая климатическая техника с доставкой по всей России. Выгодные цены, гарантия качества.",
  openGraph: {
    title: "PRO Комфорт — климатическая техника",
    description: "Более 10 000 товаров: кондиционеры, отопление, вентиляция.",
    url: "https://pro-komfort.com",
    siteName: "PRO Комфорт",
    locale: "ru_RU",
    type: "website",
  }
};

export default async function Page() {
  let cats = await getCategories();

  // 1st level only
  cats = cats.filter(c => !c.parent_id || c.parent_id === 0);

  return (
    <main className="p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "PRO Комфорт",
              "url": "https://pro-komfort.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://pro-komfort.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PRO Комфорт",
              "url": "https://pro-komfort.com",
              "logo": "https://pro-komfort.com/wa-data/public/site/img/logo-ng.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+7-800-333-56-02",
                "contactType": "sales",
                "areaServed": "RU",
                "availableLanguage": "Russian"
              }
            }
          ])
        }}
      />

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

