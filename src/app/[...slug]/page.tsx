import { getCategories, getProduct } from "@/lib/wa";
import CategoryView from "@/components/CategoryView";
import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";
import { Category, ProductLike } from "@/types";

export const revalidate = 60;

export default async function SlugPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ page?: string; sort?: string; order?: string }>;
}) {
    const { slug } = await params;
    const sp = await searchParams;
    const slugPath = slug.join("/");

    // Fetch all categories to find the ID (and for product breadcrumbs)
    const catsData = await getCategories();
    let allCats: Category[] = [];
    if (Array.isArray(catsData)) {
        allCats = catsData;
    } else if (catsData && "categories" in catsData) {
        allCats = catsData.categories;
    }

    // 1. Try to find a matching Category first
    // Strategy: Try to match full_url (e.g. "catalog/air-conditioners") first
    let targetCat = allCats.find(c => c.full_url === slugPath);

    if (!targetCat) {
        const lastSegment = slug[slug.length - 1];
        // Weak fallback: try finding by exact url match of last segment if full_url check failed
        // But be careful of collisions. Prefer strict full_url.
        // targetCat = allCats.find(c => c.url === lastSegment);
    }

    if (targetCat) {
        return <CategoryView categoryId={targetCat.id} searchParams={sp} baseUrl={`/${slugPath}`} />;
    }

    // 2. If no category found, try finding a Product by the last segment
    // This supports URLs like /category/subcategory/product-name OR just /product-name
    // The previous update to `getProduct` allows searching by the last slug part if direct fetch fails.
    const lastPart = slug[slug.length - 1];

    // Safety check: if it looks like a system route or resource, ignore
    if (lastPart.includes(".")) {
        // likely a file like robots.txt or sitemap.xml if it got here, though next.js usually handles those.
        // ignore .html suffix if present
        if (!lastPart.endsWith(".html")) return notFound();
    }

    try {
        const product = await getProduct(lastPart);
        if (product) {
            return <ProductView product={product} categories={allCats} />;
        }
    } catch (e) {
        // Product not found
        console.error(`Failed to find category or product for path: ${slugPath}`, e);
    }

    // 3. Not found
    return notFound();
}
