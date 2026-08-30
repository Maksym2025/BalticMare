const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const IMPORT_SECRET = process.env.CATALOG_IMPORT_SECRET || process.env.CRON_SECRET

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function sb(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw new Error(data?.message || data?.hint || data?.error || text || `Supabase HTTP ${response.status}`)
  return data
}

function slug(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
}
function code(value, fallback) {
  const s = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  return s || fallback
}
function num(value, fallback = null) {
  const n = Number(String(value ?? '').replace(',', '.').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : fallback
}

async function upsert(table, row, conflict) {
  const data = await sb(`${table}?on_conflict=${encodeURIComponent(conflict)}`, { method: 'POST', body: JSON.stringify(row) })
  return Array.isArray(data) ? data[0] : data
}

async function findOne(path) {
  const data = await sb(path)
  return Array.isArray(data) ? data[0] : data
}

async function ensurePriceItem(priceListId, variantId, packagingId, price) {
  const filter = `price_list_id=eq.${priceListId}&product_variant_id=eq.${variantId}` + (packagingId ? `&packaging_id=eq.${packagingId}` : '&packaging_id=is.null')
  const existing = await findOne(`price_list_items?select=id&${filter}&limit=1`)
  const row = { price_list_id: priceListId, product_variant_id: variantId, packaging_id: packagingId || null, unit_price: price, currency: 'EUR' }
  if (existing?.id) return sb(`price_list_items?id=eq.${existing.id}`, { method: 'PATCH', body: JSON.stringify(row) })
  return sb('price_list_items', { method: 'POST', body: JSON.stringify(row) })
}

async function ensureMoq(variantId, segmentId, minQty, step) {
  const existing = await findOne(`moq_rules?select=id&product_variant_id=eq.${variantId}&customer_segment_id=eq.${segmentId}&limit=1`)
  const row = { product_variant_id: variantId, customer_segment_id: segmentId, min_qty: minQty, qty_step: step }
  if (existing?.id) return sb(`moq_rules?id=eq.${existing.id}`, { method: 'PATCH', body: JSON.stringify(row) })
  return sb('moq_rules', { method: 'POST', body: JSON.stringify(row) })
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_KEY || !IMPORT_SECRET) return json(res, 500, { error: 'Import Layer is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and CATALOG_IMPORT_SECRET (or CRON_SECRET).' })
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' })
  if (req.headers['x-import-secret'] !== IMPORT_SECRET) return json(res, 401, { error: 'Unauthorized' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const rows = Array.isArray(body?.rows) ? body.rows : []
    if (!rows.length) return json(res, 400, { error: 'rows[] is required' })

    const segmentMap = new Map()
    const segments = [...new Set(rows.flatMap(r => (r.prices || []).map(p => p.segment)).filter(Boolean))]
    for (const name of segments) {
      const c = code(name, 'WHOLESALE')
      const segment = await upsert('customer_segments', { code: c, name, is_active: true }, 'code')
      segmentMap.set(name, segment.id)
    }

    const priceListMap = new Map()
    for (const name of segments) {
      const segmentId = segmentMap.get(name)
      const c = `PL_${code(name, 'WHOLESALE')}`
      const list = await upsert('price_lists', { code: c, name: `${name} Price List`, currency: 'EUR', customer_segment_id: segmentId, is_active: true }, 'code')
      priceListMap.set(name, list.id)
    }

    let products = 0, variants = 0, packagings = 0, prices = 0, moq = 0
    for (const r of rows) {
      const product = await upsert('products', {
        sku: r.sku,
        slug: slug(r.name) || slug(r.sku),
        name: r.name,
        category: r.category || null,
        status: 'active',
        is_frozen: true,
      }, 'sku')
      products++

      const variant = await upsert('product_variants', {
        product_id: product.id,
        sku: r.sku,
        name: r.name,
        net_weight_kg: num(r.net_weight_kg),
        min_order_qty: num(r.moq, 1),
        order_qty_step: num(r.step, 1),
      }, 'sku')
      variants++

      let packagingId = null
      if (r.packaging) {
        const packaging = await upsert('packagings', {
          code: `PKG_${code(r.packaging, r.sku)}`,
          name: r.packaging,
          units_per_package: 1,
        }, 'code')
        packagingId = packaging.id
        packagings++
      }

      for (const p of r.prices || []) {
        if (p.price == null) continue
        await ensurePriceItem(priceListMap.get(p.segment), variant.id, packagingId, num(p.price, 0))
        await ensureMoq(variant.id, segmentMap.get(p.segment), num(r.moq, 1), num(r.step, 1))
        prices++
      }
      moq++
    }

    return json(res, 200, { ok: true, products, variants, packagings, prices, moq, mode: 'upsert' })
  } catch (error) {
    console.error(error)
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) })
  }
}
