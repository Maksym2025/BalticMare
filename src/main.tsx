import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const products = [
  { name: 'Baltic Salmon', spec: 'Premium fillet · 1–2 kg', availability: 'In stock' },
  { name: 'Herring', spec: 'Whole · 10 kg carton', availability: 'In stock' },
  { name: 'Pike-perch', spec: 'Frozen fillet · 5 kg', availability: 'On request' },
]

function App() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">ROYAL <span>BALTIC</span></div>
        <div className="nav-links">
          <a href="#catalog">Catalog</a>
          <a href="#b2b">B2B</a>
          <a href="#supply">Supply</a>
          <button>Request quote</button>
        </div>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">BALTIC SEAFOOD · PROFESSIONAL SUPPLY</p>
          <h1>Seafood with a<br /><em>Nordic standard.</em></h1>
          <p className="lead">Reliable frozen fish supply for restaurants, wholesalers and professional buyers across Europe.</p>
          <div className="actions">
            <button className="primary">Explore catalog</button>
            <button className="secondary">Become a B2B customer</button>
          </div>
        </div>
        <div className="hero-mark">◒</div>
      </section>

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
