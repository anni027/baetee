// Vercel serverless function: emulates the /_next/image optimizer endpoint.
// Redirects  /_next/image?url=%2Fart%2Ffoo.png&w=...&q=...  ->  /art/foo.png
// so the cloned page's image requests resolve against the static assets.
module.exports = (req, res) => {
  const src = req.query.url;
  if (!src) {
    res.status(400).send('missing url param');
    return;
  }
  let target;
  try {
    target = decodeURIComponent(src);
  } catch {
    target = src;
  }
  // Only allow same-origin absolute paths.
  if (!target.startsWith('/') || target.startsWith('//')) {
    res.status(400).send('invalid url param');
    return;
  }
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.redirect(308, target);
};
