import Link from 'next/link';
export default function CheckoutPage(){
  return (
    <div className="bag-page">
      <div className="bag-empty">
        <h2>Checkout is not ready yet</h2>
        <p>Payment checkout is disabled. No payment provider, order database or webhook is configured.</p>
        <Link href="/" className="store-button">Return to shop</Link>
      </div>
    </div>
  );
}
