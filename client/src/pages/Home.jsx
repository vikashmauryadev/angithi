import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { site } from '../config/siteConfig.js';

export default function Home() {
  const [cats, setCats] = useState([]);
  const [best, setBest] = useState([]);
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const [heroDishes, setHeroDishes] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

 useEffect(() => {
  document.title = `${site.brand} – Hearth-cooked food, delivered`;

  Promise.all([
    api('/categories'),
    api('/products?sort=popular&limit=16')
  ])
    .then(([c, p]) => {
      setCats(c);
      setBest(p.items);
    })
    .catch((e) => setErr(e.message));

  api('/products?sort=popular&limit=5')
    .then((data) => {
      setHeroDishes(data.items || []);
    })
    .catch(() => {});
}, []);


useEffect(() => {
  if (heroDishes.length <= 1) return;

  const timer = setInterval(() => {
    setHeroIndex((current) => (current + 1) % heroDishes.length);
  }, 5000);

  return () => clearInterval(timer);
}, [heroDishes.length]);


return (
  <main className="home-page">
      {/* HERO */}
      <section className="hero hero-premium">
        <div className="wrap hero-layout">

          {/* LEFT CONTENT */}
          <div className="hero-content">

            <span className="hero-eyebrow">
              AUTHENTIC • FRESH • HEART-WARMING
            </span>

            <h1>
              Great food,
              <br />
              <span>made with fire.</span>
            </h1>

            <p className="hero-description">
              Cooked over a hearth, packed with flavour and
              delivered while it's warm. Welcome to Angithi.
            </p>

            <form
              className="hsearch hero-search"
              onSubmit={(e) => {
                e.preventDefault();

                const value = e.target.q.value.trim();

                if (value) {
                  nav(`/menu?search=${encodeURIComponent(value)}`);
                } else {
                  nav('/menu');
                }
              }}
            >
              <input
                name="q"
                aria-label="Search by dish or cuisine"
                placeholder="Search dishes, biryani, pizza..."
              />

              <button className="btn" type="submit">
                Search
              </button>
            </form>

            <div className="cta hero-buttons">
              <Link className="btn" to="/menu">
                Order now
              </Link>

              <Link className="btn ghost" to="/menu">
                Explore menu
              </Link>
            </div>

            <div className="hero-stats">

              <div className="hero-stat">
                <strong>60+</strong>
                <span>Dishes</span>
              </div>

              <div className="hero-stat">
                <strong>Fresh</strong>
                <span>Prepared</span>
              </div>

              <div className="hero-stat">
                <strong>Fast</strong>
                <span>Delivery</span>
              </div>

            </div>

          </div>

          {/* RIGHT FOOD CAROUSEL */}
          <div className="hero-food">

            {heroDishes.length > 0 && (
              <div className="hero-food-card">

                <img
                  key={heroDishes[heroIndex]?._id}
                  src={heroDishes[heroIndex]?.image}
                  alt={heroDishes[heroIndex]?.name}
                  className="hero-food-image"
                />

                <div className="hero-fresh-badge">
                  <span>🔥</span>

                  <div>
                    <strong>Made fresh</strong>
                    <small>Just for you</small>
                  </div>
                </div>

                <div className="hero-dish-info">

                  <div className="hero-dish-icon">
                    ★
                  </div>

                  <div className="hero-dish-name">
                    <strong>
                      {heroDishes[heroIndex]?.name}
                    </strong>

                    <small>
                      {heroDishes[heroIndex]?.description}
                    </small>
                  </div>

                  <strong className="hero-dish-price">
                    ₹{heroDishes[heroIndex]?.price}
                  </strong>

                  <Link
                    to="/menu"
                    className="hero-order-btn"
                  >
                    Order now
                  </Link>

                </div>

                {/* DOTS */}
                <div className="hero-dots">
                  {heroDishes.map((dish, index) => (
                    <button
                      key={dish._id}
                      type="button"
                      className={index === heroIndex ? 'active' : ''}
                      onClick={() => setHeroIndex(index)}
                      aria-label={`Show ${dish.name}`}
                    />
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section className="wrap home-section categories-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">EXPLORE</span>
            <h2>What are you craving?</h2>
            <p>Find something delicious for every mood.</p>
          </div>

          <Link to="/menu" className="section-link">
            View all <span>→</span>
          </Link>
        </div>

        <div className="home-categories">
          {cats.map((c) => (
            <Link
              key={c}
              to={`/menu?category=${encodeURIComponent(c)}`}
              className="home-category"
            >
              <span>{c}</span>
              <span className="category-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* MOST ORDERED */}
      <section className="home-section popular-section">
        <div className="wrap">

          <div className="section-heading popular-heading">
            <div>
              <span className="section-eyebrow">CUSTOMER FAVOURITES</span>
              <h2>Most ordered</h2>
              <p>Popular picks from the Angithi kitchen.</p>
            </div>

            <Link to="/menu" className="section-link">
              View full menu <span>→</span>
            </Link>
          </div>

          {err && (
            <p className="err">
              {err}{' '}
              <button
                className="link"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </p>
          )}

          {!err && best.length === 0 && (
            <div className="grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card skel" />
              ))}
            </div>
          )}

          {best.length > 0 && (
            <div className="grid">
              {best.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY ANGITHI */}
      <section className="wrap home-section why-section">
        <div className="why-card">

          <div className="why-intro">
            <span className="section-eyebrow">WHY ANGITHI?</span>
            <h2>Good food should<br />feel special.</h2>
            <p>
              From the first sizzle to the last bite, we focus on
              flavour, freshness and food worth coming back for.
            </p>
          </div>

          <div className="why-features">

            <div className="why-feature">
              <div className="why-icon">♨</div>
              <div>
                <h3>Freshly prepared</h3>
                <p>Every order is prepared with care and attention.</p>
              </div>
            </div>

            <div className="why-feature">
              <div className="why-icon">✦</div>
              <div>
                <h3>Authentic flavours</h3>
                <p>Classic recipes with rich Indian-inspired flavours.</p>
              </div>
            </div>

            <div className="why-feature">
              <div className="why-icon">⚡</div>
              <div>
                <h3>Quick delivery</h3>
                <p>Hot, fresh food delivered straight to your door.</p>
              </div>
            </div>

            <div className="why-feature">
              <div className="why-icon">♥</div>
              <div>
                <h3>Made with care</h3>
                <p>Because the little details make every meal better.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="wrap home-section final-cta-section">
        <div className="final-cta">

          <div>
            <span className="section-eyebrow">YOUR NEXT MEAL AWAITS</span>
            <h2>Hungry already?</h2>
            <p>
              Explore the full Angithi menu and find your next favourite.
            </p>
          </div>

          <Link to="/menu" className="final-cta-button">
            Explore the menu
            <span>→</span>
          </Link>

        </div>
      </section>

    </main>
  );
}