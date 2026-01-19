import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container">
          <div className="topbar-row">
            <div className="contacts">
              <span className="brand">PRO Komfort</span>
              <a href="tel:+79081722002">+7 (908) 172-20-02</a>
              <a href="mailto:info@pro-komfort.com">info@pro-komfort.com</a>
            </div>

            <div className="messengers">
              <a href="https://wa.me/79081722002" target="_blank">WhatsApp</a>
              <a href="https://t.me/Prokomfort61" target="_blank">Telegram</a>
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container header-main-row">
          <Link href="/" className="logo">PRO Komfort</Link>
          <Link href="/" className="catalog-btn">Catalog</Link>

          <form className="search">
            <input type="text" placeholder="Search" />
            <button type="submit">Go</button>
          </form>

          <div className="actions">
            <Link href="/favorites">Fav</Link>
            <Link href="/cart">Cart</Link>
          </div>
        </div>
      </div>

      <nav className="nav">
        <div className="container nav-row">
          <Link href="/">Home</Link>
          <Link href="/delivery">Delivery</Link>
          <Link href="/contacts">Contacts</Link>
          <Link href="/about">About</Link>
        </div>
      </nav>
    </header>
  );
}
