import Link from "next/link";
import { Phone, Mail, Send, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-10 pb-6 font-sans">
      <div className="container mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

          {/* Column 1: Contacts */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[18px] font-bold text-[#0f172a] mb-2">Контакты</h4>

            <a href="tel:78003335602" className="flex items-center gap-2 text-[15px] font-bold hover:text-orange-500 transition">
              <Phone size={18} className="text-orange-500" />
              <span>+7 (800) 333-56-02</span>
            </a>

            <a href="mailto:info@pro-komfort.com" className="flex items-center gap-2 text-[14px] text-gray-600 hover:text-orange-500 transition">
              <Mail size={18} className="text-gray-400" />
              <span>info@pro-komfort.com</span>
            </a>

            <div className="text-[14px] text-gray-500 pl-7">
              Пн-Вс, с 09:00-18:00 (МСК)
            </div>

            <div className="flex gap-2.5 mt-2">
              {/* Custom stylized social buttons as per design */}
              <a
                href="https://max.ru/u/f9LHodD0cOLD66ho0KAR6a-XHQNlhjN2It7DAb4FvcNjcI7iPWWcP73RIbs"
                target="_blank"
                rel="nofollow"
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 transition"
              >
                <span className="text-blue-600">Max</span>
              </a>
              <a
                href="https://t.me/Prokomfort61"
                target="_blank"
                rel="nofollow"
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 transition"
              >
                <Send size={14} className="text-blue-400" />
                <span>Telegram</span>
              </a>
              <a
                href="https://wa.me/79081722002"
                target="_blank"
                rel="nofollow"
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-700 transition"
              >
                <MessageCircle size={14} className="text-green-500" />
                <span>Whatsapp</span>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-[14px] font-bold text-[#0f172a] uppercase tracking-wide mb-5">Магазин</h4>
            <ul className="flex flex-col gap-3 text-[14px] text-gray-500">
              <li><Link href="/okompanii/blagodarstvennye-pisma/" className="hover:text-orange-500 transition">Отзывы</Link></li>
              <li><Link href="/brand/" className="hover:text-orange-500 transition">Бренды магазина</Link></li>
              <li><Link href="/info/" className="hover:text-orange-500 transition">Новости</Link></li>
              <li><Link href="/vse-aktsii/" className="hover:text-orange-500 transition">Все акции</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-[14px] font-bold text-[#0f172a] uppercase tracking-wide mb-5">Компания</h4>
            <ul className="flex flex-col gap-3 text-[14px] text-gray-500">
              <li><Link href="/okompanii/" className="hover:text-orange-500 transition">О компании</Link></li>
              <li><Link href="/kontakty/" className="hover:text-orange-500 transition">Контакты</Link></li>
              <li><Link href="/okompanii/nashi-sertifikaty/" className="hover:text-orange-500 transition">Сертификаты</Link></li>
            </ul>
          </div>

          {/* Column 4: Buyers */}
          <div>
            <h4 className="text-[14px] font-bold text-[#0f172a] uppercase tracking-wide mb-5">Для покупателей</h4>
            <ul className="flex flex-col gap-3 text-[14px] text-gray-500">
              <li><Link href="/dostavka-oplata/" className="hover:text-orange-500 transition">Оплата и доставка</Link></li>
              <li><Link href="/garantii/" className="hover:text-orange-500 transition">Гарантия и возврат</Link></li>
              <li><Link href="/optovye-prodazhi-split-sistem/" className="hover:text-orange-500 transition">Оптовые продажи</Link></li>
              <li><Link href="/my/profile/" className="hover:text-orange-500 transition">Личный кабинет</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4">
            <span>© {new Date().getFullYear()} ООО &quot;Прокомфорт&quot;.</span>
            <a href="https://digi-web.ru/" target="_blank" rel="nofollow" className="hover:text-orange-500 transition">Digi-Web.ru — создание и поддержка сайта</a>
          </div>
          <Link href="/okompanii/polozhenie/" className="hover:text-orange-500 transition">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
