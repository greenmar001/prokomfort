"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Grid, ChevronRight, X } from "lucide-react";
import { Category } from "@/types";

interface CatalogMenuProps {
    categories: Category[];
}

export default function CatalogMenu({ categories }: CatalogMenuProps) {
    if (categories && categories.length > 0) {
        console.log("CatalogMenu Debug: First category:", categories[0]);
    }

    const [isOpen, setIsOpen] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    // Group categories by parent_id
    const { roots, childrenMap } = useMemo(() => {
        const roots: Category[] = [];
        const childrenMap: Record<number, Category[]> = {};

        categories.forEach((cat) => {
            if (!cat.parent_id || cat.parent_id === 0) {
                roots.push(cat);
            } else {
                if (!childrenMap[cat.parent_id]) {
                    childrenMap[cat.parent_id] = [];
                }
                childrenMap[cat.parent_id].push(cat);
            }
        });

        return { roots, childrenMap };
    }, [categories]);

    const activeCategory = activeCategoryId
        ? categories.find((c) => c.id === activeCategoryId)
        : roots[0];

    const subcategories = activeCategory ? childrenMap[activeCategory.id] || [] : [];

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full md:w-auto ${isOpen ? "bg-[#e05e00]" : "bg-[#fb6a00]"
                    } hover:bg-[#e05e00] text-white pl-6 pr-8 py-3.5 rounded-lg flex items-center justify-center gap-3 font-bold text-[15px] transition shadow-lg shadow-orange-500/20 active:translate-y-0.5`}
            >
                {isOpen ? <X size={20} /> : <Grid size={20} fill="white" fillOpacity={0.2} />}
                <span className="uppercase tracking-wide">Каталог товаров</span>
                {!isOpen && (
                    <div className="flex flex-wrap gap-0.5 w-4 h-4 ml-1 opacity-60">
                        <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Overlay to close when clicking outside */}
                    <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />

                    <div className="absolute top-full left-0 mt-2 w-[1100px] bg-white rounded-lg shadow-2xl border border-gray-100 z-50 flex overflow-hidden min-h-[600px]">
                        {/* Sidebar (Roots) */}
                        <div className="w-[300px] border-r border-gray-100 bg-white py-4 flex-shrink-0">
                            {roots.map((cat) => (
                                <div
                                    key={cat.id}
                                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                                    className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${activeCategory?.id === cat.id
                                        ? "bg-gray-50 text-orange-500 font-bold"
                                        : "text-gray-700 hover:text-orange-500 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Placeholder icon logic if needed */}
                                        <span className="text-[14px]">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {cat.count ? <span className="text-xs text-gray-400">{cat.count}</span> : null}
                                        <ChevronRight size={14} className={`text-gray-300 ${activeCategory?.id === cat.id ? "text-orange-500" : ""}`} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Content (Subcategories) */}
                        <div className="flex-1 p-8 bg-white text-[#0f172a]">
                            {activeCategory && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        {activeCategory.name}
                                        <Link href={`/${activeCategory.full_url || activeCategory.url}`} className="text-sm font-medium text-gray-400 hover:text-orange-500 transition" onClick={() => setIsOpen(false)}>
                                            Смотреть все
                                        </Link>
                                    </h2>

                                    {subcategories.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-y-6 gap-x-8">
                                            {subcategories.map((sub) => (
                                                <div key={sub.id} className="group">
                                                    <Link href={`/${sub.full_url || sub.url}`} className="font-bold text-[15px] hover:text-orange-500 transition block mb-2" onClick={() => setIsOpen(false)}>
                                                        {sub.name}
                                                    </Link>

                                                    {/* Render 3rd level categories if any */}
                                                    {childrenMap[sub.id]?.length > 0 && (
                                                        <ul className="space-y-1.5">
                                                            {childrenMap[sub.id].slice(0, 5).map(lvl3 => (
                                                                <li key={lvl3.id}>
                                                                    <Link href={`/${lvl3.full_url || lvl3.url}`} className="text-[13px] text-gray-500 hover:text-orange-500 transition" onClick={() => setIsOpen(false)}>
                                                                        {lvl3.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">Нет подкатегорий</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
