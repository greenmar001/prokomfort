import Link from "next/link";
import {
  Phone,
  Mail,
  ShoppingCart,
  Heart,
  User,
  BarChart3,
  Search,
  ChevronDown,
  Headphones,
  Truck,
  Grid,
  Percent,
  Tag,
  MessageCircle,
  Send
} from "lucide-react";

export default function Header() {
  return (
    <header className="flex flex-col w-full font-sans">
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
            {/* Simulated Logo Icon */}
            <div className="w-10 h-10 relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-[4px] border-orange-500 rounded-sm transform rotate-45 translate-x-1"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-[4px] border-[#0f172a] rounded-sm transform rotate-45 -translate-x-1"></div>
            </div>
            <div className="leading-tight flex flex-col">
              <div className="font-black text-2xl tracking-wide text-[#0f172a] uppercase flex gap-1">
                ПРО <span className="text-[#0f172a]">КОМФОРТ</span>
              </div>
              <div className="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase pl-0.5">
                Объединяем лучшее
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex gap-8 text-[14px] font-bold text-gray-700 uppercase tracking-wide">
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
          {/* Catalog Button */}
          <button className="w-full md:w-auto bg-[#fb6a00] hover:bg-[#e05e00] text-white pl-6 pr-8 py-3.5 rounded-lg flex items-center justify-center gap-3 font-bold text-[15px] transition shadow-lg shadow-orange-500/20 active:translate-y-0.5">
            <Grid size={20} fill="white" fillOpacity={0.2} />
            <span className="uppercase tracking-wide">Каталог товаров</span>
            <div className="flex flex-wrap gap-0.5 w-4 h-4 ml-1 opacity-60">
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-[1px]"></div>
            </div>
          </button>

          {/* Search Input */}
          <div className="flex-1 relative w-full">
            <input
              type="text"
              placeholder="Введите запрос..."
              className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-5 pr-24 py-3.5 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition text-sm font-medium"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 rounded-md font-bold text-xs uppercase tracking-wide transition">
              Найти
            </button>
          </div>

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
