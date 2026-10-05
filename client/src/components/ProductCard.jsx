
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../config/siteConfig.js';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [p.image]);

  const showImage = Boolean(p.image) && !imageFailed;

  return (
    <article className={`card ${p.available ? '' : 'off'}`}>
      <Link
        to={`/dish/${p._id}`}
        className={`pic ${showImage ? 'has-image' : 'no-image'}`}
        aria-label={`View ${p.name} details`}
      >
        {showImage && (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}

        {!showImage && (
          <span className="image-fallback" aria-hidden="true">
            {(p.name || 'A').charAt(0).toUpperCase()}
          </span>
        )}

        {p.bestseller && <em className="tag">Bestseller</em>}

        {!p.available && (
          <span className="sold-out-tag">Currently unavailable</span>
        )}
      </Link>

      <div className="body">
        <h3>
          <i
            className={`dot ${p.veg ? 'v' : 'n'}`}
            title={p.veg ? 'Vegetarian' : 'Non-vegetarian'}
            aria-label={p.veg ? 'Vegetarian' : 'Non-vegetarian'}
          />
          <span>{p.name}</span>
        </h3>

        <p>{p.description}</p>

        <div className="row">
          <strong className="product-price">{money(p.price)}</strong>

          {p.available ? (
            <button
              className="btn sm add-btn"
              onClick={() =>
                add({
                  id: p._id,
                  name: p.name,
                  price: p.price,
                  qty: 1,
                  addons: [],
                })
              }
              aria-label={`Add ${p.name} to cart`}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add
            </button>
          ) : (
            <span className="muted sold-out-text">Sold out today</span>
          )}
        </div>
      </div>
    </article>
  );
}