import Link from "next/link";
import { getProduct, getCategories } from "@/lib/wa";
import { ProductLike, Category } from "@/types";
import ProductGallery from "@/components/ProductGallery";
import {
    Star,
    BarChart3,
    Heart,
    Share2,
    Info
} from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function ProductPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    // Handle catch-all slug (array) -> take the last part for product lookup
    // e.g. ["category", "sub", "product-name"] -> "product-name"
    const productSlug = Array.isArray(slug) ? slug[slug.length - 1] : slug;

    let p: ProductLike | null = null;
    try {
        p = await getProduct(productSlug);
    } catch (e) {
        console.error("Failed to fetch product by slug:", productSlug, e);
    }

    if (!p) {
        return notFound();
    }

    // Fetch categories for breadcrumbs
    const catsData = await getCategories();
    let allCats: Category[] = [];
    if (Array.isArray(catsData)) {
        allCats = catsData;
    } else if (catsData && "categories" in catsData) {
        allCats = catsData.categories;
    }

    // Build crumbs
    const crumbs = [{ title: "Главная", href: "/" }];
    const cat = allCats.find(c => c.id === p!.category_id);
    if (cat) {
        if (cat.parent_id) {
            const parent = allCats.find(c => c.id === cat.parent_id);
            if (parent) crumbs.push({ title: parent.name, href: `/category/${parent.id}` });
        }
        crumbs.push({ title: cat.name, href: `/category/${cat.id}` });
    }

    // --- Data Preparation ---
    const sku = p.skus?.[0];
    const priceVal = parseFloat(sku?.price_str?.replace(/[^\d.]/g, "") || "0");
    const comparePriceVal = sku?.compare_price ? parseFloat(String(sku.compare_price)) : 0;

    const cleanPrice = sku?.price_str ? sku.price_str.replace(".00", "").replace(" руб.", " ₽") : "—";
    const splitPrice = Math.round(priceVal / 4).toLocaleString("ru-RU");

    // Mocked for display
    const rating = p.rating ?? 4.8;
    const reviewsCount = p.vote_count ?? 5;
    const bonuses = Math.round(priceVal * 0.03); // ~3% bonuses
    const modelRange = ["до 40 кв.m", "до 20 кв.m", "до 30 кв.m"];

    // Mock features keys (since API might return map, we simulate list for display)
    const mainFeatures = [
        { label: "Мощность (BTU)", value: "12 (до 40 м²)" },
        { label: "Инверторный", value: "Да" },
        { label: "Wi-fi управление", value: "Опция" },
        { label: "Режим работы", value: "Охлаждение и обогрев" },
        { label: "Страна бренда", value: "Китай" },
        { label: "Бренд", value: "Ballu" },
    ];

    return (
        <div className="pb-12 text-[#0f172a]">
            {/* Breadcrumbs */}
            <div className="mb-4 text-sm text-gray-500 flex items-center flex-wrap">
                {crumbs.map((c, i) => (
                    <div key={i} className="flex items-center">
                        <Link href={c.href} className="hover:text-orange-500 transition">
                            {c.title}
                        </Link>
                        <span className="mx-2">–</span>
                    </div>
                ))}
                <span className="text-gray-400 truncate">{p.name || `Товар`}</span>
            </div>

            {/* Header Section */}
            <h1 className="text-[28px] md:text-[32px] font-bold mb-4 leading-tight">
                {p.name ?? `Товар`}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-[13px] text-gray-500">
                <div className="flex items-center gap-1">
                    <Star size={16} className="fill-orange-400 text-orange-400" />
                    <span className="font-bold text-[#0f172a] ml-1">{rating}</span>
                    <span className="underline decoration-dotted ml-1">{reviewsCount} отзывов</span>
                </div>
                <button className="flex items-center gap-1.5 hover:text-orange-500 transition">
                    <BarChart3 size={16} />
                    <span>К сравнению</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-orange-500 transition">
                    <Heart size={16} />
                    <span>В избранное</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-orange-500 transition">
                    <Share2 size={16} />
                    <span>Поделиться</span>
                </button>
            </div>

            {/* Main Grid: Gallery | Specs | BuyBox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

                {/* Gallery (Left - 5 cols) */}
                <div className="lg:col-span-5">
                    <ProductGallery product={p} />
                </div>

                {/* Center Specs (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Model Range */}
                    <div>
                        <div className="text-sm font-medium mb-3">Модельный ряд:</div>
                        <div className="flex flex-wrap gap-2">
                            {modelRange.map((m, i) => (
                                <button key={i} className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${i === 0 ? 'bg-[#fb6a00] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Characteristics List */}
                    <div>
                        <div className="text-lg font-bold mb-4">Характеристики</div>
                        <div className="space-y-3 text-[13px]">
                            {mainFeatures.map((f, i) => (
                                <div key={i} className="flex items-baseline">
                                    <span className="text-gray-500 flex-1 border-b border-dotted border-gray-300 pb-0.5 mr-2">{f.label}</span>
                                    <span className="font-medium text-[#0f172a]">{f.value}</span>
                                </div>
                            ))}
                        </div>
                        <a href="#specs" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700 decoration-dotted underline underline-offset-4">
                            Все характеристики
                        </a>
                    </div>

                    {/* Brand Link */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <span className="font-bold text-xl text-gray-400 italic">Ballu</span>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Все товары Ballu</a>
                    </div>
                </div>

                {/* Buy Box (Right - 3 cols) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-4">
                        {/* Bonus badge */}
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">₽</div>
                            Начислим +{bonuses} бонусов
                        </div>

                        {/* Price */}
                        <div className="mb-1 flex flex-wrap items-baseline gap-2">
                            <span className="text-3xl font-bold">{cleanPrice}</span>
                            {comparePriceVal > priceVal && (
                                <span className="text-lg text-gray-400 line-through decoration-gray-400 decoration-2">
                                    {comparePriceVal.toLocaleString("ru-RU")}
                                </span>
                            )}
                        </div>

                        {/* Availability */}
                        <div className="flex items-center gap-2 text-[13px] mb-6">
                            <span className="text-gray-500">Москва:</span>
                            {sku?.available ? (
                                <div className="flex items-center gap-1 text-green-600 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> В наличии
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-gray-400 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Под заказ
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3 mb-6">
                            <div className="flex gap-2">
                                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-[100px]">
                                    <button className="text-gray-400 hover:text-black w-6">-</button>
                                    <input className="w-full text-center font-bold outline-none text-sm" defaultValue={1} />
                                    <button className="text-gray-400 hover:text-black w-6">+</button>
                                </div>
                                <button className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-lg py-3 transition shadow-lg shadow-blue-500/30">
                                    Купить
                                </button>
                            </div>

                            <button className="w-full bg-blue-50 hover:bg-blue-100 text-[#2563eb] font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition text-sm">
                                <span className="w-4 h-4 border-2 border-current rounded-full"></span> Купить в 1 клик
                            </button>
                        </div>

                        {/* Split Widget */}
                        <div className="border border-gray-200 rounded-xl p-4 mb-6 relative overflow-hidden group hover:border-green-500 transition cursor-pointer">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-green-500 rounded-full text-white flex items-center justify-center text-[10px] font-bold">Я</div>
                                <span className="font-bold">Сплит</span>
                                <Info size={14} className="text-gray-300 ml-auto" />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">2 месяца</span>
                                <span>4 месяца</span>
                                <span>6 месяцев</span>
                            </div>
                            <div className="font-bold text-lg mb-2">{splitPrice} ₽ <span className="text-sm font-normal text-gray-500">сейчас</span></div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-1/4 h-full bg-green-500"></div>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-2">Без переплат</div>
                        </div>

                        {/* Delivery Info */}
                        <div className="space-y-4 text-[13px]">
                            <div>
                                <div className="font-bold mb-1">Способ доставки</div>
                                <Link href="#" className="text-orange-500 hover:underline">Самовывоз: г. Москва, ул. Ивана Сусанина д. 2с2</Link>
                                <div className="text-gray-500 mt-0.5">Завтра</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Доставка курьером</div>
                                <div className="text-gray-500 mt-0.5">Завтра, 700 ₽</div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                <a href="mailto:info@pro-komfort.com" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-sm"></span> info@pro-komfort.com
                                </a>
                                <a href="tel:+78003335602" className="flex items-center gap-2 font-bold hover:text-orange-500 transition">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-sm"></span> +7 (800) 333-56-02
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Specs Section */}
            <div id="specs" className="max-w-4xl">
                <h2 className="text-2xl font-bold mb-6">Характеристики</h2>

                <div className="space-y-8">
                    {/* Section: Main */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-[#0f172a]">Основные характеристики</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                            {[
                                { l: "Мощность (BTU)", v: "12 (до 40 м²)" },
                                { l: "Инверторный", v: "Да" },
                                { l: "Wi-fi управление", v: "Опция" },
                                { l: "Режим работы", v: "Охлаждение и обогрев" },
                                { l: "Страна бренда", v: "Китай" },
                                { l: "Бренд", v: "Ballu" },
                                { l: "Площадь помещения", v: "35 кв. м." },
                                { l: "Страна сборки", v: "Китай" },
                                { l: "Мощность охлаждения", v: "3.4 кВт" },
                                { l: "Мощность обогрева", v: "3.5 кВт" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">{item.l}</span>
                                    <span className="text-[#0f172a] font-medium">{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
