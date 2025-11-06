"use client";

import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../cart.css';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [hasOutOfStockItems, setHasOutOfStockItems] = useState(false);

  // Check if any items are out of stock
  useEffect(() => {
    const outOfStock = cart.some(item => item.stock === 0 || item.quantity > item.stock);
    setHasOutOfStockItems(outOfStock);
  }, [cart]);

  const handleCheckout = () => {
    if (hasOutOfStockItems) {
      toast.error('Please remove or adjust out of stock items before checkout');
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <i className="bx bx-cart" style={{ fontSize: '4rem', color: '#ccc' }}></i>
          <h2>Your Cart is Empty</h2>
          <p>Add some products to your cart to see them here</p>
          <Link href="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart ({getCartCount()} items)</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => {
              const isOutOfStock = item.stock === 0;
              const exceedsStock = item.quantity > item.stock;
              const hasStockIssue = isOutOfStock || exceedsStock;

              return (
                <div 
                  key={`${item.productId}-${item.color}-${item.size}`} 
                  className={`cart-item ${hasStockIssue ? 'stock-warning' : ''}`}
                >
                  <div className="item-image">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover' }}
                    />
                    {hasStockIssue && (
                      <div className="stock-badge">
                        {isOutOfStock ? 'Out of Stock' : 'Limited Stock'}
                      </div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3>{item.name}</h3>
                    {item.color && <p className="item-variant">Color: {item.color}</p>}
                    {item.size && <p className="item-variant">Size: {item.size}</p>}
                    <p className="item-price">${item.price.toFixed(2)}</p>
                    {hasStockIssue && (
                      <p className="stock-warning-text">
                        {isOutOfStock 
                          ? '⚠️ This item is out of stock' 
                          : `⚠️ Only ${item.stock} available`}
                      </p>
                    )}
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)}
                      disabled={item.quantity <= 1}
                      className="qty-btn"
                    >
                      <i className="bx bx-minus"></i>
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                      disabled={item.quantity >= item.stock || isOutOfStock}
                      className="qty-btn"
                    >
                      <i className="bx bx-plus"></i>
                    </button>
                  </div>

                  <div className="item-total">
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.color, item.size)}
                    className="remove-btn"
                    aria-label="Remove item"
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal ({getCartCount()} items)</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span className="total-amount">${getCartTotal().toFixed(2)}</span>
            </div>

            {hasOutOfStockItems && (
              <div className="checkout-warning">
                <i className="bx bx-error-circle"></i>
                <p>Some items are out of stock or exceed available quantity. Please remove or adjust them before checkout.</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="checkout-btn"
              disabled={hasOutOfStockItems}
            >
              Proceed to Checkout
            </button>

            <Link href="/products" className="continue-shopping-link">
              <i className="bx bx-left-arrow-alt"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
