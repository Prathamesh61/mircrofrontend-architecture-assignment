import { useState, useEffect, useCallback } from "react";
import {
  getStoredCart,
  saveStoredCart,
  calculateCartTotals,
} from "../utils/cartStorage";

export const useCart = () => {
  const [cartItems, setCartItems] = useState(() => getStoredCart());

  // Broadcast cart changes across all microfrontends & host
  const broadcastCartUpdated = useCallback((items) => {
    const { totalCount, totalPrice } = calculateCartTotals(items);
    window.dispatchEvent(
      new CustomEvent("cart:updated", {
        detail: {
          items,
          count: totalCount,
          total: totalPrice,
        },
      })
    );
  }, []);

  // Update state and persistence
  const updateCart = useCallback(
    (newItems) => {
      setCartItems(newItems);
      saveStoredCart(newItems);
      broadcastCartUpdated(newItems);
    },
    [broadcastCartUpdated]
  );

  // Add or increment item
  const addItem = useCallback(
    (product) => {
      if (!product || !product.id) return;
      const qtyToAdd = Number(product.quantity) || 1;
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === product.id);
        let updated;
        if (existingIndex > -1) {
          updated = prev.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: (item.quantity || 1) + qtyToAdd }
              : item
          );
        } else {
          updated = [...prev, { ...product, quantity: qtyToAdd }];
        }
        saveStoredCart(updated);
        broadcastCartUpdated(updated);
        return updated;
      });
    },
    [broadcastCartUpdated]
  );

  // Remove item by id
  const removeItem = useCallback(
    (productId) => {
      setCartItems((prev) => {
        const updated = prev.filter((item) => item.id !== productId);
        saveStoredCart(updated);
        broadcastCartUpdated(updated);
        return updated;
      });
    },
    [broadcastCartUpdated]
  );

  // Change quantity (+ / -)
  const updateQuantity = useCallback(
    (productId, delta) => {
      setCartItems((prev) => {
        const updated = prev
          .map((item) => {
            if (item.id === productId) {
              const newQty = (item.quantity || 1) + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean);

        saveStoredCart(updated);
        broadcastCartUpdated(updated);
        return updated;
      });
    },
    [broadcastCartUpdated]
  );

  // Clear all items
  const clearCart = useCallback(() => {
    updateCart([]);
  }, [updateCart]);

  // Listen to browser CustomEvents ("cart:add", "cart:remove", "cart:updated", "storage")
  useEffect(() => {
    // Flag indicating the Cart MFE hook is active in window
    window.__CART_MFE_ACTIVE__ = true;

    const handleCartAdd = (event) => {
      if (event.detail) {
        addItem(event.detail);
      }
    };

    const handleCartRemove = (event) => {
      if (event.detail !== undefined) {
        // Can be either productId directly or { id: productId }
        const idToRemove =
          typeof event.detail === "object" ? event.detail.id : event.detail;
        removeItem(idToRemove);
      }
    };

    const handleCartDecrement = (event) => {
      if (event.detail !== undefined) {
        const idToDec =
          typeof event.detail === "object" ? event.detail.id : event.detail;
        updateQuantity(idToDec, -1);
      }
    };

    const handleCartUpdated = (event) => {
      // Sync in case another tab or component fired cart:updated
      if (event.detail && Array.isArray(event.detail.items)) {
        setCartItems(event.detail.items);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === "microfrontend-cart") {
        const fresh = getStoredCart();
        setCartItems(fresh);
      }
    };

    window.addEventListener("cart:add", handleCartAdd);
    window.addEventListener("cart:remove", handleCartRemove);
    window.addEventListener("cart:decrement", handleCartDecrement);
    window.addEventListener("cart:updated", handleCartUpdated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.__CART_MFE_ACTIVE__ = false;
      window.removeEventListener("cart:add", handleCartAdd);
      window.removeEventListener("cart:remove", handleCartRemove);
      window.removeEventListener("cart:decrement", handleCartDecrement);
      window.removeEventListener("cart:updated", handleCartUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [addItem, removeItem]);

  const { totalCount, totalPrice } = calculateCartTotals(cartItems);

  return {
    cartItems,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};
