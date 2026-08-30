export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.authorization;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY');
    return response.status(500).json({ ok: false, error: 'Supabase environment variables are missing' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    // Lightweight REST request. We deliberately use the publishable/anon key,
    // never the Supabase service-role key.
    const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/companies?select=id&limit=1`;

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!result.ok) {
      const body = await result.text();
      console.error('Supabase heartbeat failed', result.status, body.slice(0, 500));
      return response.status(502).json({
        ok: false,
        status: result.status,
        error: 'Supabase REST endpoint did not respond successfully',
      });
    }

    return response.status(200).json({
      ok: true,
      service: 'BalticMare Supabase keep-alive',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase heartbeat error', error);
    return response.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown heartbeat error',
    });
  } finally {
    clearTimeout(timeout);
  }
}
