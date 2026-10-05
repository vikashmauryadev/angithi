import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Admin from './pages/Admin.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Checkout from './pages/Checkout.jsx';
import Auth from './pages/Auth.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import { site } from './config/siteConfig.js';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

const NotFound = () => <main className="wrap empty"><h1>That page isn’t on the menu</h1><Link className="btn" to="/menu">Browse the menu</Link></main>;
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (<>
    <Header /><CartDrawer />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/dish/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />
    </Routes>

    <footer className="site-footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <span className="footer-logo-mark">A</span>
            <span>{site.brand.toUpperCase()}</span>
          </a>

          <p className="footer-tagline">{site.tagline}</p>

          <span className="footer-badge">
            Freshly prepared. Always full of flavour.
          </span>
        </div>

        <div className="footer-column">
          <h3>Visit & Hours</h3>

          <p className="footer-detail">
            <span className="footer-label">OPENING HOURS</span>
            {site.hours}
          </p>

          <p className="footer-detail">
            <span className="footer-label">OUR LOCATION</span>
            {site.address}
          </p>

          {site.phone && (
            <p className="footer-detail">
              <span className="footer-label">CONTACT</span>
              {site.phone}
            </p>
          )}
        </div>

        <div className="footer-column">
          <h3>Explore</h3>

          <Link to="/menu" className="footer-link">
            Our Menu <span>↗</span>
          </Link>

          {site.social.instagram && (
            <a
              href={site.social.instagram}
              className="footer-link"
              target="_blank"
              rel="noreferrer"
            >
              Instagram <span>↗</span>
            </a>
          )}

          {site.social.facebook && (
            <a
              href={site.social.facebook}
              className="footer-link"
              target="_blank"
              rel="noreferrer"
            >
              Facebook <span>↗</span>
            </a>
          )}

          {site.developer.github && (
            <a
              href={site.developer.github}
              className="footer-link"
              target="_blank"
              rel="noreferrer"
            >
              Developer GitHub <span>↗</span>
            </a>
          )}
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {site.brand}. All rights reserved.
        </p>

        <p className="footer-credit">
          Crafted with care by <strong>{site.developer.name}</strong>
        </p>
      </div>
    </footer>
  </>);
}
