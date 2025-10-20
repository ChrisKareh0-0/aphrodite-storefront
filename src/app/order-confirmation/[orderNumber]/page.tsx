"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import '../../order-confirmation.css';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string;
  size?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);

        if (!response.ok) {
          throw new Error('Order not found');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <div className="error-state">
          <i className="bx bx-error-circle"></i>
          <h2>Order Not Found</h2>
          <p>{error || 'We could not find this order.'}</p>
          <Link href="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        <div className="success-header">
          <div className="success-icon">
            <i className="bx bx-check-circle"></i>
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order. We've received your order and will begin processing it shortly.</p>
        </div>

        <div className="order-info-card">
          <div className="order-header">
            <div>
              <h2>Order Details</h2>
              <p className="order-number">Order #{order.orderNumber}</p>
            </div>
            <div className="order-status">
              <span className={`status-badge status-${order.status}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="order-sections">
            <div className="order-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <i className="bx bx-user"></i>
                  <div>
                    <p className="info-label">Name</p>
                    <p className="info-value">{order.customer.name}</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="bx bx-envelope"></i>
                  <div>
                    <p className="info-label">Email</p>
                    <p className="info-value">{order.customer.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="bx bx-phone"></i>
                  <div>
                    <p className="info-label">Phone</p>
                    <p className="info-value">{order.customer.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-section">
              <h3>Shipping Address</h3>
              <div className="address-box">
                <i className="bx bx-map"></i>
                <div>
                  <p>{order.customer.address.street}</p>
                  <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}</p>
                  <p>{order.customer.address.country}</p>
                </div>
              </div>
            </div>

            <div className="order-section">
              <h3>Payment Information</h3>
              <div className="payment-info">
                <div className="info-item">
                  <i className="bx bx-wallet"></i>
                  <div>
                    <p className="info-label">Payment Method</p>
                    <p className="info-value">
                      {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Credit Card'}
                    </p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="bx bx-check-shield"></i>
                  <div>
                    <p className="info-label">Payment Status</p>
                    <p className="info-value">
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-section">
              <h3>Order Items</h3>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <Image
                        src={item.image || '/placeholder-product.svg'}
                        alt={item.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      {item.color && <p>Color: {item.color}</p>}
                      {item.size && <p>Size: {item.size}</p>}
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-section">
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                {order.tax > 0 && (
                  <div className="total-row">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-divider"></div>
                <div className="total-row total-final">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link href="/products" className="continue-shopping-btn">
            <i className="bx bx-store"></i>
            Continue Shopping
          </Link>
          <button onClick={() => window.print()} className="print-btn">
            <i className="bx bx-printer"></i>
            Print Order
          </button>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-grid">
            <div className="step-card">
              <i className="bx bx-envelope"></i>
              <h4>Email Confirmation</h4>
              <p>You'll receive an email confirmation at {order.customer.email}</p>
            </div>
            <div className="step-card">
              <i className="bx bx-package"></i>
              <h4>Order Processing</h4>
              <p>We'll start processing your order within 24 hours</p>
            </div>
            <div className="step-card">
              <i className="bx bx-truck"></i>
              <h4>Shipping Updates</h4>
              <p>Track your order status via email notifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
