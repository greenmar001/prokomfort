export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">PRO <span style={{color:"var(--accent)"}}>Комфорт</span></div>
            <p className="muted" style={{marginTop:10}}>
              Новая витрина (headless) в разработке.
            </p>
            <div style={{marginTop:12}}>
              <div><a href="tel:+79081722002">+7 (908) 172-20-02</a></div>
              <div><a href="mailto:info@pro-komfort.com">info@pro-komfort.com</a></div>
            </div>
          </div>

          <div>
            <h4>Покупателям</h4>
            <ul>
              <li><a href="/delivery">Доставка и оплата</a></li>
              <li><a href="/warranty">Гарантия</a></li>
              <li><a href="/returns">Возврат</a></li>
            </ul>
          </div>

          <div>
            <h4>Компания</h4>
            <ul>
              <li><a href="/about">О нас</a></li>
              <li><a href="/contacts">Контакты</a></li>
              <li><a href="/requisites">Реквизиты</a></li>
            </ul>
          </div>

          <div>
            <h4>Мы на связи</h4>
            <ul>
              <li><a href="https://wa.me/79081722002" target="_blank" rel="noreferrer">WhatsApp</a></li>
              <li><a href="https://t.me/Prokomfort61" target="_blank" rel="noreferrer">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} PRO Комфорт</div>
          <div>Тестовая витрина • закрыта от индексации</div>
        </div>
      </div>
    </footer>
  );
}
