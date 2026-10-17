const json = (status: number, body: object) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
})

Deno.serve(async (request) => {
  const token = Deno.env.get('EMAIL_FUNCTION_TOKEN')
  const resend = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('EMAIL_FROM')
  const to = Deno.env.get('COMMISSION_RECIPIENT')
  if (!token || !resend || !from || !to) return json(503, { error: 'Email delivery is not configured' })
  if (request.method !== 'POST' || request.headers.get('x-baetee-token') !== token) return json(403, { error: 'Forbidden' })
  if (Number(request.headers.get('content-length') || 0) > 8192) return json(413, { error: 'Too large' })
  let data: Record<string, unknown>
  try {
    const reader = request.body?.getReader()
    if (!reader) return json(400, { error: 'Invalid JSON' })
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 8192) {
        await reader.cancel()
        return json(413, { error: 'Too large' })
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid JSON')
  } catch { return json(400, { error: 'Invalid JSON' }) }
  const fields = ['requestId', 'name', 'email', 'piece', 'kind', 'details'] as const
  if (fields.some((field) => typeof data[field] !== 'string') ||
      typeof data.requestId !== 'string' || !/^[a-f0-9]{64}$/.test(data.requestId) ||
      typeof data.name !== 'string' || data.name.length > 100 ||
      typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
      typeof data.piece !== 'string' || data.piece.length > 150 ||
      (data.kind !== 'painting' && data.kind !== 'baetee') ||
      typeof data.details !== 'string' || data.details.length > 2000 ||
      (data.budget !== undefined && (!Number.isSafeInteger(data.budget) || Number(data.budget) < 1))) return json(400, { error: 'Invalid request' })
  const text = [
    `Name: ${data.name}`, `Email: ${data.email}`, `Piece: ${data.piece}`,
    `Category: ${data.kind}`, `Budget (INR): ${data.budget || 'Not provided'}`,
    '', String(data.details),
  ].join('\n')
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resend}`, 'content-type': 'application/json', 'Idempotency-Key': `commission-owner/${data.requestId}` },
    body: JSON.stringify({ from, to: [to], subject: 'New BAETEE commission request', text }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) return json(502, { error: 'Email provider failed' })
  const confirmation = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resend}`, 'content-type': 'application/json', 'Idempotency-Key': `commission-customer/${data.requestId}` },
    body: JSON.stringify({
      from, to: [data.email], subject: 'We received your BAETEE commission request',
      text: `Hello ${data.name},\n\nWe received your request about ${data.piece}. We will reply to this email address.\n\nBAETEE`,
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!confirmation.ok) return json(502, { error: 'Confirmation email failed' })
  return json(200, { ok: true })
})
