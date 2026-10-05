import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';

const STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatStatus(status) {
  return STATUS_LABELS[status] || status || 'Placed';
}

function StatusBadge({ status }) {
  const styles = {
    placed: {
      background: '#fff4df',
      color: '#9a6700',
    },
    confirmed: {
      background: '#eaf4ff',
      color: '#1769aa',
    },
    preparing: {
      background: '#fff0e6',
      color: '#a04b24',
    },
    ready: {
      background: '#edf8ee',
      color: '#27753b',
    },
    out_for_delivery: {
      background: '#f0ecff',
      color: '#6346a8',
    },
    delivered: {
      background: '#e8f7ee',
      color: '#18794e',
    },
    cancelled: {
      background: '#fff0f0',
      color: '#b42318',
    },
  };

  const style = styles[status] || {
    background: '#f1f1f1',
    color: '#555',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  async function checkAccess() {
    try {
      const result = await api('/auth/me');
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setCheckingAccess(false);
    }
  }

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const result = await api('/admin/overview');
      setData(result);
    } catch (err) {
      setError(
        err.message || 'Could not load dashboard.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!checkingAccess && user?.role === 'admin') {
      loadDashboard();
    }
  }, [checkingAccess, user]);

  const stats = data?.stats || {};

  const recentOrders = data?.recentOrders || [];

  const orderStats = useMemo(() => {
    return {
      total: stats.totalOrders ?? 0,
      pending: stats.pendingOrders ?? 0,
      delivered: recentOrders.filter(
        (order) => order.status === 'delivered'
      ).length,
      cancelled: recentOrders.filter(
        (order) => order.status === 'cancelled'
      ).length,
    };
  }, [stats.totalOrders, stats.pendingOrders, recentOrders]);

  if (checkingAccess) {
    return (
      <main
        className="wrap"
        style={{
          paddingTop: 70,
          paddingBottom: 80,
        }}
      >
        <section
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 20,
            padding: 45,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: '#666' }}>
            Checking admin access...
          </p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <main
        className="wrap"
        style={{
          paddingTop: 70,
          paddingBottom: 80,
        }}
      >
        <section
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 20,
            padding: 45,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>
            Access Denied
          </div>

          <h1>Admin access required</h1>

          <p style={{ color: '#666' }}>
            You do not have permission to access the
            Angithi admin dashboard.
          </p>

          <Link className="btn" to="/">
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className="wrap"
      style={{
        maxWidth: 1200,
        paddingTop: 40,
        paddingBottom: 80,
      }}
    >
      {/* Header */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 30,
        }}
      >
        <div>
          <p
            style={{
              color: '#b45d32',
              fontWeight: 800,
              letterSpacing: 2,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            ANGITHI MANAGEMENT
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(30px, 5vw, 44px)',
            }}
          >
            Admin Dashboard
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Welcome back, {user.name || 'Administrator'}.
            Here's your restaurant overview.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <Link
            className="btn"
            to="/menu"
            style={{
              background: '#fff',
              color: '#333',
              border: '1px solid #ddd',
            }}
          >
            View Website
          </Link>

          <button
            type="button"
            className="btn"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section
          style={{
            background: '#fff1f0',
            color: '#b42318',
            border: '1px solid #ffd5d2',
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <strong>Could not load dashboard</strong>

          <p
            style={{
              margin: '8px 0 0',
            }}
          >
            {error}
          </p>
        </section>
      )}

      {/* Loading */}
      {loading && !data && (
        <section
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 20,
            padding: 50,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: '#666' }}>
            Loading dashboard...
          </p>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* Main stats */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
              marginBottom: 22,
            }}
          >
            {/* Revenue */}
            <article
              style={{
                background:
                  'linear-gradient(135deg, #a04b24, #c87545)',
                color: '#fff',
                borderRadius: 20,
                padding: 24,
                minHeight: 145,
                boxShadow:
                  '0 10px 28px rgba(160,75,36,0.18)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  opacity: 0.85,
                }}
              >
                TOTAL REVENUE
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  marginTop: 18,
                }}
              >
                ₹
                {Number(
                  stats.totalRevenue ?? 0
                ).toLocaleString('en-IN')}
              </div>

              <div
                style={{
                  fontSize: 12,
                  marginTop: 8,
                  opacity: 0.8,
                }}
              >
                All recorded orders
              </div>
            </article>

            {/* Orders */}
            <article
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 20,
                padding: 24,
                minHeight: 145,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                TOTAL ORDERS
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  marginTop: 18,
                }}
              >
                {stats.totalOrders ?? 0}
              </div>

              <div
                style={{
                  color: '#888',
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Orders received
              </div>
            </article>

            {/* Pending */}
            <article
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 20,
                padding: 24,
                minHeight: 145,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                PENDING ORDERS
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  marginTop: 18,
                  color: '#a04b24',
                }}
              >
                {stats.pendingOrders ?? 0}
              </div>

              <div
                style={{
                  color: '#888',
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Need attention
              </div>
            </article>

            {/* Products */}
            <article
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 20,
                padding: 24,
                minHeight: 145,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                TOTAL PRODUCTS
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  marginTop: 18,
                }}
              >
                {stats.totalProducts ?? 0}
              </div>

              <div
                style={{
                  color: '#888',
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Items in your menu
              </div>
            </article>
          </section>

          {/* Secondary stats */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ACTIVE
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 25,
                  marginTop: 6,
                  color: '#a04b24',
                }}
              >
                {orderStats.pending}
              </strong>

              <span
                style={{
                  color: '#888',
                  fontSize: 12,
                }}
              >
                Orders in progress
              </span>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                DELIVERED
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 25,
                  marginTop: 6,
                  color: '#18794e',
                }}
              >
                {orderStats.delivered}
              </strong>

              <span
                style={{
                  color: '#888',
                  fontSize: 12,
                }}
              >
                In recent orders
              </span>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                CANCELLED
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 25,
                  marginTop: 6,
                  color: '#b42318',
                }}
              >
                {orderStats.cancelled}
              </strong>

              <span
                style={{
                  color: '#888',
                  fontSize: 12,
                }}
              >
                In recent orders
              </span>
            </div>
          </section>

          {/* Quick actions */}
          <section
            style={{
              background:
                'linear-gradient(135deg, #fff9f4, #fff)',
              border: '1px solid #eee4da',
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0 }}>
                Quick Actions
              </h2>

              <p
                style={{
                  color: '#777',
                  margin: '6px 0 0',
                }}
              >
                Manage your restaurant from one place.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 12,
              }}
            >
              <Link
                className="btn"
                to="/admin/orders"
                style={{
                  textAlign: 'center',
                }}
              >
                Manage Orders
              </Link>

              <Link
                className="btn"
                to="/menu"
                style={{
                  textAlign: 'center',
                  background: '#fff',
                  color: '#a04b24',
                  border: '1px solid #a04b24',
                }}
              >
                View Menu
              </Link>

              <Link
                className="btn"
                to="/"
                style={{
                  textAlign: 'center',
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #ddd',
                }}
              >
                Visit Homepage
              </Link>
            </div>
          </section>

          {/* Recent orders */}
          <section
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 15,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              <div>
                <p
                  style={{
                    color: '#b45d32',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1,
                    margin: '0 0 6px',
                  }}
                >
                  ORDER ACTIVITY
                </p>

                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Recent Orders
                </h2>

                <p
                  style={{
                    color: '#777',
                    margin: '6px 0 0',
                  }}
                >
                  Latest customer activity.
                </p>
              </div>

              <Link
                className="btn"
                to="/admin/orders"
                style={{
                  background: '#fff',
                  color: '#a04b24',
                  border: '1px solid #a04b24',
                }}
              >
                View All Orders
              </Link>
            </div>

            {!recentOrders.length ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '50px 20px',
                  background: '#faf7f3',
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 38,
                    marginBottom: 12,
                  }}
                >
                  No Orders
                </div>

                <h3 style={{ margin: '0 0 8px' }}>
                  No customer orders yet
                </h3>

                <p
                  style={{
                    color: '#777',
                    margin: 0,
                  }}
                >
                  New orders will appear here
                  automatically.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                }}
              >
                {recentOrders.map((order) => {
                  const orderId =
                    order._id || order.id || '';

                  const customer =
                    order.customer?.name ||
                    order.user?.name ||
                    'Customer';

                  const total = Number(
                    order.bill?.total ??
                      order.total ??
                      order.totalAmount ??
                      0
                  );

                  return (
                    <div
                      key={orderId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'minmax(150px, 1fr) minmax(130px, 1fr) auto auto',
                        alignItems: 'center',
                        gap: 15,
                        padding: 16,
                        border: '1px solid #eee',
                        borderRadius: 14,
                      }}
                    >
                      <div>
                        <strong>
                          #
                          {String(orderId)
                            .slice(-6)
                            .toUpperCase()}
                        </strong>

                        <small
                          style={{
                            display: 'block',
                            color: '#888',
                            marginTop: 4,
                          }}
                        >
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleDateString(
                                'en-IN',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )
                            : '—'}
                        </small>
                      </div>

                      <div>
                        <strong>{customer}</strong>

                        <small
                          style={{
                            display: 'block',
                            color: '#888',
                            marginTop: 4,
                          }}
                        >
                          Customer
                        </small>
                      </div>

                      <strong
                        style={{
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ₹
                        {total.toLocaleString(
                          'en-IN'
                        )}
                      </strong>

                      <StatusBadge
                        status={order.status}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}