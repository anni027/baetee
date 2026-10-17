import { notFound } from 'next/navigation';
import { tees } from '@/lib/catalog';

export async function generateStaticParams() {
  return tees.map((p) => ({
    kind: 'tee',
    id: p.id.toString(),
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  const product = tees.find(
    (p) => p.id.toString() === id
  );

  if (!product) notFound();

  return (
    <div className="product-page">
      <div className="product-layout">
        <div className="product-visual product-visual-tee">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="product-details">
          <div className="product-breadcrumb">
            <a href="/">Shop</a>
            <span>/</span>
            <span>Tee's</span>
            <span>/</span>
            <span>{product.painting}</span>
          </div>
          <ProductDetails product={product} />
        </div>
      </div>
    </div>
  );
}

function ProductDetails({ product }: { product: (typeof tees)[0] }) {
  return (
    <>
      <h1>{product.painting}</h1>
      <p className="product-description">{product.manifestation}</p>
      <div className="product-price">
        ₹{product.price}
        <small>Includes shipping in India</small>
      </div>
      <div className="product-size">
        <label htmlFor="size">Size</label>
        <select id="size" className="store-select store-select-options">
          <option>XS</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
          <option>XXL</option>
        </select>
      </div>
      <button className="store-button product-add" disabled>
        Add to bag
      </button>
      <div className="product-art-story">
        <h2>The artwork</h2>
        <p>{product.manifestation}</p>
      </div>
      <div className="product-brand-story">
        <h2>The brand</h2>
        <img
          className="product-brand-logo"
          src="/brand/baetee-ribbon-logo.svg"
          alt="BAETEE"
        />
        <p>BAETEE is a small studio from India. Each tee is hand-painted and signed.</p>
        <p className="product-brand-culture">
          The work leans into quiet garden moments: petals after rain, roots before roses,
          a door made of petals opening into light.
        </p>
        <p className="product-brand-dedication">Every piece begins with a scene kept in a sketchbook.</p>
      </div>
    </>
  );
}
