import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const STATUS_OPTIONS = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

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

function getOrderId(order) {
  return order._id || order.id || '';
}

function getCustomerName(order) {
  return (
    order.user?.name ||
    order.customer?.name ||
    order.shippingAddress?.name ||
    'Customer'
  );
}

function getCustomerEmail(order) {
  return (
    order.user?.email ||
    order.customer?.email ||
    order.shippingAddress?.email ||
    ''
  );
}

function getTotal(order) {
  return Number(
    order.total ??
      order.totalAmount ??
      order.grandTotal ??
      0
  );
}

function getItems(order) {
  return order.items || order.orderItems || order.products || [];
}

function formatDate(order) {
  const value =
    order.createdAt ||
    order.created_at ||
    order.date ||
    order.placedAt;

  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const normalized = status || 'placed';

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

  const style = styles[normalized] || {
    background: '#f1f1f1',
    color: '#555',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {formatStatus(normalized)}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadOrders(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const result = await api('/admin/orders');
      setOrders(result.orders || []);
    } catch (err) {
      setError(err.message || 'Could not load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;

    const delivered = orders.filter(
      (order) => order.status === 'delivered'
    ).length;

    const cancelled = orders.filter(
      (order) => order.status === 'cancelled'
    ).length;

    const active = orders.filter(
      (order) =>
        !['delivered', 'cancelled'].includes(
          order.status || 'placed'
        )
    ).length;

    return {
      total,
      active,
      delivered,
      cancelled,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const id = String(getOrderId(order)).toLowerCase();
      const name = getCustomerName(order).toLowerCase();
      const email = getCustomerEmail(order).toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        name.includes(query) ||
        email.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (order.status || 'placed') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  async function updateStatus(order, newStatus) {
    const orderId = getOrderId(order);

    try {
      await api(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          getOrderId(item) === orderId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      alert(
        err.message ||
          'Could not update order status.'
      );
    }
  }

  return (
    <main
      className="wrap"
      style={{
        maxWidth: 1200,
        paddingTop: 40,
        paddingBottom: 70,
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
          marginBottom: 28,
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
              fontSize: 'clamp(30px, 5vw, 42px)',
            }}
          >
            Order Management
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Monitor customer orders and manage their
            delivery status.
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
            to="/admin"
            style={{
              background: '#fff',
              color: '#333',
              border: '1px solid #ddd',
            }}
          >
            Dashboard
          </Link>

          <button
            type="button"
            className="btn"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Orders'}
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 20,
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
              fontSize: 30,
              fontWeight: 800,
              marginTop: 8,
            }}
          >
            {stats.total}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div
            style={{
              color: '#777',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ACTIVE ORDERS
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 8,
              color: '#a04b24',
            }}
          >
            {stats.active}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div
            style={{
              color: '#777',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            DELIVERED
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 8,
              color: '#18794e',
            }}
          >
            {stats.delivered}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div
            style={{
              color: '#777',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            CANCELLED
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 8,
              color: '#b42318',
            }}
          >
            {stats.cancelled}
          </div>
        </div>
      </section>

      {/* Search / filters */}
      <section
        style={{
          background: 'white',
          border: '1px solid #eee',
          borderRadius: 18,
          padding: 18,
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <input
          type="search"
          placeholder="Search by order ID, customer or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 300px',
            minWidth: 220,
            padding: '12px 14px',
            border: '1px solid #ddd',
            borderRadius: 10,
            fontSize: 14,
            outline: 'none',
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={{
            padding: '12px 14px',
            border: '1px solid #ddd',
            borderRadius: 10,
            background: 'white',
            fontSize: 14,
            minWidth: 180,
          }}
        >
          <option value="all">All Statuses</option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            background: '#fff1f0',
            color: '#b42318',
            border: '1px solid #ffd5d2',
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <section
          style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: 20,
            padding: 45,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: '#666' }}>
            Loading orders...
          </p>
        </section>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        filteredOrders.length === 0 && (
          <section
            style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 20,
              padding: 50,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 40,
                marginBottom: 12,
              }}
            >
              No Orders
            </div>

            <h2 style={{ marginBottom: 8 }}>
              {orders.length === 0
                ? 'No orders yet'
                : 'No matching orders'}
            </h2>

            <p
              style={{
                color: '#666',
                marginBottom: 0,
              }}
            >
              {orders.length === 0
                ? 'Customer orders will appear here when they are placed.'
                : 'Try changing your search or status filter.'}
            </p>
          </section>
        )}

      {/* Orders */}
      {!loading &&
        !error &&
        filteredOrders.length > 0 && (
          <section
            style={{
              display: 'grid',
              gap: 16,
            }}
          >
            {filteredOrders.map((order) => {
              const orderId = getOrderId(order);
              const customerName =
                getCustomerName(order);
              const customerEmail =
                getCustomerEmail(order);
              const total = getTotal(order);
              const items = getItems(order);
              const status = order.status || 'placed';

              return (
                <article
                  key={orderId}
                  style={{
                    background: 'white',
                    border: '1px solid #e9e9e9',
                    borderRadius: 20,
                    padding: 22,
                    boxShadow:
                      '0 5px 20px rgba(0,0,0,0.035)',
                  }}
                >
                  {/* Order top */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            fontSize: 19,
                          }}
                        >
                          Order #
                          {String(orderId).slice(-8)}
                        </h2>

                        <StatusBadge status={status} />
                      </div>

                      <p
                        style={{
                          color: '#777',
                          margin:
                            '7px 0 0',
                          fontSize: 13,
                        }}
                      >
                        {formatDate(order)}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                      }}
                    >
                      <small
                        style={{
                          display: 'block',
                          color: '#888',
                          fontWeight: 700,
                        }}
                      >
                        ORDER TOTAL
                      </small>

                      <strong
                        style={{
                          fontSize: 22,
                        }}
                      >
                        ₹
                        {total.toLocaleString(
                          'en-IN'
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* Customer */}
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 18,
                      borderTop:
                        '1px solid #eee',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {customerName}
                    </div>

                    {customerEmail && (
                      <div
                        style={{
                          color: '#777',
                          fontSize: 13,
                          marginTop: 4,
                          overflowWrap:
                            'anywhere',
                        }}
                      >
                        {customerEmail}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {items.length > 0 && (
                    <div
                      style={{
                        marginTop: 18,
                        background: '#fafafa',
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#888',
                          fontWeight: 800,
                          marginBottom: 8,
                        }}
                      >
                        ORDER ITEMS
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gap: 6,
                        }}
                      >
                        {items
                          .slice(0, 6)
                          .map(
                            (item, index) => {
                              const name =
                                item.name ||
                                item.title ||
                                item.product?.name ||
                                'Item';

                              const quantity =
                                item.quantity ||
                                item.qty ||
                                1;

                              return (
                                <div
                                  key={
                                    item._id ||
                                    item.id ||
                                    index
                                  }
                                  style={{
                                    display:
                                      'flex',
                                    justifyContent:
                                      'space-between',
                                    gap: 10,
                                    fontSize: 14,
                                  }}
                                >
                                  <span>
                                    {name}
                                  </span>

                                  <strong>
                                    ×{quantity}
                                  </strong>
                                </div>
                              );
                            }
                          )}

                        {items.length > 6 && (
                          <small
                            style={{
                              color: '#777',
                              marginTop: 4,
                            }}
                          >
                            +
                            {items.length -
                              6}{' '}
                            more item(s)
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'space-between',
                      gap: 14,
                      flexWrap: 'wrap',
                      marginTop: 20,
                      paddingTop: 18,
                      borderTop:
                        '1px solid #eee',
                    }}
                  >
                    <div>
                      <small
                        style={{
                          display: 'block',
                          color: '#888',
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        UPDATE STATUS
                      </small>

                      <select
                        value={status}
                        onChange={(e) =>
                          updateStatus(
                            order,
                            e.target.value
                          )
                        }
                        style={{
                          minWidth: 210,
                          padding:
                            '10px 12px',
                          border:
                            '1px solid #ddd',
                          borderRadius: 10,
                          background:
                            'white',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_OPTIONS.map(
                          (option) => (
                            <option
                              key={option}
                              value={option}
                            >
                              {formatStatus(
                                option
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      style={{
                        color: '#888',
                        fontSize: 12,
                      }}
                    >
                      Order ID:{' '}
                      {String(orderId)}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
    </main>
  );
}