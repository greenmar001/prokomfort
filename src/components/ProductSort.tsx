"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "";
    const currentOrder = searchParams.get("order") || "";

    // Combine sort+order for the select value
    const value = currentSort ? `${currentSort}-${currentOrder}` : "def";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (val === "def") {
            params.delete("sort");
            params.delete("order");
        } else {
            const [s, o] = val.split("-");
            params.set("sort", s);
            params.set("order", o);
        }

        // Reset page on sort change
        params.delete("page");

        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Сортировка:</span>
            <div className="relative">
                <select
                    value={value}
                    onChange={handleChange}
                    className="appearance-none bg-white border border-gray-200 hover:border-orange-500 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer transition text-gray-700 font-medium"
                >
                    <option value="def">По умолчанию</option>
                    <option value="price-asc">Сначала дешевые</option>
                    <option value="price-desc">Сначала дорогие</option>
                    <option value="name-asc">По названию (А-Я)</option>
                    <option value="create_datetime-desc">Новинки</option>
                    <option value="total_sales-desc">По популярности</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
