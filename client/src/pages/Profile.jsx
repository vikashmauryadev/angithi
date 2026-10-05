import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('angithi_user') || 'null');
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = localStorage.getItem('angithi_token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const result = await api('/auth/me');
        const currentUser = result.user ?? result;

        if (!currentUser || !currentUser.email) {
          throw new Error('Could not load your account details.');
        }

        if (active) {
          setUser(currentUser);

          localStorage.setItem(
            'angithi_user',
            JSON.stringify(currentUser)
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load your profile.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading && !user) {
    return (
      <main className="wrap" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 40,
            textAlign: 'center',
            border: '1px solid #eee',
          }}
        >
          <p style={{ margin: 0, color: '#666' }}>
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="wrap" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <h2>Account unavailable</h2>
          <p style={{ color: '#666' }}>
            Please log in again to view your profile.
          </p>

          <Link className="btn" to="/login">
            Login
          </Link>
        </div>
      </main>
    );
  }

  const initials = (user.name || 'A')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user.role === 'admin';

  return (
    <main
      className="wrap"
      style={{
        maxWidth: 1050,
        paddingTop: 40,
        paddingBottom: 80,
      }}
    >
      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            color: '#a04b24',
            fontWeight: 700,
            letterSpacing: 1.5,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          MY ACCOUNT
        </p>

        <h1
          style={{
            fontSize: 'clamp(30px, 5vw, 42px)',
            margin: 0,
          }}
        >
          Welcome back, {user.name?.split(' ')[0] || 'there'}.
        </h1>

        <p
          style={{
            color: '#666',
            marginTop: 10,
            fontSize: 16,
          }}
        >
          Manage your Angithi account, orders and preferences.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: '#fff1f0',
            color: '#b42318',
            padding: '12px 16px',
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Profile hero */}
      <section
        style={{
          background:
            'linear-gradient(135deg, #fff8ef 0%, #fff 55%, #f8efe7 100%)',
          border: '1px solid #eadfd5',
          borderRadius: 24,
          padding: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
          boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 76,
              height: 76,
              minWidth: 76,
              borderRadius: '50%',
              background: '#a04b24',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
              boxShadow: '0 8px 20px rgba(160,75,36,0.25)',
            }}
          >
            {initials}
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 25,
              }}
            >
              {user.name || 'Angithi Customer'}
            </h2>

            <p
              style={{
                margin: '6px 0',
                color: '#666',
                overflowWrap: 'anywhere',
              }}
            >
              {user.email}
            </p>

            <span
              style={{
                display: 'inline-block',
                marginTop: 5,
                padding: '5px 10px',
                borderRadius: 999,
                background: isAdmin ? '#f4e7dc' : '#eeeae6',
                color: '#7a3b1e',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {isAdmin ? 'Administrator' : 'Customer'}
            </span>
          </div>
        </div>

        <Link className="btn" to="/orders">
          View My Orders
        </Link>
      </section>

      {/* Overview cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 22,
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 22,
          }}
        >
          <div style={{ fontSize: 25, marginBottom: 10 }}>Orders</div>
          <strong style={{ fontSize: 20 }}>My Orders</strong>
          <p style={{ color: '#777', marginBottom: 0 }}>
            Track your restaurant orders.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 22,
          }}
        >
          <div style={{ fontSize: 25, marginBottom: 10 }}>Menu</div>
          <strong style={{ fontSize: 20 }}>Explore Food</strong>
          <p style={{ color: '#777', marginBottom: 0 }}>
            Discover dishes from Angithi.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 22,
          }}
        >
          <div style={{ fontSize: 25, marginBottom: 10 }}>Account</div>
          <strong style={{ fontSize: 20 }}>
            {isAdmin ? 'Admin Account' : 'Active Account'}
          </strong>
          <p style={{ color: '#777', marginBottom: 0 }}>
            Your account is ready to use.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.8fr)',
          gap: 20,
          marginTop: 22,
        }}
      >
        {/* Personal information */}
        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 20,
            padding: 26,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Personal Information</h2>

          <p style={{ color: '#777', marginTop: -4 }}>
            Your account details.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 16,
              marginTop: 22,
            }}
          >
            <div
              style={{
                background: '#fafafa',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <small
                style={{
                  color: '#888',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                FULL NAME
              </small>

              <div style={{ marginTop: 6, fontWeight: 600 }}>
                {user.name || 'Not provided'}
              </div>
            </div>

            <div
              style={{
                background: '#fafafa',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <small
                style={{
                  color: '#888',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                EMAIL ADDRESS
              </small>

              <div
                style={{
                  marginTop: 6,
                  fontWeight: 600,
                  overflowWrap: 'anywhere',
                }}
              >
                {user.email}
              </div>
            </div>

            <div
              style={{
                background: '#fafafa',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <small
                style={{
                  color: '#888',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                ACCOUNT TYPE
              </small>

              <div
                style={{
                  marginTop: 6,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {user.role || 'customer'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 20,
            padding: 26,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Quick Actions</h2>

          <div
            style={{
              display: 'grid',
              gap: 10,
              marginTop: 20,
            }}
          >
            <Link className="btn" to="/orders">
              My Orders
            </Link>

            <Link
              className="btn"
              to="/menu"
              style={{
                background: '#fff',
                color: '#a04b24',
                border: '1px solid #a04b24',
              }}
            >
              Browse Menu
            </Link>

            {isAdmin && (
              <>
                <Link
                  className="btn"
                  to="/admin"
                  style={{
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #ddd',
                  }}
                >
                  Admin Dashboard
                </Link>

                <Link
                  className="btn"
                  to="/admin/orders"
                  style={{
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #ddd',
                  }}
                >
                  Manage Orders
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Security */}
      <section
        style={{
          background: 'white',
          border: '1px solid #eee',
          borderRadius: 20,
          padding: 26,
          marginTop: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Account Security</h2>

        <p style={{ color: '#777' }}>
          Keep your Angithi account secure and manage your access.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 18,
          }}
        >
          <Link className="btn" to="/forgot-password">
            Reset Password
          </Link>

          <Link
            className="btn"
            to="/orders"
            style={{
              background: '#fff',
              color: '#333',
              border: '1px solid #ddd',
            }}
          >
            Order History
          </Link>
        </div>
      </section>
    </main>
  );
}