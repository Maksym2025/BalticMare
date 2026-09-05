import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import Admin from './admin'
import Catalog from './catalog'

function WaterRippleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripples = useRef<Array<{ x: number; y: number; radius: number; alpha: number }>>([])
  useEffect(() => {
    const button = buttonRef.current, canvas = canvasRef.current
    if (!button || !canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const resize = () => { const r = button.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = r.width * dpr; canvas.height = r.height * dpr; canvas.style.width = `${r.width}px`; canvas.style.height = `${r.height}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    const add = (e: PointerEvent) => { const r = button.getBoundingClientRect(); ripples.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, radius: 2, alpha: .42 }) }
    resize(); const ro = new ResizeObserver(resize); ro.observe(button); button.addEventListener('pointerdown', add)
    let frame = 0; const animate = () => { const r = button.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); ripples.current.forEach(q => { ctx.beginPath(); ctx.arc(q.x, q.y, q.radius, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255,255,255,${q.alpha})`; ctx.lineWidth = 1; ctx.stroke(); q.radius += 1.2; q.alpha -= .018 }); ripples.current = ripples.current.filter(q => q.alpha > 0); frame = requestAnimationFrame(animate) }; animate()
    return () => { cancelAnimationFrame(frame); ro.disconnect(); button.removeEventListener('pointerdown', add) }
  }, [])
  return <button ref={buttonRef} className="rb-button" onClick={onClick}><canvas ref={canvasRef} aria-hidden="true"/><span>{children}</span><b>↗</b></button>
}

function Hero() {
  return <section className="rb-hero">
    <div className="rb-hero-media" aria-hidden="true" />
    <div className="rb-hero-shade" />
    <div className="rb-hero-inner">
      <p className="rb-kicker">B2B SEAFOOD SUPPLY · BALTIC / NORTH ATLANTIC</p>
      <h1>Дикая рыба<br/><i>для вашего бизнеса.</i></h1>
      <p className="rb-hero-copy">Поставка рыбы и морепродуктов для HoReCa, Retail и Wholesale по Германии и ЕС — с прозрачным происхождением, холодовой цепью и B2B-условиями.</p>
      <div className="rb-actions"><WaterRippleButton onClick={() => window.location.href = '/catalog'}>Смотреть каталог</WaterRippleButton><button className="rb-hero-secondary" onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Стать B2B-клиентом</button></div>
      <button className="rb-login-link" onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Уже клиент? Войти в B2B-кабинет →</button>
    </div>
    <div className="rb-coordinates"><span>BALTIC / NORTH ATLANTIC</span><span>COLD-CHAIN / TRACEABILITY</span><span>B2B · DE · FR · EU</span></div>
  </section>
}

