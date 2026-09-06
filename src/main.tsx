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

const scenes = [
  { kicker: '01 · THE BALTIC', title: <>Дикая рыба.<br/><i>С характером моря.</i></>, copy: 'Рыба и морепродукты из холодных северных вод — для профессиональной кухни и торговли Европы.', light: false },
  { kicker: '02 · TRACEABILITY', title: <>От воды<br/><i>до вашей кухни.</i></>, copy: 'Происхождение, обработка, температура, упаковка и документы сопровождают поставку.', light: true },
  { kicker: '03 · B2B SUPPLY', title: <>Ваш бизнес.<br/><i>Ваше море.</i></>, copy: 'Персональные B2B-условия, регулярные поставки и холодовая логистика по Германии и ЕС.', light: false },
]

function ScrollHero({ onScene }: { onScene: (light: boolean, scrolled: boolean) => void }) {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      const el = ref.current; if (!el) return
      const distance = Math.max(1, el.offsetHeight - window.innerHeight)
      const p = Math.max(0, Math.min(0.999, (window.scrollY - el.offsetTop) / distance))
      setProgress(p); onScene(p > .34 && p < .67, p > .03)
      frame = 0
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame) }
  }, [onScene])
  const sceneIndex = progress < .34 ? 0 : progress < .67 ? 1 : 2
  return <section ref={ref} className="rb-hero-story">
    <div className="rb-hero-stage">
      <div className="rb-scene scene-a" style={{ opacity: 1 - Math.min(1, progress / .34) }} />
      <div className="rb-scene scene-b" style={{ opacity: Math.max(0, 1 - Math.abs(progress - .5) / .17) }} />
      <div className="rb-scene scene-c" style={{ opacity: Math.max(0, (progress - .55) / .45) }} />
      <div className="rb-hero-grain" />
      <div className="rb-hero-vignette" />
      <div className={`rb-hero-fixed ${scenes[sceneIndex].light ? 'is-light' : ''}`}>
        <div className="rb-hero-copy-lock">
          <p className="rb-kicker">{scenes[sceneIndex].kicker}</p>
          <h1 key={sceneIndex}>{scenes[sceneIndex].title}</h1>
          <p>{scenes[sceneIndex].copy}</p>
          <div className="rb-actions"><WaterRippleButton onClick={() => window.location.href = '/catalog'}>Смотреть каталог</WaterRippleButton><button className="rb-hero-secondary" onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Стать B2B-клиентом</button></div>
        </div>
        <div className="rb-hero-scrollmark"><span>SCROLL TO EXPLORE</span><b>{String(Math.round(progress * 100)).padStart(2, '0')}</b></div>
      </div>
      <div className="rb-hero-coordinates"><span>59° 54' N · 10° 45' E</span><span>BALTIC / NORTH ATLANTIC</span><span>COLD-CHAIN VERIFIED / 2026</span></div>
    </div>
  </section>
}

