import { getCategories, flattenCategories, resolveSlug } from "@/lib/wa";
import CategoryView from "@/components/CategoryView";
import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 60;

type Props = {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ page?: string; sort?: string; order?: string }>;
};

// SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const slugPath = slug.join("/");

    const result = await resolveSlug(slugPath);

    if (!result) {
        return {
            title: "Страница не найдена",
            description: "К сожалению, запрашиваемая страница не найдена.",
        };
    }

    if (result.type === "category") {
        const cat = result.data;
        return {
            title: cat.name + " | PRO Комфорт",
            description: `Купить ${cat.name} в интернет-магазине PRO Комфорт. Широкий ассортимент, выгодные цены, доставка по всей России.`,
            openGraph: {
                title: cat.name,
                description: `Категория ${cat.name} - огромный выбор товаров.`,
                url: `https://pro-komfort.com/${cat.full_url}`,
                type: 'website',
            },
            alternates: {
                canonical: `https://pro-komfort.com/${cat.full_url}`
            }
        };
    }

    if (result.type === "product") {
        const prod = result.data;
        // Strip HTML tags from summary for meta description
        const cleanSummary = (prod.summary || "").replace(/<[^>]*>?/gm, "").trim().slice(0, 160);

        const images = prod.image_id ? [
            {
                // Construct standard Shop-Script image URL (adjust scale related path if needed)
                // Often: /wa-data/public/shop/products/<id_last_digit>/<id>/images/<img_id>/<img_id>.970.jpg
                // But exact path depends on Shop-Script version. Using a safer generic guess or the Cloud URL if we knew it.
                // Reverting to what we use in Component or similar.
                // Actually, let's use the external URL if we can. 
                // Since we don't have the explicit full image URL in 'ProductLike' directly without logic, 
                // we'll try to construct it or skip if unsure.
                // Assuming standard path pattern:
                url: `https://pro-komfort.com/wa-data/public/shop/products/${Math.floor(prod.id / 1000)}/${prod.id}/images/${prod.image_id}/${prod.image_id}.970.jpg`,
                alt: prod.name,
            }
        ] : [];

        return {
            title: `${prod.name} | Купить по выгодной цене | PRO Комфорт`,
            description: cleanSummary || `Заказать ${prod.name} с доставкой. Характеристики, отзывы, гарантия.`,
            openGraph: {
                title: prod.name,
                description: cleanSummary,
                url: `https://pro-komfort.com/${prod.url}`,
                images: images,
                type: 'article', // or 'product'
            },
            alternates: {
                canonical: `https://pro-komfort.com/${prod.url || slugPath}`
            }
        };
    }

    return {};
}

export default async function SlugPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const sp = await searchParams;
    const slugPath = slug.join("/");

    // shared logic to determine if it's a category or product
    const result = await resolveSlug(slugPath);

    if (!result) {
        return notFound();
    }

    // We still need all categories for the "Sidebar" or "Menu" inside Views 
    // (Optimization: CategoryView might fetch them itself if needed, but currently passed as props)
    // Let's keep fetching them for now to ensure views work as before.
    const rootCats = await getCategories();
    const allCats = flattenCategories(rootCats);

    if (result.type === "category") {
        return <CategoryView categoryId={result.data.id} searchParams={sp} baseUrl={`/${slugPath}`} />;
    }

    if (result.type === "product") {
        return <ProductView product={result.data} categories={allCats} />;
    }

    return notFound();
}

