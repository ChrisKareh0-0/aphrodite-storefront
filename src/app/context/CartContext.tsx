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
    console.log('🛍️ Adding to cart:', {
      productId: item.productId,
      name: item.name,
      quantity: item.quantity || 1,
      color: item.color,
      size: item.size
    });

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
          console.warn('⚠️ Cannot add more items than available in stock', {
            requested: newQuantity,
            available: item.stock
          });
          toast.error('Cannot add more items than available in stock');
          return prevCart;
        }
        console.log('✅ Updated existing cart item quantity', {
          productId: item.productId,
          oldQuantity: existingItem.quantity,
          newQuantity
        });
        toast.success('Cart updated');
        return prevCart.map((cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      }

      console.log('✅ Added new item to cart');
      toast.success('Added to cart');
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    console.log('🗑️ Removing from cart:', { productId, color, size });
    setCart((prevCart) => {
      const itemToRemove = prevCart.find(item => 
        item.productId === productId &&
        item.color === color &&
        item.size === size
      );
      if (itemToRemove) {
        console.log('✅ Removing item:', {
          name: itemToRemove.name,
          quantity: itemToRemove.quantity,
          price: itemToRemove.price
        });
      }
      return prevCart.filter((item) =>
        !(item.productId === productId &&
          item.color === color &&
          item.size === size)
      );
    });
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity < 1) {
      console.warn('⚠️ Invalid quantity update request:', { productId, quantity });
      return;
    }

    console.log('🔄 Updating cart item quantity:', { productId, newQuantity: quantity, color, size });
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId &&
            item.color === color &&
            item.size === size) {
          if (quantity > item.stock) {
            console.warn('⚠️ Cannot update: quantity exceeds stock', {
              requested: quantity,
              available: item.stock
            });
            toast.error('Cannot add more items than available in stock');
            return item;
          }
          console.log('✅ Updated quantity:', {
            name: item.name,
            oldQuantity: item.quantity,
            newQuantity: quantity
          });
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
