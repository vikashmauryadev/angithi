import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { jsPDF } from 'jspdf';

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
        padding: '7px 11px',
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

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadOrders(isRefresh = false) {
    if (!localStorage.getItem('angithi_token')) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const result = await api('/orders/me');

      const list = Array.isArray(result)
        ? result
        : result.orders ?? [];

      setOrders(list);
    } catch (err) {
      setError(
        err.message || 'Unable to load your orders.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      if (!localStorage.getItem('angithi_token')) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const result = await api('/orders/me');

        const list = Array.isArray(result)
          ? result
          : result.orders ?? [];

        if (active) {
          setOrders(list);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'Unable to load your orders.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      active = false;
    };
  }, [navigate]);

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

    const totalSpent = orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.bill?.total ??
            order.total ??
            order.totalAmount ??
            0
        ),
      0
    );

    return {
      total,
      delivered,
      cancelled,
      active,
      totalSpent,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const id = String(
        order._id || order.id || ''
      ).toLowerCase();

      const status = (
        order.status || 'placed'
      ).toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        status.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const downloadBill = (order) => {
    const doc = new jsPDF();

    const bill = order.bill || {};
    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const orderId = String(
      order._id || order.id || 'N/A'
    );

    const shortId = orderId.slice(-8);

    const customer = order.customer || {};

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString(
          'en-IN'
        )
      : 'Date unavailable';

    const money = (value) =>
      `Rs. ${Number(value || 0).toFixed(2)}`;

    const subtotal = Number(
      bill.subtotal ??
        items.reduce((sum, item) => {
          const qty = Number(
            item.qty ?? item.quantity ?? 1
          );

          const price = Number(
            item.price || 0
          );

          const addons = (
            item.addons || []
          ).reduce(
            (total, addon) =>
              total +
              Number(addon.price || 0),
            0
          );

          return (
            sum +
            (price + addons) * qty
          );
        }, 0)
    );

    const discount = Number(
      bill.discount || 0
    );

    const delivery = Number(
      bill.delivery || 0
    );

    const tax = Number(
      bill.tax || 0
    );

    const total = Number(
      bill.total ??
        order.total ??
        order.totalAmount ??
        subtotal -
          discount +
          delivery +
          tax
    );

    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ANGITHI', 14, y);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Restaurant Invoice / Bill',
      14,
      y + 8
    );

    doc.setDrawColor(200);
    doc.line(
      14,
      y + 14,
      196,
      y + 14
    );

    y += 25;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    doc.text(
      `Order ID: ${shortId}`,
      14,
      y
    );

    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(
      `Order Date: ${orderDate}`,
      14,
      y
    );

    y += 8;

    doc.setFont('helvetica', 'bold');

    doc.text(
      'Customer Details',
      14,
      y
    );

    y += 7;

    doc.setFont('helvetica', 'normal');

    doc.text(
      `Name: ${
        customer.name || 'Customer'
      }`,
      14,
      y
    );

    y += 6;

    if (customer.phone) {
      doc.text(
        `Phone: ${customer.phone}`,
        14,
        y
      );

      y += 6;
    }

    if (customer.address) {
      const addressLines =
        doc.splitTextToSize(
          `Address: ${customer.address}`,
          175
        );

      doc.text(
        addressLines,
        14,
        y
      );

      y +=
        addressLines.length * 5 +
        2;
    }

    y += 5;

    doc.setFont('helvetica', 'bold');

    doc.text(
      'Order Items',
      14,
      y
    );

    y += 8;

    doc.setFillColor(
      245,
      240,
      232
    );

    doc.rect(
      14,
      y - 5,
      182,
      9,
      'F'
    );

    doc.setFontSize(9);

    doc.text('Dish', 16, y);
    doc.text('Qty', 115, y);
    doc.text('Price', 137, y);
    doc.text(
      'Amount',
      170,
      y
    );

    y += 10;

    doc.setFont(
      'helvetica',
      'normal'
    );

    items.forEach((item) => {
      const qty = Number(
        item.qty ??
          item.quantity ??
          1
      );

      const price = Number(
        item.price || 0
      );

      const addons = (
        item.addons || []
      ).reduce(
        (sum, addon) =>
          sum +
          Number(
            addon.price || 0
          ),
        0
      );

      const unitPrice =
        price + addons;

      const amount =
        unitPrice * qty;

      const nameLines =
        doc.splitTextToSize(
          item.name ||
            item.title ||
            'Menu item',
          90
        );

      if (
        y +
          Math.max(
            8,
            nameLines.length * 5
          ) >
        265
      ) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        nameLines,
        16,
        y
      );

      doc.text(
        String(qty),
        115,
        y
      );

      doc.text(
        unitPrice.toFixed(2),
        137,
        y
      );

      doc.text(
        amount.toFixed(2),
        170,
        y
      );

      y += Math.max(
        8,
        nameLines.length * 5
      );

      doc.setDrawColor(230);

      doc.line(
        14,
        y - 2,
        196,
        y - 2
      );
    });

    y += 8;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.text(
      `Subtotal: ${money(
        bill.subtotal ??
          subtotal
      )}`,
      135,
      y
    );

    y += 7;

    doc.text(
      `Discount: -${money(
        discount
      )}`,
      135,
      y
    );

    y += 7;

    doc.text(
      `Delivery: ${money(
        delivery
      )}`,
      135,
      y
    );

    y += 7;

    doc.text(
      `Tax: ${money(tax)}`,
      135,
      y
    );

    y += 9;

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(13);

    doc.text(
      `TOTAL: ${money(total)}`,
      135,
      y
    );

    y += 12;

    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(10);

    doc.text(
      `Payment: ${
        (
          order.payment ||
          'COD'
        ).toUpperCase()
      }`,
      14,
      y
    );

    y += 7;

    doc.text(
      `Status: ${
        order.status ||
        'Placed'
      }`,
      14,
      y
    );

    y += 12;

    doc.setFontSize(10);

    doc.text(
      'Thank you for ordering from Angithi!',
      105,
      y,
      {
        align: 'center',
      }
    );

    doc.save(
      `Angithi-Bill-${shortId}.pdf`
    );
  };

  return (
    <main
      className="wrap"
      style={{
        maxWidth: 1100,
        paddingTop: 40,
        paddingBottom: 80,
      }}
    >
      {/* Header */}
      <section
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-end',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <div>
          <p
            style={{
              color: '#a04b24',
              fontWeight: 800,
              letterSpacing: 2,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            YOUR ACCOUNT
          </p>

          <h1
            style={{
              margin: 0,
              fontSize:
                'clamp(30px, 5vw, 44px)',
            }}
          >
            My Orders
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Track your Angithi orders
            and download your bills.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() =>
            loadOrders(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? 'Refreshing...'
            : 'Refresh Orders'}
        </button>
      </section>

      {/* Error */}
      {error && (
        <section
          role="alert"
          style={{
            background: '#fff1f0',
            color: '#b42318',
            border:
              '1px solid #ffd5d2',
            borderRadius: 16,
            padding: 16,
            marginBottom: 22,
          }}
        >
          {error}
        </section>
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
          <p
            style={{
              margin: 0,
              color: '#666',
            }}
          >
            Loading your orders...
          </p>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* Statistics */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 14,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #eee',
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                TOTAL ORDERS
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 30,
                  marginTop: 8,
                }}
              >
                {stats.total}
              </strong>
            </div>

            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #eee',
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ACTIVE
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 30,
                  marginTop: 8,
                  color: '#a04b24',
                }}
              >
                {stats.active}
              </strong>
            </div>

            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #eee',
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                DELIVERED
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 30,
                  marginTop: 8,
                  color: '#18794e',
                }}
              >
                {stats.delivered}
              </strong>
            </div>

            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #eee',
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: '#777',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                TOTAL SPENT
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: 25,
                  marginTop: 10,
                }}
              >
                ₹
                {stats.totalSpent.toLocaleString(
                  'en-IN'
                )}
              </strong>
            </div>
          </section>

          {/* Search and filter */}
          {orders.length > 0 && (
            <section
              style={{
                background: '#fff',
                border:
                  '1px solid #eee',
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
                placeholder="Search by order ID or status..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                style={{
                  flex:
                    '1 1 300px',
                  minWidth: 220,
                  padding:
                    '12px 14px',
                  border:
                    '1px solid #ddd',
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none',
                }}
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={{
                  minWidth: 180,
                  padding:
                    '12px 14px',
                  border:
                    '1px solid #ddd',
                  borderRadius: 10,
                  background:
                    'white',
                  fontSize: 14,
                }}
              >
                <option value="all">
                  All Orders
                </option>

                {Object.keys(
                  STATUS_LABELS
                ).map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {STATUS_LABELS[
                      status
                    ]}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* Empty state */}
          {orders.length === 0 && (
            <section
              style={{
                background: '#fff',
                border:
                  '1px solid #eee',
                borderRadius: 22,
                padding:
                  '60px 25px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  marginBottom: 12,
                }}
              >
                Your Orders
              </div>

              <h2>
                No orders yet
              </h2>

              <p
                style={{
                  color: '#666',
                  maxWidth: 480,
                  margin:
                    '0 auto 22px',
                }}
              >
                You haven't placed
                any orders yet.
                Explore the Angithi
                menu and discover
                something delicious.
              </p>

              <Link
                className="btn"
                to="/menu"
              >
                Explore Menu
              </Link>
            </section>
          )}

          {/* No search results */}
          {orders.length > 0 &&
            filteredOrders.length ===
              0 && (
              <section
                style={{
                  background: '#fff',
                  border:
                    '1px solid #eee',
                  borderRadius: 20,
                  padding: 45,
                  textAlign:
                    'center',
                }}
              >
                <h2>
                  No matching
                  orders
                </h2>

                <p
                  style={{
                    color: '#777',
                  }}
                >
                  Try another
                  search or status
                  filter.
                </p>
              </section>
            )}

          {/* Orders */}
          {filteredOrders.length >
            0 && (
            <section
              style={{
                display: 'grid',
                gap: 16,
              }}
            >
              {filteredOrders.map(
                (order) => {
                  const orderId =
                    order._id ||
                    order.id ||
                    '';

                  const shortId =
                    String(
                      orderId
                    ).slice(-8);

                  const items =
                    Array.isArray(
                      order.items
                    )
                      ? order.items
                      : [];

                  const total =
                    Number(
                      order.bill
                        ?.total ??
                        order.total ??
                        order.totalAmount ??
                        0
                    );

                  return (
                    <article
                      key={orderId}
                      style={{
                        background:
                          '#fff',
                        border:
                          '1px solid #e9e9e9',
                        borderRadius:
                          20,
                        padding: 22,
                        boxShadow:
                          '0 5px 20px rgba(0,0,0,0.035)',
                      }}
                    >
                      {/* Order header */}
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          gap: 16,
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: 10,
                              flexWrap:
                                'wrap',
                            }}
                          >
                            <h2
                              style={{
                                margin: 0,
                                fontSize:
                                  19,
                              }}
                            >
                              Order #
                              {
                                shortId
                              }
                            </h2>

                            <StatusBadge
                              status={
                                order.status
                              }
                            />
                          </div>

                          <p
                            style={{
                              color:
                                '#777',
                              margin:
                                '7px 0 0',
                              fontSize:
                                13,
                            }}
                          >
                            {order.createdAt
                              ? new Date(
                                  order.createdAt
                                ).toLocaleString(
                                  'en-IN'
                                )
                              : 'Date unavailable'}
                          </p>
                        </div>

                        <div
                          style={{
                            textAlign:
                              'right',
                          }}
                        >
                          <small
                            style={{
                              display:
                                'block',
                              color:
                                '#888',
                              fontWeight:
                                700,
                            }}
                          >
                            TOTAL
                          </small>

                          <strong
                            style={{
                              fontSize:
                                23,
                            }}
                          >
                            ₹
                            {total.toLocaleString(
                              'en-IN',
                              {
                                minimumFractionDigits:
                                  2,
                                maximumFractionDigits:
                                  2,
                              }
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* Items */}
                      {items.length >
                        0 && (
                        <div
                          style={{
                            marginTop:
                              20,
                            background:
                              '#fafafa',
                            borderRadius:
                              14,
                            padding:
                              16,
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                12,
                              color:
                                '#888',
                              fontWeight:
                                800,
                              marginBottom:
                                10,
                              letterSpacing:
                                0.5,
                            }}
                          >
                            ORDER ITEMS
                          </div>

                          <div
                            style={{
                              display:
                                'grid',
                              gap: 8,
                            }}
                          >
                            {items.map(
                              (
                                item,
                                index
                              ) => (
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
                                    gap: 12,
                                    fontSize:
                                      14,
                                  }}
                                >
                                  <span>
                                    {item.name ||
                                      item.title ||
                                      'Menu item'}
                                  </span>

                                  <strong>
                                    ×
                                    {item.quantity ??
                                      item.qty ??
                                      1}
                                  </strong>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: 14,
                          flexWrap:
                            'wrap',
                          marginTop:
                            20,
                          paddingTop:
                            18,
                          borderTop:
                            '1px solid #eee',
                        }}
                      >
                        <div
                          style={{
                            color:
                              '#777',
                            fontSize:
                              13,
                          }}
                        >
                          Payment:{' '}
                          <strong
                            style={{
                              color:
                                '#333',
                            }}
                          >
                            {(
                              order.payment ||
                              'COD'
                            ).toUpperCase()}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            downloadBill(
                              order
                            )
                          }
                        >
                          Download PDF Bill
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          )}

          {/* Bottom navigation */}
          <div
            style={{
              marginTop: 26,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link
              className="btn"
              to="/profile"
              style={{
                background: '#fff',
                color: '#333',
                border:
                  '1px solid #ddd',
              }}
            >
              My Profile
            </Link>

            <Link
              className="btn"
              to="/menu"
            >
              Browse Menu
            </Link>
          </div>
        </>
      )}
    </main>
  );
}