function Home() {
  return <main className="rb-site">
    <header className="rb-nav">
      <a href="/" className="rb-logo"><strong>ROYAL BALTIC</strong><small>SEAFOOD</small></a>
      <nav><a href="/catalog">Каталог / Продукция</a><a href="#about">О нас</a><a href="#quality">Логистика и качество</a><a href="#b2b">HoReCa / Опт</a><a href="#contact">Контакты</a></nav>
      <div className="rb-nav-actions"><button className="lang">RU⌄</button><button className="account" onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Войти</button><WaterRippleButton onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Стать B2B-клиентом</WaterRippleButton></div>
    </header>

    <Hero />

    <section id="about" className="rb-intro rb-facts">
      <div className="rb-section-no">01 · О ROYAL BALTIC</div>
      <div className="rb-two-col"><div><p className="rb-kicker teal">ПРОСТО ДЛЯ ЗАКУПЩИКА</p><h2>Поставка,<br/><i>которой можно доверять.</i></h2></div><div className="rb-facts-grid"><Fact number="01" title="Объёмы" text="Поставки под регулярные потребности бизнеса — от коробки до паллетных заказов."/><Fact number="02" title="Контроль" text="Происхождение, температура, калибр и документы сопровождают поставку."/><Fact number="03" title="География" text="Германия, Франция и другие рынки ЕС — с партнёрской холодовой логистикой."/></div></div>
    </section>

    <section id="supply" className="rb-products rb-category-section">
      <div className="rb-section-no">02 · КАТАЛОГ</div>
      <div className="rb-section-head"><div><p className="rb-kicker teal">ИЗ НАШИХ ВОД</p><h2>Выберите<br/><i>категорию.</i></h2></div><div className="rb-side-copy"><p>Публичный каталог показывает ассортимент без закрытых B2B-цен. После активации B2B-аккаунта вы видите цены своего класса и условия именно для вашей компании.</p><a href="/catalog">Открыть полный каталог ↗</a></div></div>
      <div className="rb-category-grid"><CategoryCard n="01" title="Дикая рыба" text="Wild-caught species · Baltic / North Atlantic"/><CategoryCard n="02" title="Морепродукты" text="Shellfish · crustaceans · seafood"/><CategoryCard n="03" title="Заморозка / свежая" text="Fresh · frozen · fillet · IQF / seafrozen"/></div>
    </section>

    <section id="quality" className="rb-dark rb-quality">
      <div><p className="rb-section-no">03 · КАЧЕСТВО И ПРОСЛЕЖИВАЕМОСТЬ</p><h2>Ничего<br/>скрытого<br/><i>подо льдом.</i></h2><p className="rb-dark-copy">Каждая поставка должна быть понятной: от происхождения и обработки до температуры, упаковки и документов. Применимые сертификаты и подтверждающие документы предоставляются по конкретному продукту и поставке.</p><button className="rb-outline" onClick={() => document.getElementById('logistics')?.scrollIntoView()}>Логистика и стандарты ↗</button></div>
      <div className="rb-quality-panel"><div className="rb-cert-grid"><QualityBadge code="MSC" label="Sustainable sourcing"/><QualityBadge code="IFS" label="Food safety"/><QualityBadge code="HACCP" label="Process control"/></div><div className="rb-timeline"><div><b>01</b><span><strong>Origin</strong><small>Species, catch area and source recorded</small></span></div><div><b>02</b><span><strong>Quality control</strong><small>Temperature, grade, packaging and documents verified</small></span></div><div><b>03</b><span><strong>Cold-chain</strong><small>Controlled handling through delivery</small></span></div></div></div>
    </section>

    <section id="logistics" className="rb-logistics"><div><p className="rb-section-no">04 · ГЕОГРАФИЯ И ЛОГИСТИКА</p><p className="rb-kicker teal">COLD-CHAIN, WITHOUT COMPROMISE</p><h2>Вовремя —<br/>это <i>наш<br/>стандарт.</i></h2><p>Цепочка поставки строится от источника через контролируемую холодовую логистику до склада клиента. Для HoReCa, Retail и Wholesale условия доставки рассчитываются под заказ.</p><a href="#b2b">Запросить условия поставки ↗</a></div><div className="rb-map"><span>Source</span><span>Hamburg</span><span>Germany</span><span>France</span><div className="route"/><div className="route route-2"/></div></section>

    <section id="b2b" className="rb-b2b"><div><p className="rb-section-no">05 · B2B-КЛИЕНТАМ</p><p className="rb-kicker teal">YOUR BUSINESS ACCOUNT</p><h2>Ваш бизнес.<br/><i>Ваши цены.</i></h2><p>После регистрации компании и проверки мы присваиваем B2B-класс: HoReCa, Retail, Wholesale или Small Wholesale. В кабинете открываются персональные цены, заказы, счета, оплаты и сроки поставки.</p></div><B2BPanel/></section>

    <section id="contact" className="rb-cta"><p className="rb-kicker">HOReCa · RETAIL · WHOLESALE · DISTRIBUTORS</p><h2>Получите B2B<br/><i>прайс и условия.</i></h2><p>Оставьте заявку на регистрацию B2B-клиента или запросите коммерческое предложение. После активации аккаунта цены будут доступны непосредственно в каталоге.</p><div className="rb-cta-actions"><WaterRippleButton onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Стать B2B-клиентом</WaterRippleButton><button className="rb-ghost" onClick={() => window.location.href = '/catalog'}>Смотреть каталог</button></div></section>
    <footer className="rb-footer"><a href="/" className="rb-logo"><strong>ROYAL BALTIC</strong><small>SEAFOOD</small></a><div><a href="/catalog">Каталог</a><a href="#about">О компании</a><a href="#quality">Качество</a><a href="#logistics">Логистика</a><a href="#contact">Контакты</a></div><span>© 2026 ROYAL BALTIC SEAFOOD</span><span>TERMS · PRIVACY</span><span>DE · FR · EN · RU</span></footer>
  </main>
}

function Fact({ number, title, text }: { number: string; title: string; text: string }) { return <div className="rb-fact"><b>{number}</b><div><strong>{title}</strong><p>{text}</p></div></div> }
function CategoryCard({ n, title, text }: { n: string; title: string; text: string }) { return <a href="/catalog" className="rb-category-card"><div className="rb-category-visual"><span>{n}</span><i>RB</i></div><div><small>PRODUCT CATEGORY</small><h3>{title}</h3><p>{text}</p><b>Открыть категорию ↗</b></div></a> }
function QualityBadge({ code, label }: { code: string; label: string }) { return <div className="rb-quality-badge"><span>✓</span><strong>{code}</strong><small>{label}</small></div> }
function B2BPanel() { const [open, setOpen] = useState(false); return <div className="rb-b2b-panel"><div className="rb-account-choice"><button onClick={() => setOpen(true)}><span>01</span><strong>Уже есть аккаунт?</strong><small>Войти через Google или Email</small><b>→</b></button><button onClick={() => setOpen(true)}><span>02</span><strong>Новая компания?</strong><small>Зарегистрироваться как B2B-клиент</small><b>→</b></button></div><div className="rb-account-result"><span>B2B CABINET</span><div><strong>Personal pricing</strong><strong>Orders & delivery</strong><strong>Invoices & payments</strong><strong>Support from your account</strong></div></div>{open && <div className="rb-auth-note"><button aria-label="Close" onClick={() => setOpen(false)}>×</button><strong>Вход / регистрация</strong><p>Здесь будет подключена Supabase Auth: Google и Email. Для B2B-клиента после проверки компании откроются персональные цены и кабинет.</p><span>UI подготовлен · Auth подключаем следующим этапом</span></div>}</div> }

const path = window.location.pathname
createRoot(document.getElementById('root')!).render(<React.StrictMode>{path.startsWith('/admin') ? <Admin/> : path === '/catalog' || path.startsWith('/catalog/') ? <Catalog/> : <Home/>}</React.StrictMode>)
