import React, { useEffect, useMemo, useState } from 'react'
import './catalog.css'

type Product = {
  id: string
  sku: string
  slug: string
  name: string
  description: string | null
  category: string | null
  origin_country_code: string | null
  catch_area: string | null
  processing_type: string | null
  storage_temperature_c: number | null
  is_frozen: boolean
  status: string
}

type Variant = {
  id: string
  product_id: string
  sku: string
  name: string
  net_weight_kg: number | null
  gross_weight_kg: number | null
  units_per_case: number | null
  min_order_qty: number | null
  order_qty_step: number
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tleyztmdszcypateivpz.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

async function supabaseGet<T>(table: string, query: string): Promise<T[]> {
  if (!SUPABASE_KEY) throw new Error('Supabase publishable key is not configured in Vercel.')
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Accept: 'application/json' },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 240)}`)
  return text ? JSON.parse(text) : []
}

const countryNames: Record<string, string> = {
  ES: 'Spain', FI: 'Finland', EE: 'Estonia', FR: 'France', NO: 'Norway', GB: 'United Kingdom', EU: 'EU distribution',
}

function country(code: string | null) { return code ? countryNames[code] || code : 'Baltic / EU source' }

function CatalogCard({ product, variant, onOpen }: { product: Product; variant?: Variant; onOpen: () => void }) {
  return <article className="catalog-card">
    <button className="catalog-visual" onClick={onOpen} aria-label={`Open ${product.name}`}>
      <span className="catalog-number">{product.sku}</span>
      <span className="catalog-monogram">RB</span>
      <span className="catalog-waterline" />
      <span className="catalog-origin">{country(product.origin_country_code)}</span>
    </button>
    <div className="catalog-card-body">
      <div className="catalog-meta-row">
        <span className="catalog-status"><i /> B2B CATALOG</span>
        <span>{product.is_frozen ? 'Frozen · −18°C' : 'Chilled'}</span>
      </div>
      <h3>{product.name}</h3>
      <p>{product.description || product.processing_type || 'Professional seafood supply'}</p>
      <div className="catalog-specs">
        <span><b>Pack</b>{variant?.net_weight_kg ? `${variant.net_weight_kg} kg` : 'On request'}</span>
        <span><b>MOQ</b>{variant?.min_order_qty ? `${variant.min_order_qty} kg` : 'On request'}</span>
        <span><b>Origin</b>{country(product.origin_country_code)}</span>
      </div>
      <div className="catalog-card-footer">
        <span className="price-locked">Partner pricing <em>LOCKED</em></span>
        <button className="catalog-link" onClick={onOpen}>View product <span>→</span></button>
      </div>
    </div>
  </article>
}

function ProductPanel({ product, variant, close }: { product: Product; variant?: Variant; close: () => void }) {
  return <div className="catalog-overlay" onMouseDown={close}>
    <aside className="product-panel" onMouseDown={e => e.stopPropagation()}>
      <button className="panel-close" onClick={close} aria-label="Close">×</button>
      <div className="panel-kicker">{product.sku} · PROFESSIONAL SUPPLY</div>
      <div className="panel-visual"><span>RB</span><small>{country(product.origin_country_code)}</small></div>
      <p className="eyebrow">PRODUCT DETAILS</p>
      <h2>{product.name}</h2>
      <p className="panel-description">{product.description || 'Premium seafood for professional buyers.'}</p>
      <div className="panel-grid">
        <div><span>Category</span><strong>{product.category || 'Seafood'}</strong></div>
        <div><span>Processing</span><strong>{product.processing_type || '—'}</strong></div>
        <div><span>Net weight</span><strong>{variant?.net_weight_kg ? `${variant.net_weight_kg} kg` : '—'}</strong></div>
        <div><span>MOQ</span><strong>{variant?.min_order_qty ? `${variant.min_order_qty} kg` : 'On request'}</strong></div>
        <div><span>Order step</span><strong>{variant?.order_qty_step || 1} kg</strong></div>
        <div><span>Storage</span><strong>{product.storage_temperature_c != null ? `${product.storage_temperature_c}°C` : 'Frozen'}</strong></div>
        <div><span>Origin</span><strong>{country(product.origin_country_code)}</strong></div>
        <div><span>Availability</span><strong>Confirmed with order</strong></div>
      </div>
      <div className="panel-price"><span>Partner price</span><strong>Available after B2B registration</strong></div>
      <button className="panel-cta" onClick={() => { window.location.href = '/#b2b' }}>START B2B ACCOUNT <span>↗</span></button>
      <p className="panel-note">Prices are not public. Approved customers receive the price list assigned to their company segment.</p>
    </aside>
  </div>
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const rows = await supabaseGet<Product>('products', 'select=id,sku,slug,name,description,category,origin_country_code,catch_area,processing_type,storage_temperature_c,is_frozen,status&status=eq.active&order=category.asc,name.asc')
        if (cancelled) return
        setProducts(rows)
        if (rows.length) {
          const ids = rows.map(x => x.id).join(',')
          const vs = await supabaseGet<Variant>('product_variants', `select=id,product_id,sku,name,net_weight_kg,gross_weight_kg,units_per_case,min_order_qty,order_qty_step&product_id=in.(${ids})&order=sku.asc`)
          if (!cancelled) setVariants(vs)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally { if (!cancelled) setLoading(false) }
    }
    load(); return () => { cancelled = true }
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))], [products])
  const filtered = useMemo(() => products.filter(p => {
    const text = `${p.name} ${p.sku} ${p.category || ''} ${p.description || ''}`.toLowerCase()
    return (category === 'All' || p.category === category) && (!search || text.includes(search.toLowerCase()))
  }), [products, category, search])
  const variantFor = (id: string) => variants.find(v => v.product_id === id)

  return <main className="catalog-page">
    <header className="catalog-header">
      <div className="catalog-nav"><a href="/" className="catalog-brand">ROYAL <span>BALTIC</span><small>SEAFOOD</small></a><div><a href="/">Home</a><a className="active" href="/catalog">Products</a><a href="/#supply">Sustainability</a><a href="/#contact">Contact</a></div><button onClick={() => { window.location.href = '/#b2b' }}>START B2B <span>→</span></button></div>
      <div className="catalog-intro">
        <div><p className="eyebrow">ROYAL BALTIC · PRODUCT CATALOG</p><h1>From the Baltic<br/><i>to your kitchen.</i></h1></div>
        <p>Professional seafood supply with traceable origin, controlled cold-chain and commercial terms built around your business.</p>
      </div>
    </header>

    <section className="catalog-toolbar">
      <div className="catalog-count">{loading ? 'LOADING CATALOG' : `${filtered.length.toString().padStart(2, '0')} PRODUCTS`}</div>
      <div className="catalog-filters"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search species, SKU…" aria-label="Search products" />{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
    </section>

    {error && <div className="catalog-alert"><strong>Catalog connection needs configuration.</strong><span>{error}</span></div>}
    {!error && !loading && products.length === 0 && <div className="catalog-empty"><p className="eyebrow">CATALOG PREPARATION</p><h2>Products are coming aboard.</h2><p>The storefront is connected to Supabase, but there are currently no active products in the database. Import the test catalog from Back Office to populate this view.</p><a href="/admin">OPEN BACK OFFICE →</a></div>}
    {!error && filtered.length > 0 && <section className="catalog-grid">{filtered.map(p => <CatalogCard key={p.id} product={p} variant={variantFor(p.id)} onOpen={() => setSelected(p)} />)}</section>}

    <section className="catalog-bottom"><div><p className="eyebrow">COMMERCIAL TERMS</p><h2>One catalog.<br/><i>Different terms.</i></h2></div><div className="commercial-points"><div><b>01</b><span>Public product data</span><p>Species, origin, processing, pack size and cold-chain information are visible before registration.</p></div><div><b>02</b><span>Partner pricing</span><p>Prices stay private and are resolved from the customer segment and company-specific overrides.</p></div><div><b>03</b><span>RFQ when needed</span><p>Large or special requirements can move directly into a commercial quotation.</p></div></div></section>
    <footer className="catalog-footer"><a href="/" className="catalog-brand">ROYAL <span>BALTIC</span><small>SEAFOOD</small></a><span>© 2026 Royal Baltic</span><span>Professional seafood supply</span></footer>
    {selected && <ProductPanel product={selected} variant={variantFor(selected.id)} close={() => setSelected(null)} />}
  </main>
}
