"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Grid, ChevronRight, X, ChevronLeft } from "lucide-react";
import { Category } from "@/types";

interface CatalogMenuProps {
    categories: Category[];
}

export default function CatalogMenu({ categories }: CatalogMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Desktop State
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    // Mobile State
    const [mobileStack, setMobileStack] = useState<Category[]>([]);

    // Lock body scroll when open (especially important for mobile)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Grouping Logic (Memoized)
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

    // Desktop Helpers
    const activeCategory = activeCategoryId
        ? categories.find((c) => c.id === activeCategoryId)
        : roots[0];

    const subcategories = activeCategory ? childrenMap[activeCategory.id] || [] : [];

    // Mobile Helpers
    const currentMobileParent = mobileStack[mobileStack.length - 1];
    const currentMobileList = currentMobileParent
        ? childrenMap[currentMobileParent.id] || []
        : roots;

    const handleClose = () => {
        setIsOpen(false);
        setMobileStack([]); // Reset mobile navigation when closing
    };

    const handleMobileClick = (cat: Category) => { // Removed event prevention, handled by div onClick
        const hasChildren = childrenMap[cat.id]?.length > 0;
        if (hasChildren) {
            setMobileStack([...mobileStack, cat]);
        } else {
            handleClose();
        }
    };

    const handleMobileBack = () => {
        setMobileStack(mobileStack.slice(0, -1));
    };

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full md:w-auto ${isOpen ? "bg-[#e05e00]" : "bg-[#fb6a00]"
                    } hover:bg-[#e05e00] text-white pl-6 pr-8 py-3.5 rounded-lg flex items-center justify-center gap-3 font-bold text-[15px] transition shadow-lg shadow-orange-500/20 active:translate-y-0.5 z-30 relative`}
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

            {/* Dropdown Menu (DESKTOP) */}
            {isOpen && (
                <div className="hidden md:block">
                    {/* Overlay to close when clicking outside */}
                    <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} />

                    <div className="absolute top-full left-0 mt-2 w-[1100px] bg-white rounded-lg shadow-2xl border border-gray-100 z-50 flex overflow-hidden min-h-[600px]">
                        {/* Sidebar (Roots) */}
                        <div className="w-[300px] border-r border-gray-100 bg-white py-4 flex-shrink-0 overflow-y-auto max-h-[650px] scrollbar-thin scrollbar-thumb-gray-200">
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
                        <div className="flex-1 p-8 bg-white text-[#0f172a] overflow-y-auto max-h-[650px]">
                            {activeCategory && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        {activeCategory.name}
                                        <Link href={`/${activeCategory.full_url || activeCategory.url}`} className="text-sm font-medium text-gray-400 hover:text-orange-500 transition" onClick={handleClose}>
                                            Смотреть все
                                        </Link>
                                    </h2>

                                    {subcategories.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-y-6 gap-x-8">
                                            {subcategories.map((sub) => (
                                                <div key={sub.id} className="group">
                                                    <Link href={`/${sub.full_url || sub.url}`} className="font-bold text-[15px] hover:text-orange-500 transition block mb-2" onClick={handleClose}>
                                                        {sub.name}
                                                    </Link>

                                                    {/* Render 3rd level categories if any */}
                                                    {childrenMap[sub.id]?.length > 0 && (
                                                        <ul className="space-y-1.5">
                                                            {childrenMap[sub.id].slice(0, 5).map(lvl3 => (
                                                                <li key={lvl3.id}>
                                                                    <Link href={`/${lvl3.full_url || lvl3.url}`} className="text-[13px] text-gray-500 hover:text-orange-500 transition" onClick={handleClose}>
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
                </div>
            )}

            {/* Mobile Drawer (md:hidden) */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleClose} />

                    {/* Drawer Panel */}
                    <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        {/* Drawer Header */}
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0 h-[64px]">
                            {mobileStack.length > 0 ? (
                                <button onClick={handleMobileBack} className="flex items-center gap-2 text-gray-700 font-bold hover:text-orange-500 p-2 -ml-2 rounded-md transition active:scale-95">
                                    <ChevronLeft size={22} />
                                    <span className="text-sm uppercase tracking-wide">Назад</span>
                                </button>
                            ) : (
                                <span className="font-bold text-lg text-gray-800 uppercase tracking-wide">Каталог</span>
                            )}
                            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-red-500 transition bg-white rounded-full shadow-sm border border-gray-100 active:scale-95">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile List Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            {/* "See all" link for current parent */}
                            {currentMobileParent && (
                                <Link
                                    href={`/${currentMobileParent.full_url || currentMobileParent.url}`}
                                    className="flex items-center gap-3 px-5 py-4 border-b border-orange-100 font-bold text-orange-600 bg-orange-50/50 hover:bg-orange-100 transition"
                                    onClick={handleClose}
                                >
                                    <span>Смотреть все товары</span>
                                </Link>
                            )}

                            {currentMobileList.map(cat => {
                                const hasChildren = childrenMap[cat.id]?.length > 0;
                                return (
                                    <div key={cat.id} className="border-b border-gray-50 last:border-0">
                                        {hasChildren ? (
                                            <div
                                                onClick={() => handleMobileClick(cat)}
                                                className="flex items-center justify-between px-5 py-4 cursor-pointer active:bg-gray-100 transition group"
                                            >
                                                <span className="font-medium text-gray-800 text-[15px] group-hover:text-orange-600 transition">{cat.name}</span>
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition">
                                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500" />
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/${cat.full_url || cat.url}`}
                                                onClick={handleClose}
                                                className="flex items-center justify-between px-5 py-4 cursor-pointer active:bg-gray-100 transition group"
                                            >
                                                <span className="font-medium text-gray-800 text-[15px] group-hover:text-orange-600 transition">{cat.name}</span>
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}

                            {currentMobileList.length === 0 && (
                                <div className="p-10 text-center text-gray-400 text-sm flex flex-col gap-2 items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-2">
                                        <Grid size={24} />
                                    </div>
                                    В этой категории нет подкатегорий
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <a href="tel:+78003335602" className="block font-bold text-gray-800 text-lg mb-1 hover:text-orange-500">8 (800) 333-56-02</a>
                            <div className="text-xs text-gray-400">Бесплатно по РФ</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
