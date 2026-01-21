"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // We need this hook, will create it if not exists or use custom implementation

export default function SearchBox() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Simple debounce logic if hook not active
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        async function fetchResults() {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await res.json();
                setResults(data.results || []);
                setIsOpen(true);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
    }, [debouncedQuery]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length > 0) {
            // Go to search page if we had one, for now just log or do nothing specific
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    };

    return (
        <div ref={wrapperRef} className="flex-1 relative w-full z-40">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по каталогу..."
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-5 pr-24 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition text-sm font-medium"
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                />
                <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 rounded-md font-bold text-xs uppercase tracking-wide transition"
                >
                    Найти
                </button>
            </form>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto p-2">
                        {results.map((r) => (
                            <Link
                                key={r.id}
                                href={`/${r.url || ('product/' + r.id)}`}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
                                onClick={() => setIsOpen(false)}
                            >
                                {/* Image */}
                                <div className="w-12 h-12 shrink-0 bg-white border border-gray-100 rounded-md overflow-hidden flex items-center justify-center p-1">
                                    {r.image ? (
                                        <img src={r.image} alt={r.name} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <Search size={16} className="text-gray-300" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 group-hover:text-orange-600 truncate">{r.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        {r.category && <span className="text-gray-400">{r.category}</span>}
                                        {r.price > 0 && (
                                            <span className="font-semibold text-gray-900 bg-gray-100 px-1.5 rounded">{r.price.toLocaleString("ru-RU")} ₽</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="bg-gray-50 p-2 text-center">
                        <Link href={`/search?q=${encodeURIComponent(query)}`} className="text-xs font-semibold text-orange-600 hover:text-orange-700 uppercase tracking-wide">
                            Смотреть все результаты
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