function Home() {
  const [heroLight, setHeroLight] = useState(false)
  const [heroScrolled, setHeroScrolled] = useState(false)
  const onScene = (light: boolean, scrolled: boolean) => { setHeroLight(light); setHeroScrolled(scrolled) }
  return <main className="rb-site">
    <header className={`rb-nav rb-nav-floating ${heroLight ? 'is-light' : ''} ${heroScrolled ? 'is-scrolled' : ''}`}>
      <a href="/" className="rb-logo"><strong>ROYAL BALTIC</strong><small>SEAFOOD</small></a>
      <nav><a href="/catalog">Каталог</a><a href="#about">О компании</a><a href="#quality">Качество</a><a href="#logistics">Логистика</a><a href="#b2b">B2B</a></nav>
      <div className="rb-nav-actions"><button className="lang">RU⌄</button><button className="account" onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Войти</button><WaterRippleButton onClick={() => document.getElementById('b2b')?.scrollIntoView()}>B2B аккаунт</WaterRippleButton></div>
    </header>

    <ScrollHero onScene={onScene} />

    <section id="about" className="rb-editorial rb-about">
      <div className="rb-section-no">04 · ROYAL BALTIC</div>
      <div className="rb-editorial-main"><p className="rb-kicker teal">NOT A CATALOGUE. A SUPPLY CHAIN.</p><h2>Мы не просто продаём<br/><i>рыбу.</i></h2><p className="rb-lead">Мы строим понятный путь продукта — от северной воды до профессионального покупателя. Поэтому в основе Royal Baltic не витрина, а доверие, происхождение и способность стабильно поставлять.</p></div>
      <div className="rb-stat-rail"><div><b>01</b><strong>Origin first</strong><span>Понятное происхождение продукта.</span></div><div><b>02</b><strong>Cold by design</strong><span>Холодовая цепь как часть продукта.</span></div><div><b>03</b><strong>Built for B2B</strong><span>Условия под реальный бизнес.</span></div></div>
    </section>

    <section id="supply" className="rb-product-world">
      <div className="rb-section-no">05 · PRODUCT WORLDS</div>
      <div className="rb-product-heading"><div><p className="rb-kicker teal">THE CATCH</p><h2>Три мира.<br/><i>Один стандарт.</i></h2></div><a href="/catalog">Открыть каталог ↗</a></div>
      <div className="rb-product-scenes">
        <a href="/catalog" className="rb-product-scene scene-fish"><span>01 / WILD</span><div><small>01</small><h3>Дикая рыба</h3><p>Cold waters · whole fish · fillet</p></div></a>
        <a href="/catalog" className="rb-product-scene scene-seafood"><span>02 / SEAFOOD</span><div><small>02</small><h3>Морепродукты</h3><p>Shellfish · crustaceans · selected range</p></div></a>
        <a href="/catalog" className="rb-product-scene scene-frozen"><span>03 / COLD</span><div><small>03</small><h3>Заморозка</h3><p>IQF · seafrozen · professional formats</p></div></a>
      </div>
    </section>

    <section id="quality" className="rb-dark rb-quality-story">
      <div className="rb-quality-intro"><p className="rb-section-no">06 · TRACEABILITY</p><p className="rb-kicker teal">EVERY BOX HAS A STORY</p><h2>Прозрачность<br/>вместо<br/><i>обещаний.</i></h2><p className="rb-dark-copy">Для каждой поставки важны происхождение, вид, обработка, температура, упаковка и сопровождающие документы. Конкретные сертификаты и документы зависят от продукта и партии.</p></div>
      <div className="rb-trace-story"><div className="trace-line"/><div className="trace-step"><b>01</b><span>WATER</span><strong>Источник</strong><p>Вид · район вылова · поставщик</p></div><div className="trace-step"><b>02</b><span>CONTROL</span><strong>Контроль</strong><p>Температура · калибр · упаковка</p></div><div className="trace-step"><b>03</b><span>EUROPE</span><strong>Поставка</strong><p>Документы · холодовая цепь · ETA</p></div><div className="trace-marks"><span>MSC</span><span>IFS</span><span>HACCP</span></div></div>
    </section>

    <section id="logistics" className="rb-logistics-story">
      <div className="rb-logistics-copy"><p className="rb-section-no">07 · EUROPEAN COLD CHAIN</p><p className="rb-kicker teal">FROM NORTH TO SOUTH</p><h2>Море<br/>заканчивается.<br/><i>Поставка — нет.</i></h2><p>Royal Baltic проектируется вокруг профессиональной логистики: контролируемая температура, понятные сроки и условия, рассчитанные под формат заказа.</p><a href="#b2b">Запросить условия ↗</a></div>
      <div className="rb-europe-map"><div className="map-water"/><span className="map-node n1">SOURCE</span><span className="map-node n2">DE</span><span className="map-node n3">FR</span><span className="map-node n4">EU</span><svg viewBox="0 0 700 420" aria-hidden="true"><path d="M118 94 C205 110 230 154 318 190 S440 254 535 315"/><path d="M318 190 C366 150 430 145 493 175"/></svg></div>
    </section>

    <section id="b2b" className="rb-b2b-story"><div className="rb-b2b-copy"><p className="rb-section-no">08 · YOUR BUSINESS ACCOUNT</p><p className="rb-kicker teal">B2B, WITHOUT THE FRICTION</p><h2>Ваш бизнес.<br/><i>Ваши цены.</i></h2><p>Публичный каталог — без закрытых цен. После регистрации компании и проверки мы открываем нужный B2B-класс: HoReCa, Retail, Wholesale или Small Wholesale.</p></div><B2BPanel/></section>

    <section id="contact" className="rb-cta rb-final"><div><p className="rb-kicker">HOReCa · RETAIL · WHOLESALE · DISTRIBUTORS</p><h2>Откройте<br/><i>своё море.</i></h2></div><div><p>Регистрация B2B-клиента, персональные цены, заказы, счета, оплаты, доставка и поддержка — в одном рабочем кабинете.</p><div className="rb-cta-actions"><WaterRippleButton onClick={() => document.getElementById('b2b')?.scrollIntoView()}>Стать B2B-клиентом</WaterRippleButton><button className="rb-ghost" onClick={() => window.location.href = '/catalog'}>Смотреть каталог</button></div></div></section>
    <footer className="rb-footer"><a href="/" className="rb-logo"><strong>ROYAL BALTIC</strong><small>SEAFOOD</small></a><div><a href="/catalog">Каталог</a><a href="#about">О компании</a><a href="#quality">Качество</a><a href="#logistics">Логистика</a><a href="#contact">Контакты</a></div><span>© 2026 ROYAL BALTIC SEAFOOD</span><span>TERMS · PRIVACY</span><span>DE · FR · EN · RU</span></footer>
  </main>
}

function B2BPanel() { const [open, setOpen] = useState(false); return <div className="rb-b2b-panel"><div className="rb-account-choice"><button onClick={() => setOpen(true)}><span>01</span><strong>Уже есть аккаунт?</strong><small>Войти через Google или Email</small><b>↗</b></button><button onClick={() => setOpen(true)}><span>02</span><strong>Новая компания?</strong><small>Зарегистрироваться как B2B-клиент</small><b>↗</b></button></div><div className="rb-account-result"><span>B2B CABINET</span><div><strong>Personal pricing</strong><strong>Orders & delivery</strong><strong>Invoices & payments</strong><strong>Support from your account</strong></div></div>{open && <div className="rb-auth-note"><button aria-label="Close" onClick={() => setOpen(false)}>×</button><strong>Вход / регистрация</strong><p>Здесь будет подключена Supabase Auth: Google и Email. Для B2B-клиента после проверки компании откроются персональные цены и кабинет.</p><span>UI подготовлен · Auth подключаем следующим этапом</span></div>}</div> }

const path = window.location.pathname
createRoot(document.getElementById('root')!).render(<React.StrictMode>{path.startsWith('/admin') ? <Admin/> : path === '/catalog' || path.startsWith('/catalog/') ? <Catalog/> : <Home/>}</React.StrictMode>)
