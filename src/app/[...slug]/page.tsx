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

    // Fetch all categories
    const catsData = await getCategories();
    let allCats: Category[] = [];
    if (Array.isArray(catsData)) {
        allCats = catsData;
    } else if (catsData && "categories" in catsData) {
        allCats = catsData.categories;
    }

    // 1. Try to find a matching Category first
    const targetCat = allCats.find(c => c.full_url === slugPath);

    if (targetCat) {
        return <CategoryView categoryId={targetCat.id} searchParams={sp} baseUrl={`/${slugPath}`} />;
    }

    // 2. If no category found, try finding a Product by the last segment
    const lastPart = slug[slug.length - 1];

    // Safety check for files
    if (lastPart.includes(".")) {
        if (!lastPart.endsWith(".html")) return notFound();
    }

    let product: ProductLike | null = null;
    try {
        product = await getProduct(lastPart);
    } catch (e) {
        // Product not found or error
        console.error(`Failed to find category or product for path: ${slugPath}`, e);
    }

    if (product) {
        return <ProductView product={product} categories={allCats} />;
    }

    // 3. Not found
    return notFound();
}
