const json = (status: number, body: object) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
})

Deno.serve(async (request) => {
  const token = Deno.env.get('EMAIL_FUNCTION_TOKEN')
  const resend = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('EMAIL_FROM')
  const owner = Deno.env.get('ORDER_RECIPIENT')
  if (!token || !resend || !from || !owner) return json(503, { error: 'Email delivery is not configured' })
  if (request.method !== 'POST' || request.headers.get('x-baetee-token') !== token) return json(403, { error: 'Forbidden' })
  if (Number(request.headers.get('content-length') || 0) > 2048) return json(413, { error: 'Too large' })
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
      if (size > 2048) { await reader.cancel(); return json(413, { error: 'Too large' }) }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid JSON')
  } catch { return json(400, { error: 'Invalid JSON' }) }
  if (typeof data.orderId !== 'string' || !/^order_[A-Za-z0-9]+$/.test(data.orderId) ||
      typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
      typeof data.total !== 'number' || !Number.isFinite(data.total) || data.total < 0 || !Number.isSafeInteger(Math.round(data.total * 100)) || Math.abs(data.total * 100 - Math.round(data.total * 100)) > 0.00001 ||
      data.currency !== 'inr' ||
      typeof data.displayId !== 'number' || !Number.isSafeInteger(data.displayId) || data.displayId < 1) {
    return json(400, { error: 'Invalid order' })
  }
  const orderNumber = String(data.displayId)
  const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.total)
  const send = async (to: string, role: 'customer' | 'owner', subject: string, text: string) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resend}`, 'content-type': 'application/json', 'Idempotency-Key': `order-${role}/${data.orderId}` },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(8000),
    })
    return response.ok
  }
  if (!await send(owner, 'owner', `BAETEE order ${orderNumber}`, `Order ${orderNumber} was placed.\nCustomer: ${data.email}\nTotal: ${amount}\nView the order in Medusa Admin.`)) {
    return json(502, { error: 'Owner email failed' })
  }
  if (!await send(data.email, 'customer', `BAETEE order ${orderNumber} received`, `Thank you for your BAETEE order ${orderNumber}.\nTotal: ${amount}\nWe will email you with the next update.`)) {
    return json(502, { error: 'Customer email failed' })
  }
  return json(200, { ok: true })
})
