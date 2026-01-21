import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ShoppingCart,
  Heart,
  User,
  BarChart3,
  ChevronDown,
  Headphones,
  Truck,
  Percent,
  Tag,
  MessageCircle,
  Send
} from "lucide-react";
import { getCategories, flattenCategories } from "@/lib/wa";
import CatalogMenu from "./CatalogMenu";

export default async function Header() {
  const categoriesTree = await getCategories();
  // Flatten tree so CatalogMenu receives a flat list (required for its grouping logic)
  // This also ensures full_url is correctly generated for all subcategories
  const categories = flattenCategories(categoriesTree);

  return (
    <header className="flex flex-col w-full font-sans relative z-30">
      {/* 1. Top Bar */}
      <div className="bg-[#0f172a] text-white text-[13px] py-2.5 border-b border-white/10">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left side */}
          <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
            <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition">
              <Headphones size={15} className="text-blue-400" />
              <span>Консультация - с 09:00 до 18:00</span>
            </div>
            <a href="#" className="border-b border-white/30 hover:border-white transition decoration-dotted">
              Москва
            </a>
            <div className="flex items-center gap-2 opacity-90 hidden lg:flex">
              <Truck size={15} className="text-blue-400" />
              <span>Доставка по всей России</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-wrap items-center gap-6 justify-center md:justify-end">
            <a
              href="mailto:info@pro-komfort.com"
              className="flex items-center gap-2 hover:text-orange-400 transition hidden sm:flex"
            >
              <Mail size={15} className="text-blue-400" />
              <span>info@pro-komfort.com</span>
            </a>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200 transition">
                <span className="font-bold tracking-wide">+7 (800) 333-56-02</span>
                <ChevronDown size={14} />
              </div>
              <a href="#" className="border-b border-white/30 hover:border-white transition text-xs opacity-80">
                Заказать звонок
              </a>
            </div>
            <div className="flex gap-2.5">
              {/* Social icons */}
              <a href="#" className="opacity-80 hover:opacity-100 hover:text-green-400 transition" aria-label="WhatsApp">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 hover:text-blue-400 transition" aria-label="Telegram">
                <Send size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="bg-white py-5 border-b border-gray-100">
        <div className="container flex flex-col xl:flex-row items-center justify-between gap-6">
          {/* Logo area */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Image
              src="https://pro-komfort.com/wa-data/public/site/img/logo-ng.svg"
              alt="PRO Komfort"
              width={180}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex gap-6 text-[13px] font-semibold text-gray-600 uppercase tracking-normal">
            {["Компания", "Доставка и оплата", "Гарантии", "Новости", "Контакты", "Блог"].map((item) => (
              <Link key={item} href="#" className="hover:text-orange-500 transition relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Personal Actions */}
          <div className="flex items-center gap-6 text-gray-600 shrink-0">
            <Link href="/admin" className="flex flex-col items-center gap-1 hover:text-orange-500 transition group">
              <User className="group-hover:stroke-[2.5px]" size={22} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">admin</span>
            </Link>
            <Link href="/compare" className="flex flex-col items-center gap-1 hover:text-orange-500 transition group">
              <BarChart3 className="group-hover:stroke-[2.5px]" size={22} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Сравнение</span>
            </Link>
            <Link href="/favorites" className="flex flex-col items-center gap-1 hover:text-orange-500 transition group">
              <Heart className="group-hover:stroke-[2.5px]" size={22} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Избранное</span>
            </Link>
            <Link
              href="/cart"
              className="flex flex-col items-center gap-1 hover:text-orange-500 transition group relative"
            >
              <div className="relative">
                <ShoppingCart className="group-hover:stroke-[2.5px]" size={22} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold shadow-sm">
                  1
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide">Корзина</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar (Catalog & Search) */}
      <div className="bg-white py-4 pb-6">
        <div className="container flex flex-col md:flex-row items-center gap-6">
          {/* Catalog Button Component */}
          <CatalogMenu categories={categories} />

          {/* Search Input */}
          <SearchBox />

          {/* Right Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/promo"
              className="bg-gray-100 hover:bg-gray-200 pl-3 pr-5 py-3 rounded-lg flex items-center gap-3 text-gray-700 font-bold text-sm transition"
            >
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">
                <Percent size={12} />
              </div>
              <span className="uppercase text-xs tracking-wide">Все акции</span>
            </Link>
            <Link
              href="/brands"
              className="bg-gray-100 hover:bg-gray-200 pl-3 pr-5 py-3 rounded-lg flex items-center gap-3 text-gray-700 font-bold text-sm transition"
            >
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">
                <Tag size={12} />
              </div>
              <span className="uppercase text-xs tracking-wide">Бренды</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
