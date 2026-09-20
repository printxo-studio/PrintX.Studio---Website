"use client";

import { useState, useEffect } from "react";
import { Product, CartItem, Coupon } from "./types";
import { INITIAL_COUPONS } from "./mock-data";

const CART_STORAGE_KEY = "printxo_cart_v1";
const WISHLIST_STORAGE_KEY = "printxo_wishlist_v1";
const COUPON_STORAGE_KEY = "printxo_coupon_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error("Failed to parse cart storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const syncCartToBos = (cartItems: CartItem[]) => {
    if (typeof window === "undefined" || cartItems.length === 0) return;
    try {
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
        0
      );
      let customer = null;
      try {
        const savedCustomer = localStorage.getItem("printxo_customer_profile");
        if (savedCustomer) customer = JSON.parse(savedCustomer);
      } catch (e) {}

      fetch("/api/sync/cart-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          total: totalAmount,
          customer,
          sessionId: localStorage.getItem("printxo_session_id") || "sess-" + Date.now().toString(36),
        }),
      }).catch(() => {});
    } catch (err) {
      // Background sync non-blocking
    }
  };

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save cart storage", e);
    }
    syncCartToBos(newItems);
  };

  const addItem = (product: Product, quantity = 1, color?: string, notes?: string) => {
    const selectedColor = color || (product.colorOptions.length > 0 ? product.colorOptions[0] : undefined);
    const existingIndex = items.findIndex(
      (item) => item.productId === product.id && item.selectedColor === selectedColor
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        product,
        quantity,
        selectedColor,
        notes,
      };
      updated = [...items, newItem];
    }
    saveItems(updated);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const updated = items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    saveItems(updated);
  };

  const removeItem = (itemId: string) => {
    const updated = items.filter((item) => item.id !== itemId);
    saveItems(updated);
  };

  const clearCart = () => {
    saveItems([]);
    removeCoupon();
  };

  const applyCoupon = (code: string): boolean => {
    setCouponError(null);
    const cleanCode = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === cleanCode && c.isActive);
    if (!found) {
      setCouponError("Invalid or expired coupon code.");
      return false;
    }

    const currentSubtotal = items.reduce(
      (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
      0
    );

    if (currentSubtotal < found.minOrderValue) {
      setCouponError(`Requires a minimum cart value of ₹${found.minOrderValue}.`);
      return false;
    }

    setCoupon(found);
    try {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      console.error("Failed to save coupon", e);
    }
    return true;
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear coupon", e);
    }
  };

  // Financial calculations (INR)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );

  let discount = 0;
  if (coupon) {
    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.value, subtotal);
    }
  }

  // Free shipping over ₹1499, else flat ₹149
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 149;
  const tax = Math.round((subtotal - discount) * 0.18); // 18% GST
  const total = Math.max(0, subtotal - discount + shipping + tax);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalItemsCount,
    isLoaded,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    couponError,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to read wishlist", e);
    }
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save wishlist", e);
      }
      return updated;
    });
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return {
    wishlistIds,
    toggleWishlist,
    isWishlisted,
  };
}
