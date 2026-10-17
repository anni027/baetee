import Link from 'next/link';
export default function CookiesPage(){
  return (
    <div className="policy-page">
      <h1>Cookies</h1>
      <p>We use cookies to keep the shopping bag working and to understand how the site is used.</p>
      <h2>What we store</h2>
      <p>A small identifier in your browser so your bag items persist between visits. No payment details are stored.</p>
      <h2>How to control them</h2>
      <p>You can disable cookies in your browser settings. The shopping bag will not work without them.</p>
      <Link href="/privacy" className="store-button store-button-light">Privacy policy</Link>
    </div>
  );
}
