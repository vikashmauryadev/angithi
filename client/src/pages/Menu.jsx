import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { RotateCcw } from 'lucide-react';

export default function Menu() {
  const [sp, setSp] = useSearchParams();

  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [q, setQ] = useState(sp.get('search') || '');

  const visibleCount = items.length;
  const hasMore = visibleCount < total;

  const set = (k, v) => {
    const n = new URLSearchParams(sp);

    if (v) {
      n.set(k, v);
    } else {
      n.delete(k);
    }

    n.delete('page');
    setSp(n);
  };

  // Page title + categories
  useEffect(() => {
    document.title = 'Menu – Angithi';

    api('/categories')
      .then(setCats)
      .catch(() => {});
  }, []);

  // Search with small delay
  useEffect(() => {
    const t = setTimeout(() => {
      const currentSearch = sp.get('search') || '';

      if (q !== currentSearch) {
        set('search', q);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [q]);

  // Load first 16 products whenever filters change
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setErr('');
    setItems([]);
    setTotal(0);

    const params = new URLSearchParams(sp);

    // Always start from first page
    params.set('page', '1');
    params.set('limit', '16');

    api(`/products?${params.toString()}`)
      .then((result) => {
        if (cancelled) return;

        setItems(result.items || []);
        setTotal(result.total || 0);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;

        setErr(e.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sp]);

  // Load next 16 products
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setErr('');

    try {
      const nextPage = Math.floor(items.length / 16) + 1;

      const params = new URLSearchParams(sp);
      params.set('page', String(nextPage));
      params.set('limit', '16');

      const result = await api(`/products?${params.toString()}`);

      setItems((previous) => [
        ...previous,
        ...(result.items || [])
      ]);

      setTotal(result.total || 0);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="wrap sec">
      <h1>Menu</h1>

      <div className="filters">
        <input
          aria-label="Search dishes"
          placeholder="Search dishes"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          aria-label="Category"
          value={sp.get('category') || ''}
          onChange={(e) => set('category', e.target.value)}
        >
          <option value="">All categories</option>

          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort"
          value={sp.get('sort') || 'popular'}
          onChange={(e) => set('sort', e.target.value)}
        >
          <option value="popular">Popular</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={sp.get('veg') === 'true'}
            onChange={(e) =>
              set('veg', e.target.checked ? 'true' : '')
            }
          />
          Veg only
        </label>

        <label>
          <input
            type="checkbox"
            checked={sp.get('available') === 'true'}
            onChange={(e) =>
              set('available', e.target.checked ? 'true' : '')
            }
          />
          In stock
        </label>

        <button
          type="button"
          className="clear-filters"
          onClick={() => {
            setQ('');
            setSp({});
          }}
        >
          <RotateCcw size={15} />
          Clear filters
        </button>
      </div>

      {err && (
        <p className="err" role="alert">
          {err}{' '}
          <button
            className="link"
            onClick={() => setSp(new URLSearchParams(sp))}
          >
            Retry
          </button>
        </p>
      )}

      {loading && (
        <div className="grid">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="card skel" />
          ))}
        </div>
      )}

      {!loading && !err && !items.length && (
        <p className="empty">
          No dishes match. Try fewer filters.
        </p>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="grid">
            {items.map((p) => (
              <ProductCard
                key={p._id}
                p={p}
              />
            ))}
          </div>

          {/* Explore More */}
          {hasMore && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 36,
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore
                  ? 'Loading dishes...'
                  : 'Explore More'}
              </button>
            </div>
          )}

          {/* Menu count */}
          <p
            style={{
              textAlign: 'center',
              marginTop: 18,
              opacity: 0.65,
              fontSize: 14,
            }}
          >
            Showing {items.length} of {total} dishes
          </p>
        </>
      )}
    </main>
  );
}