import { getCategories } from "@/lib/wa";
import CategoryView from "@/components/CategoryView";
import { notFound } from "next/navigation";
import { Category } from "@/types";

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

    // Fetch all categories to find the ID
    const catsData = await getCategories();
    let allCats: Category[] = [];
    if (Array.isArray(catsData)) {
        allCats = catsData;
    } else if (catsData && "categories" in catsData) {
        allCats = catsData.categories;
    }

    // Find category by full_url or url
    // Strategy: Try to match full_url (e.g. "catalog/air-conditioners") first
    // Note: API might return full_url without leading slash?
    // Let's assume full_url matches the path exactly.
    // Also check "url" property for simple slugs if structure is flat.

    let targetCat = allCats.find(c => c.full_url === slugPath);

    if (!targetCat) {
        // Fallback: Check if it's a single level slug match?
        // Some APIs might return just "air-conditioners" in url field.
        // But full_url is safer for nested.
        // If user navigated to /part1/part2, slugPath is "part1/part2".

        // Try finding by url === last segment? (Risk of collision)
        const lastSegment = slug[slug.length - 1];
        targetCat = allCats.find(c => c.url === lastSegment && !c.full_url); // Only if full_url not present? 

        // Better to stick to full_url if available. Use strict matching first.
    }

    if (!targetCat) {
        // If not a category, it might be a product page?
        // Or 404.
        // Since we want to support /product/[slug], we handled that in separate route.
        // But wait. If user wants `pro-komfort.com/product-slug`, then `[...slug]` will catch it.
        // If user accepts `pro-komfort.com/product/[slug]`, then that route handles it.
        // For now, let's assume it's just Categories or Static Pages here.
        // If not found, return 404.
        return notFound();
    }

    return <CategoryView categoryId={targetCat.id} searchParams={sp} baseUrl={`/${slugPath}`} />;
}
