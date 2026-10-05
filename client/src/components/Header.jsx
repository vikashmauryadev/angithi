import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Flame,
  Search,
  ShoppingBag,
  ChevronDown,
  User,
  LogOut,
  Package,
  ShieldCheck,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { site } from '../config/siteConfig.js';

export default function Header() {
  const navigate = useNavigate();
  const { items = [] } = useCart();

  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState('');

  const cartCount = items.reduce(
    (total, item) => total + Number(item.qty || 0),
    0
  );

  useEffect(() => {
    const loadUser = () => {
      try {
        const saved = localStorage.getItem('angithi_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener('angithi-auth-change', loadUser);

    return () => {
      window.removeEventListener('angithi-auth-change', loadUser);
    };
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest('.header-account')) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate('/menu');
      return;
    }

    navigate(`/menu?search=${encodeURIComponent(value)}`);
    setSearch('');
  }

  function logout() {
    localStorage.removeItem('angithi_token');
    localStorage.removeItem('angithi_user');

    setUser(null);
    setAccountOpen(false);

    window.dispatchEvent(new Event('angithi-auth-change'));

    navigate('/');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'V';

  return (
    <header className="site-header">

      <div className="header-inner">

        {/* BRAND */}
        <Link to="/" className="header-brand" aria-label="Angithi Home">

          <div className="brand-mark">
            <Flame size={27} strokeWidth={2.5} />
          </div>

          <div className="brand-text">
            <span className="brand-name">
              {site.brand || 'Angithi'}
            </span>

            <span className="brand-tagline">
              FLAVOURS ON FIRE
            </span>
          </div>

        </Link>

        {/* NAVIGATION */}
        <nav className="main-nav">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `main-nav-link ${isActive ? 'active' : ''}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/menu"
            className={({ isActive }) =>
              `main-nav-link ${isActive ? 'active' : ''}`
            }
          >
            Menu
          </NavLink>

        </nav>

        {/* RIGHT SIDE */}
        <div className="header-actions">

          {/* SEARCH */}
          <form
            className="header-search"
            onSubmit={handleSearch}
          >
            <Search size={18} strokeWidth={2} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, biryani, pizza..."
              aria-label="Search dishes"
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </form>

          {/* ACCOUNT */}
          <div
            className="header-account"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="account-button"
              onClick={() => setAccountOpen((value) => !value)}
              aria-expanded={accountOpen}
            >

              <span className="account-avatar">
                {user ? initials : <User size={17} />}
              </span>

              <span className="account-name">
                {user?.name || 'Account'}
              </span>

              <ChevronDown
                size={16}
                className={accountOpen ? 'account-chevron open' : 'account-chevron'}
              />

            </button>

            {accountOpen && (
              <div className="account-menu">

                {user ? (
                  <>
                    <div className="account-menu-header">

                      <span className="account-menu-avatar">
                        {initials}
                      </span>

                      <div>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </div>

                    </div>

                    <div className="account-menu-divider"></div>

                    <Link
                      to="/profile"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      <User size={17} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      className="account-menu-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Package size={17} />
                      <span>My Orders</span>
                    </Link>

                    {user.role === 'admin' && (
                      <>
                        <div className="account-menu-divider"></div>

                        <Link
                          to="/admin"
                          className="account-menu-item admin-item"
                          onClick={() => setAccountOpen(false)}
                        >
                          <ShieldCheck size={17} />
                          <span>Admin Dashboard</span>
                        </Link>

                        <Link
                          to="/admin/orders"
                          className="account-menu-item admin-item"
                          onClick={() => setAccountOpen(false)}
                        >
                          <Package size={17} />
                          <span>Manage Orders</span>
                        </Link>
                      </>
                    )}

                    <div className="account-menu-divider"></div>

                    <button
                      type="button"
                      className="account-menu-item logout-item"
                      onClick={logout}
                    >
                      <LogOut size={17} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="account-menu-header guest">

                      <span className="account-menu-avatar">
                        <User size={18} />
                      </span>

                      <div>
                        <strong>Welcome to Angithi</strong>
                        <small>Sign in to manage your orders</small>
                      </div>

                    </div>

                    <div className="account-menu-divider"></div>

                    <Link
                      to="/login"
                      className="account-login-button"
                      onClick={() => setAccountOpen(false)}
                    >
                      Login / Sign up
                    </Link>
                  </>
                )}

              </div>
            )}

          </div>

          {/* CART */}
          <Link
            to="/cart"
            className="header-cart"
            aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ''}`}
          >

            <ShoppingBag size={20} strokeWidth={2.2} />

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}

          </Link>

        </div>

      </div>

    </header>
  );
}