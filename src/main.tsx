import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import Admin from './admin'

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
    const button = buttonRef.current, canvas = canvasRef.current
    if (!button || !canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const resize = () => { const r=button.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2); canvas.width=r.width*dpr; canvas.height=r.height*dpr; canvas.style.width=`${r.width}px`; canvas.style.height=`${r.height}px`; ctx.setTransform(dpr,0,0,dpr,0,0) }
    const addRipple=(x:number,y:number)=>{ const now=performance.now(); if(now-lastRipple.current<85)return; lastRipple.current=now; const r=button.getBoundingClientRect(); ripples.current.push({x:x-r.left,y:y-r.top,radius:2,alpha:.52}) }
    const move=(e:PointerEvent)=>{if(e.pointerType==='mouse')addRipple(e.clientX,e.clientY)}, down=(e:PointerEvent)=>addRipple(e.clientX,e.clientY)
    resize(); const observer=new ResizeObserver(resize); observer.observe(button); button.addEventListener('pointermove',move); button.addEventListener('pointerdown',down)
    let frame=0; const animate=()=>{const r=button.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ripples.current.forEach(q=>{ctx.beginPath();ctx.arc(q.x,q.y,q.radius,0,Math.PI*2);ctx.strokeStyle=`rgba(255,255,255,${q.alpha})`;ctx.lineWidth=1.15;ctx.stroke();q.radius+=1.05;q.alpha-=.017});ripples.current=ripples.current.filter(q=>q.alpha>0&&q.radius<68);frame=requestAnimationFrame(animate)};animate()
    return()=>{cancelAnimationFrame(frame);observer.disconnect();button.removeEventListener('pointermove',move);button.removeEventListener('pointerdown',down)}
  },[])
  return <button ref={buttonRef} className="b2b-ripple" onClick={onClick}><canvas ref={canvasRef} aria-hidden="true"/><span className="b2b-ripple__content"><span className="b2b-ripple__icon" aria-hidden="true">♙</span>{children}<span className="b2b-ripple__arrow" aria-hidden="true">→</span></span></button>
}
function Hero(){return <section className="hero hero--cinematic"><video className="hero__video" autoPlay muted loop playsInline preload="metadata" poster="/hero/royal-baltic-hero.jpg" aria-hidden="true"><source src="/hero/royal-baltic-hero.mp4" type="video/mp4"/></video><div className="hero__shade"/><div className="hero__content"><p className="hero__eyebrow">BALTIC SEAFOOD · PROFESSIONAL SUPPLY</p><h1>FROM THE COLD<br/>BALTIC WATERS<br/>TO YOUR BUSINESS</h1><p className="hero__lead">Premium seafood, sustainably sourced<br className="desktop-only"/> for professionals worldwide.</p><div className="hero__rule"/><div className="hero__actions"><WaterRippleButton>START B2B CLIENT</WaterRippleButton><button className="hero__secondary">EXPLORE PRODUCTS <span aria-hidden="true">→</span></button></div><span className="hero__note">Professional buyers only</span></div><div className="hero__trust" aria-label="Royal Baltic advantages"><div><strong>♧</strong><span>SUSTAINABLY<br/>SOURCED</span></div><div><strong>✳</strong><span>PREMIUM<br/>QUALITY</span></div><div><strong>♢</strong><span>RELIABLE<br/>SUPPLY</span></div><div><strong>◎</strong><span>GLOBAL<br/>DELIVERY</span></div></div></section>}
function Storefront(){return <main><nav className="nav nav--overlay"><div className="brand brand--light">ROYAL <span>BALTIC</span><small>SEAFOOD</small></div><div className="nav-links"><a href="#about">About us</a><a href="#catalog">Products</a><a href="#supply">Sustainability</a><a href="#quality">Quality</a><a href="#journal">Journal</a><a href="#contact">Contact</a><span className="language">◎ EN⌄</span><WaterRippleButton>START B2B</WaterRippleButton><button className="nav-contact">GET IN TOUCH</button></div></nav><Hero/><section id="b2b" className="stats"><div><strong>B2B</strong><span>Professional pricing</span></div><div><strong>MOQ</strong><span>Flexible order quantities</span></div><div><strong>EU</strong><span>Regular delivery routes</span></div><div><strong>RFQ</strong><span>Quote on request</span></div></section><section id="catalog" className="catalog"><div className="section-head"><div><p className="eyebrow">SELECTED PRODUCTS</p><h2>From the Baltic to your kitchen.</h2></div><button className="secondary">View all products</button></div><div className="product-grid">{products.map(p=><article className="card" key={p.name}><div className="product-image">RB</div><div className="card-body"><span className="availability">● {p.availability}</span><h3>{p.name}</h3><p>{p.spec}</p><button>Request price →</button></div></article>)}</div></section><section id="supply" className="supply"><div><p className="eyebrow">BUILT FOR PROFESSIONALS</p><h2>Not just a shop.<br/>A supply platform.</h2></div><p>Different prices for different buyer types, MOQ, pack sizes, availability, recurring supply and commercial quotations will live in one coherent B2B layer.</p></section><footer><div className="brand">ROYAL <span>BALTIC</span></div><span>© 2026 Royal Baltic</span><span>Professional seafood supply</span></footer></main>}
createRoot(document.getElementById('root')!).render(<React.StrictMode>{window.location.pathname.startsWith('/admin') ? <Admin/> : <Storefront/>}</React.StrictMode>)
