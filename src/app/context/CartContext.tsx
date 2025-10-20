"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + (item.quantity || 1);
        if (newQuantity > item.stock) {
          toast.error('Cannot add more items than available in stock');
          return prevCart;
        }
        toast.success('Cart updated');
        return prevCart.map((cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      }

      toast.success('Added to cart');
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) =>
        !(item.productId === productId &&
          item.color === color &&
          item.size === size)
      )
    );
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId &&
            item.color === color &&
            item.size === size) {
          if (quantity > item.stock) {
            toast.error('Cannot add more items than available in stock');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
