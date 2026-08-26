import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const products = [
  { name: 'Baltic Salmon', spec: 'Premium fillet · 1–2 kg', availability: 'In stock' },
  { name: 'Herring', spec: 'Whole · 10 kg carton', availability: 'In stock' },
  { name: 'Pike-perch', spec: 'Frozen fillet · 5 kg', availability: 'On request' },
]

function WaterRippleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripples = useRef<Array<{ x: number; y: number; radius: number; alpha: number }>>([])
  const lastRipple = useRef(0)

  useEffect(() => {
    const button = buttonRef.current
    const canvas = canvasRef.current
    if (!button || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = button.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const addRipple = (clientX: number, clientY: number) => {
      const now = performance.now()
      if (now - lastRipple.current < 85) return
      lastRipple.current = now
      const rect = button.getBoundingClientRect()
      ripples.current.push({
        x: clientX - rect.left,
        y: clientY - rect.top,
        radius: 2,
        alpha: 0.52,
      })
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') addRipple(event.clientX, event.clientY)
    }

    const onPointerDown = (event: PointerEvent) => addRipple(event.clientX, event.clientY)

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(button)
    button.addEventListener('pointermove', onPointerMove)
    button.addEventListener('pointerdown', onPointerDown)

    let frame = 0
    const animate = () => {
      const rect = button.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      ripples.current.forEach((ripple) => {
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${ripple.alpha})`
        ctx.lineWidth = 1.15
        ctx.stroke()

        if (ripple.radius > 10) {
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.68, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,255,255,${ripple.alpha * 0.28})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        ripple.radius += 1.05
        ripple.alpha -= 0.017
      })

      ripples.current = ripples.current.filter((r) => r.alpha > 0 && r.radius < 68)
      frame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      button.removeEventListener('pointermove', onPointerMove)
      button.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <button ref={buttonRef} className="b2b-ripple" onClick={onClick}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="b2b-ripple__content">
        <span className="b2b-ripple__icon" aria-hidden="true">♙</span>
        {children}
        <span className="b2b-ripple__arrow" aria-hidden="true">→</span>
      </span>
    </button>
  )
}

function Hero() {
  return (
    <section className="hero hero--cinematic">
      <video
        className="hero__video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero/royal-baltic-hero.jpg"
        aria-hidden="true"
      >
        <source src="/hero/royal-baltic-hero.mp4" type="video/mp4" />
      </video>

      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content">
        <p className="hero__eyebrow">BALTIC SEAFOOD · PROFESSIONAL SUPPLY</p>
        <h1>FROM THE COLD<br />BALTIC WATERS<br />TO YOUR BUSINESS</h1>
        <p className="hero__lead">Premium seafood, sustainably sourced<br className="desktop-only" /> for professionals worldwide.</p>
        <div className="hero__rule" />
        <div className="hero__actions">
          <WaterRippleButton>START B2B CLIENT</WaterRippleButton>
          <button className="hero__secondary">EXPLORE PRODUCTS <span aria-hidden="true">→</span></button>
        </div>
        <span className="hero__note">Professional buyers only</span>
      </div>

      <div className="hero__trust" aria-label="Royal Baltic advantages">
        <div><strong>♧</strong><span>SUSTAINABLY<br />SOURCED</span></div>
        <div><strong>✳</strong><span>PREMIUM<br />QUALITY</span></div>
        <div><strong>♢</strong><span>RELIABLE<br />SUPPLY</span></div>
        <div><strong>◎</strong><span>GLOBAL<br />DELIVERY</span></div>
      </div>
    </section>
  )
}

function App() {
  return (
    <main>
      <nav className="nav nav--overlay">
        <div className="brand brand--light">ROYAL <span>BALTIC</span><small>SEAFOOD</small></div>
        <div className="nav-links">
          <a href="#about">About us</a>
          <a href="#catalog">Products</a>
          <a href="#supply">Sustainability</a>
          <a href="#quality">Quality</a>
          <a href="#journal">Journal</a>
          <a href="#contact">Contact</a>
          <span className="language">◎ EN⌄</span>
          <WaterRippleButton>START B2B</WaterRippleButton>
          <button className="nav-contact">GET IN TOUCH</button>
        </div>
      </nav>

      <Hero />

      <section id="b2b" className="stats">
        <div><strong>B2B</strong><span>Professional pricing</span></div>
        <div><strong>MOQ</strong><span>Flexible order quantities</span></div>
        <div><strong>EU</strong><span>Regular delivery routes</span></div>
        <div><strong>RFQ</strong><span>Quote on request</span></div>
      </section>

      <section id="catalog" className="catalog">
        <div className="section-head"><div><p className="eyebrow">SELECTED PRODUCTS</p><h2>From the Baltic to your kitchen.</h2></div><button className="secondary">View all products</button></div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="card" key={product.name}>
              <div className="product-image">RB</div>
              <div className="card-body"><span className="availability">● {product.availability}</span><h3>{product.name}</h3><p>{product.spec}</p><button>Request price →</button></div>
            </article>
          ))}
        </div>
      </section>

      <section id="supply" className="supply">
        <div><p className="eyebrow">BUILT FOR PROFESSIONALS</p><h2>Not just a shop.<br />A supply platform.</h2></div>
        <p>Different prices for different buyer types, MOQ, pack sizes, availability, recurring supply and commercial quotations will live in one coherent B2B layer.</p>
      </section>

      <footer><div className="brand">ROYAL <span>BALTIC</span></div><span>© 2026 Royal Baltic</span><span>Professional seafood supply</span></footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
