import Link from "next/link";
import { getCategoryProducts, getCategories, flattenCategories } from "@/lib/wa";
import ProductCard from "@/components/ProductCard";
import { ProductLike } from "@/types";
import { ChevronRight } from "lucide-react";
import ProductSort from "@/components/ProductSort";

export default async function CategoryView({
    categoryId,
    searchParams,
    baseUrl,
}: {
    categoryId: number;
    searchParams: { page?: string; sort?: string; order?: string };
    baseUrl: string;
}) {
    const pParam = searchParams.page;
    const sort = searchParams.sort;
    const order = searchParams.order;

    const page = Math.max(1, Number(pParam ?? "1"));
    const limit = 24;

    // Fetch categories for breadcrumbs and subcategories
    // Fetch categories for breadcrumbs and subcategories
    // Fetch categories for breadcrumbs and subcategories
    const allCatsTree = await getCategories();
    // Flatten so we can find subcategories by ID
    const allCats = flattenCategories(allCatsTree);

    const currentCat = allCats.find((c) => c.id === Number(categoryId));
    const subCats = allCats.filter((c) => c.parent_id === Number(categoryId));

    // Build crumbs
    const crumbs = [{ title: "Главная", href: "/" }];
    if (currentCat) {
        if (currentCat.parent_id) {
            const parent = allCats.find((c) => c.id === currentCat.parent_id);
            if (parent) {
                // For crumbs, we should ideally use their slug URLs too if possible.
                // But for now, let's keep it simple or try to find their URL if available.
                // If we are in slug mode, we might want to use slug links.
                // But mixed mode is tricky.
                // Let's rely on standard /category/ID for internal crumb links for now, 
                // OR if we have url property in category, use it?
                // We added `url` and `full_url` to Category type earlier.
                const href = parent.full_url ? `/${parent.full_url}` : (parent.url ? `/${parent.url}` : `/category/${parent.id}`);
                crumbs.push({ title: parent.name, href });
            }
        }
        // content of the last crumb is current page, check logic below
        const href = currentCat.full_url ? `/${currentCat.full_url}` : (currentCat.url ? `/${currentCat.url}` : `/category/${currentCat.id}`);
        crumbs.push({ title: currentCat.name, href });
    }

    let products: ProductLike[] = [];
    let count = 0;
    let error: unknown = null;

    try {
        const data = await getCategoryProducts(Number(categoryId), { page, limit, sort, order });
        products = data.products ?? [];
        count = Number(data.count ?? 0);
    } catch (e) {
        error = e;
    }

    if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return (
            <div className="p-10 text-red-600">
                <h2 className="text-xl font-bold mb-2">Ошибка при загрузке категории</h2>
                <pre className="mb-4">{errorMessage}</pre>
                <p>Пожалуйста, проверьте консоль сервера или сообщите об этом администратору.</p>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(count / limit));
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    // Pagination window
    const windowSize = 2;
    const start = Math.max(1, page - windowSize);
    const end = Math.min(totalPages, page + windowSize);
    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);

    // Helper to build query string
    const buildQuery = (p: number) => {
        const params = new URLSearchParams();
        params.set('page', String(p));
        if (sort) params.set('sort', sort);
        if (order) params.set('order', order);
        return `?${params.toString()}`;
    };

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center flex-wrap text-sm text-gray-500 mb-6">
                {crumbs.map((c, i) => (
                    <div key={i} className="flex items-center">
                        {i > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" />}
                        <Link
                            href={c.href}
                            className={`hover:text-orange-500 transition ${i === crumbs.length - 1 ? "text-gray-900 font-medium cursor-default pointer-events-none" : ""
                                }`}
                        >
                            {c.title}
                        </Link>
                    </div>
                ))}
            </div>

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": crumbs.map((c, i) => ({
                            "@type": "ListItem",
                            "position": i + 1,
                            "name": c.title,
                            "item": `https://pro-komfort.com${c.href === '/' ? '' : c.href}`
                        }))
                    })
                }}
            />


            {/* Header with Title and Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {currentCat?.name || `Категория #${categoryId}`}
                </h1>
                <ProductSort />
            </div>

            {/* Subcategories Grid */}
            {subCats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                    {subCats.map((sub) => {
                        const subHref = sub.full_url ? `/${sub.full_url}` : (sub.url ? `/${sub.url}` : `/category/${sub.id}`);
                        return (
                            <Link
                                key={sub.id}
                                href={subHref}
                                className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition bg-white text-center group"
                            >
                                {/* Placeholder Icon */}
                                <div className="w-16 h-16 mb-3 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:text-orange-400 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                </div>
                                <span className="font-bold text-sm text-gray-800 group-hover:text-orange-500 transition">
                                    {sub.name}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">{sub.count} товаров</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Products Grid */}
            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap text-sm font-medium text-gray-600">
                        {prevPage && (
                            <Link
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:text-orange-500 transition"
                                href={`${baseUrl}${buildQuery(prevPage)}`}
                            >
                                ← Назад
                            </Link>
                        )}

                        <div className="flex items-center gap-1 mx-2">
                            {start > 1 && <span className="text-gray-400">...</span>}
                            {pages.map((p) => (
                                <Link
                                    key={p}
                                    href={`${baseUrl}${buildQuery(p)}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition ${p === page
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                        : "bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-500"
                                        }`}
                                >
                                    {p}
                                </Link>
                            ))}
                            {end < totalPages && <span className="text-gray-400">...</span>}
                        </div>

                        {nextPage && (
                            <Link
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:text-orange-500 transition"
                                href={`${baseUrl}${buildQuery(nextPage)}`}
                            >
                                Вперёд →
                            </Link>
                        )}
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-4">
                        Показано {products.length} из {count} товаров
                    </div>
                </>
            ) : (
                <div className="text-center py-20 text-gray-400">
                    {subCats.length > 0 ? "Выберите подкатегорию" : "В этой категории пока нет товаров"}
                </div>
            )}
        </main>
    );
}
