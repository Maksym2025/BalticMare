import React, { useEffect, useRef } from 'react'
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
      <p className="rb-kicker">ПРЯМО ИЗ СЕВЕРНОЙ АТЛАНТИКИ</p>
      <h1>Морепродукты<br/><i>с историей.</i></h1>
      <p className="rb-hero-copy">Надёжный источник ответственно выловленных и<br className="desktop"/> выращенных морепродуктов для профессионалов Европы.</p>
      <div className="rb-actions"><WaterRippleButton onClick={() => window.location.href = '/catalog'}>Смотреть ассортимент</WaterRippleButton><button className="rb-ghost" onClick={() => document.getElementById('about')?.scrollIntoView()}>Как мы работаем ↓</button></div>
    </div>
    <div className="rb-coordinates"><span>59° 54' N · 10° 45' E</span><span>COLD-CHAIN VERIFIED / 2026</span><span>SCROLL TO EXPLORE ↓</span></div>
  </section>
}

function Home() {
  return <main className="rb-site">
    <header className="rb-nav">
      <a href="/" className="rb-logo"><strong>ROYAL BALTIC</strong><small>SEAFOOD</small></a>
      <nav><a href="/catalog">Каталог</a><a href="#supply">Поставки</a><a href="#logistics">Логистика</a><a href="#about">О компании</a></nav>
      <div className="rb-nav-actions"><button className="icon-btn" aria-label="Search">⌕</button><button className="lang">RU⌄</button><button className="account" onClick={() => window.location.href = '/catalog'}>Войти →</button><WaterRippleButton onClick={() => window.location.href = '/catalog'}>Открыть оптовый аккаунт</WaterRippleButton></div>
    </header>

    <Hero />

    <section id="about" className="rb-intro">
      <div className="rb-section-no">01 · ЗАКУПКИ БЕЗ СЮРПРИЗОВ</div>
      <div className="rb-two-col"><div><p className="rb-kicker teal">НОВЫЙ ПОДХОД К ЗАКУПКАМ</p><h2>Создано для<br/><i>вашей работы.</i></h2></div><div className="rb-order-card"><p>Tell us what you need. We'll handle the rest.</p><div className="order-line"><span>Доставка в</span><b>Europe⌄</b></div><div className="order-grid"><span>WEEKLY VOLUME<br/><b>1–5 pallets</b></span><span>YOUR BUSINESS<br/><b>Restaurant group</b></span><button onClick={() => window.location.href = '/catalog'}>↗</button></div></div></div>
    </section>

    <section id="supply" className="rb-products"><div className="rb-section-no">02 · ДОСТУПНО СЕЙЧАС</div><div className="rb-section-head"><div><p className="rb-kicker teal">ИЗ НАШИХ ВОД</p><h2>К вашему<br/><i>меню.</i></h2></div><div className="rb-side-copy"><p>Наш ассортимент меняется по сезону. Каждая позиция проверяется по размеру, температуре и документации до выхода в продажу.</p><a href="/catalog">Весь каталог ↗</a></div></div><div className="rb-product-grid"><ProductTeaser n="01" title="Wild Baltic Salmon" spec="H&G · 4–6 kg"/><ProductTeaser n="02" title="North Sea Cod Loin" spec="H&G · 4–6 kg"/><ProductTeaser n="03" title="Cold-Water Prawns" spec="H2O · 4–6 kg"/></div></section>

    <section id="quality" className="rb-dark"><div><p className="rb-section-no">03 · ПРОИСХОЖДЕНИЕ ПОДТВЕРЖДЕНО</p><h2>Ничего<br/>скрытого<br/><i>подо льдом.</i></h2><p className="rb-dark-copy">От landing до loading bay — мы сохраняем ясную цепочку поставки. Каждый этап документирован.</p><button className="rb-outline" onClick={() => document.getElementById('logistics')?.scrollIntoView()}>Наши стандарты ↗</button></div><div className="rb-timeline"><div><b>01</b><span><strong>Catch / Farm</strong><small>Origin recorded at source</small></span></div><div><b>02</b><span><strong>Quality control</strong><small>Temperature and grade verified</small></span></div><div><b>03</b><span><strong>Cold-chain</strong><small>Sealed and delivered on schedule</small></span></div></div></section>

    <section id="logistics" className="rb-logistics"><div><p className="rb-section-no">04 · ПОДДЕРЖКА ROYAL BALTIC</p><p className="rb-kicker teal">COLD-CHAIN, WITHOUT COMPROMISE</p><h2>Вовремя —<br/>это <i>наш<br/>стандарт.</i></h2><p>Наша сеть дистрибуции соединяет северные воды с городами, где живёт европейская гастрономия.</p><a href="/catalog">Talk to logistics ↗</a></div><div className="rb-map"><span>Oslo</span><span>Copenhagen</span><span>Hamburg</span><span>Paris</span><div className="route"/></div></section>

    <section id="contact" className="rb-cta"><p className="rb-kicker">FOR RESTAURANTS, RETAILERS & FOOD SERVICE</p><h2>Let's make your<br/><i>next catch count.</i></h2><p>Получите доступ к доступности, партнёрским ценам и условиям, которые подходят вашему бизнесу.</p><WaterRippleButton onClick={() => window.location.href = '/catalog'}>Открыть оптовый аккаунт</WaterRippleButton></section>
    <footer className="rb-footer"><a href="/" className="rb-logo"><strong>ROYAL BALTIC</strong><small>SEAFOOD</small></a><span>© 2026 ROYAL BALTIC SEAFOOD</span><span>TERMS · PRIVACY</span><span>DE · FR · EN · RU</span></footer>
  </main>
}

function ProductTeaser({ n, title, spec }: { n: string; title: string; spec: string }) { return <article className="rb-product"><div className="rb-fish-image"><span>{n}</span><small>Available now</small><div className="boat">RB</div></div><div className="rb-product-body"><div><h3>{title}</h3><p>{spec}</p></div><button onClick={() => window.location.href = '/catalog'}>Открыть →</button></div><div className="rb-product-foot"><span>♧ Partner pricing</span><a href="/catalog">Подробнее ↗</a></div></article> }

const path = window.location.pathname
createRoot(document.getElementById('root')!).render(<React.StrictMode>{path.startsWith('/admin') ? <Admin/> : path === '/catalog' || path.startsWith('/catalog/') ? <Catalog/> : <Home/>}</React.StrictMode>)
