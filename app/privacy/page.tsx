import Link from 'next/link';
export default function PrivacyPage(){
  return (
    <div className="policy-page">
      <h1>Privacy</h1>
      <p>This site is a storefront demo. It does not collect personal data beyond what is needed to run the shopping bag.</p>
      <h2>Information we collect</h2>
      <p>Items added to the bag are stored locally in your browser. No account is required.</p>
      <h2>How we use it</h2>
      <p>The bag uses local storage so your selections persist during a session. Nothing is sent to a server.</p>
      <h2>Third parties</h2>
      <p>No analytics, advertising or tracking scripts are included in this demo.</p>
      <Link href="/" className="store-button store-button-light">Return to shop</Link>
    </div>
  );
}
