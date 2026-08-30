const products = [
  ['RB-COD-FIL','Треска, филе б/к','Cod fillet, boneless','Gadus morhua','Белая рыба','Блочная заморозка',10,10,'Испания / оптовый рынок',15,20.25,17.25,15,200],
  ['RB-SAL-FIL','Лосось атлантический, филе','Atlantic salmon fillet','Salmo salar','Лосось','IQF',6,15,'Новегия',20.11,27.1485,23.1265,20.11,100],
  ['RB-HER-WHL','Сельдь, тушка','Herring, whole round','Clupea harengus','Пелагическая','Блочная заморозка',20,5,'Франция / оптовый рынок',3,4.05,3.45,3,500],
  ['RB-MAC-WHL','Скумбрия, тушка','Mackerel, whole round','Scomber scombrus','Пелагическая','Блочная заморозка',20,5,'Финляндия',3.5,4.725,4.025,3.5,500],
  ['RB-PER-FIL','Окунь речной, филе','European perch fillet','Perca fluviatilis','Белая рыба','IQF',5,10,'Эстония / оптовый рынок',8,10.8,9.2,8,100],
  ['RB-HAK-FIL','Хек, филе','Hake fillet','Merluccius merluccius','Белая рыба','Блочная заморозка',10,10,'Испания / расчётный ориентир',12.5,16.875,14.375,12.5,200],
  ['RB-POL-FIL','Минтай, филе','Alaska pollock fillet','Gadus chalcogrammus','Белая рыба','IQF',10,20,'Финляндия',6.8,9.18,7.82,6.8,300],
  ['RB-SHR-IQF','Креветка холодноводная, б/г','Coldwater shrimp, peeled','Pandalus spp.','Ракообразные','IQF',5,20,'Новегия',10.5,14.175,12.075,10.5,100],
  ['RB-SQU-RIN','Кальмар, кольца','Squid rings','Loligo spp.','Головоногие','IQF',5,15,'ЕС дистрибуция / расчётный ориентир',9.2,12.42,10.58,9.2,100],
  ['RB-FCAKE','Рыбные котлеты, панировка','Fish cakes, coated','Смешанная белая рыба','Переработка','Блочная заморозка',2.5,0,'Великобритания / B2B каталог',3.53,4.7655,4.0595,3.53,50],
];

const segments = [
  ['HORECA','HoReCa','Small-volume professional buyers'],
  ['DISTRIBUTOR','Distributor','Mid-volume distributors'],
  ['WHOLESALE','Wholesale','Large-volume wholesale buyers'],
];

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

async function api(url, key, path, options = {}) {
  const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(options.headers || {}) },
  });
  const text = await r.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!r.ok) throw new Error(`${options.method || 'GET'} ${path}: ${r.status} ${text.slice(0, 500)}`);
  return body;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ ok: false, error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' });

  try {
    const segmentRows = segments.map(([code, name, description]) => ({ code, name, description, is_active: true }));
    const segResult = await api(url, key, 'customer_segments?on_conflict=code', { method: 'POST', body: JSON.stringify(segmentRows) });
    const segMap = Object.fromEntries(segResult.map(x => [x.code, x.id]));

    const priceListRows = segments.map(([code, name]) => ({ code: `PL_${code}`, name: `${name} Test Price List`, currency: 'EUR', customer_segment_id: segMap[code], is_active: true }));
    const plResult = await api(url, key, 'price_lists?on_conflict=code', { method: 'POST', body: JSON.stringify(priceListRows) });
    const plMap = Object.fromEntries(plResult.map(x => [x.code, x.id]));

    const productRows = products.map(([sku, ru, en, species, category, processing, pack, glaze, origin]) => ({
      sku, slug: slugify(sku), name: en, description: ru, category, origin_country_code: origin.includes('Испания') ? 'ES' : origin.includes('Финляндия') ? 'FI' : origin.includes('Эстония') ? 'EE' : origin.includes('Франция') ? 'FR' : origin.includes('Новегия') ? 'NO' : origin.includes('Великобритания') ? 'GB' : 'EU', processing_type: processing, storage_temperature_c: -18, is_frozen: true, status: 'active'
    }));
    const prodResult = await api(url, key, 'products?on_conflict=sku', { method: 'POST', body: JSON.stringify(productRows) });
    const prodMap = Object.fromEntries(prodResult.map(x => [x.sku, x.id]));

    const variantRows = products.map(([sku, ru, en, species, category, processing, pack, glaze, origin,,,,,moq]) => ({ product_id: prodMap[sku], sku, name: en, net_weight_kg: pack, units_per_case: 1, min_order_qty: moq, order_qty_step: pack }));
    const varResult = await api(url, key, 'product_variants?on_conflict=sku', { method: 'POST', body: JSON.stringify(variantRows) });
    const varMap = Object.fromEntries(varResult.map(x => [x.sku, x.id]));

    const packagingRows = products.map(([sku, , , , , , pack]) => ({ code: `${sku}-CASE`, name: `Case ${pack} kg`, units_per_package: 1, tare_weight_kg: 0 }));
    const pkgResult = await api(url, key, 'packagings?on_conflict=code', { method: 'POST', body: JSON.stringify(packagingRows) });
    const pkgMap = Object.fromEntries(pkgResult.map(x => [x.code, x.id]));

    const prices = products.flatMap(([sku,,,,,,, , , horeca, distributor, wholesale, moq]) => [
      { price_list_id: plMap.PL_HORECA, product_variant_id: varMap[sku], packaging_id: pkgMap[`${sku}-CASE`], unit_price: horeca, currency: 'EUR', min_qty: moq },
      { price_list_id: plMap.PL_DISTRIBUTOR, product_variant_id: varMap[sku], packaging_id: pkgMap[`${sku}-CASE`], unit_price: distributor, currency: 'EUR', min_qty: moq },
      { price_list_id: plMap.PL_WHOLESALE, product_variant_id: varMap[sku], packaging_id: pkgMap[`${sku}-CASE`], unit_price: wholesale, currency: 'EUR', min_qty: moq },
    ]);
    await api(url, key, 'price_list_items', { method: 'POST', body: JSON.stringify(prices) });

    const moqs = products.flatMap(([sku,,,,,,,,,,,,,moq]) => segments.map(([code]) => ({ product_variant_id: varMap[sku], customer_segment_id: segMap[code], min_qty: moq, qty_step: products.find(p => p[0] === sku)[6] })));
    await api(url, key, 'moq_rules', { method: 'POST', body: JSON.stringify(moqs) });

    return res.status(200).json({ ok: true, seeded: { segments: 3, price_lists: 3, products: 10, variants: 10, packagings: 10, prices: prices.length, moq_rules: moqs.length } });
  } catch (e) {
    console.error('Catalog seed failed', e);
    return res.status(502).json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' });
  }
}
