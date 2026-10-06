import { useState, useEffect } from "react";

const CART_STORAGE_KEY = "microfrontend-cart";

/**
 * Hook to manage live cart count in the Host navbar.
 * Synchronizes with localStorage and listens to browser CustomEvents.
 */
export const useCartCount = () => {
  const [count, setCount] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return 0;
      const items = JSON.parse(raw);
      return Array.isArray(items)
        ? items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
        : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    // 1. Listen for cart:updated events (dispatched by Cart MFE or storage sync)
    const handleCartUpdated = (event) => {
      if (event.detail && typeof event.detail.count === "number") {
        setCount(event.detail.count);
      } else if (event.detail && Array.isArray(event.detail.items)) {
        const total = event.detail.items.reduce(
          (sum, item) => sum + (Number(item.quantity) || 1),
          0
        );
        setCount(total);
      }
    };

    // 2. Handle cart:add when Cart MFE is not currently rendered (e.g. on /products route)
    const handleCartAdd = (event) => {
      // If Cart MFE is active in the page, it handles its own persistence and fires cart:updated
      if (window.__CART_MFE_ACTIVE__) {
        return;
      }

      const product = event.detail;
      if (!product || !product.id) return;

      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        const existingIdx = items.findIndex((item) => item.id === product.id);

        const qtyToAdd = Number(product.quantity) || 1;
        let updated;
        if (existingIdx > -1) {
          updated = items.map((item, idx) =>
            idx === existingIdx
              ? { ...item, quantity: (item.quantity || 1) + qtyToAdd }
              : item
          );
        } else {
          updated = [...items, { ...product, quantity: qtyToAdd }];
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
        const newCount = updated.reduce(
          (sum, item) => sum + (Number(item.quantity) || 1),
          0
        );
        const newTotal = updated.reduce(
          (sum, item) =>
            sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        setCount(newCount);

        // Notify any other listeners that cart has been updated
        window.dispatchEvent(
          new CustomEvent("cart:updated", {
            detail: {
              items: updated,
              count: newCount,
              total: newTotal,
            },
          })
        );
      } catch (err) {
        console.error("[Host] Failed to persist cart item on cart:add:", err);
      }
    };

    // 3. Handle cart:decrement when Cart MFE is not currently rendered
    const handleCartDecrement = (event) => {
      if (window.__CART_MFE_ACTIVE__) return;

      const productId =
        typeof event.detail === "object" ? event.detail.id : event.detail;
      if (!productId) return;

      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        const existingIdx = items.findIndex((item) => item.id === productId);
        if (existingIdx === -1) return;

        let updated;
        const currentQty = Number(items[existingIdx].quantity) || 1;
        if (currentQty > 1) {
          updated = items.map((item, idx) =>
            idx === existingIdx
              ? { ...item, quantity: currentQty - 1 }
              : item
          );
        } else {
          updated = items.filter((item) => item.id !== productId);
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
        const newCount = updated.reduce(
          (sum, item) => sum + (Number(item.quantity) || 1),
          0
        );
        const newTotal = updated.reduce(
          (sum, item) =>
            sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        setCount(newCount);

        window.dispatchEvent(
          new CustomEvent("cart:updated", {
            detail: {
              items: updated,
              count: newCount,
              total: newTotal,
            },
          })
        );
      } catch (err) {
        console.error("[Host] Failed to decrement cart item:", err);
      }
    };

    // 4. Handle cart:remove when Cart MFE is not currently rendered
    const handleCartRemove = (event) => {
      if (window.__CART_MFE_ACTIVE__) return;

      const productId =
        typeof event.detail === "object" ? event.detail.id : event.detail;
      if (!productId) return;

      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        const updated = items.filter((item) => item.id !== productId);

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
        const newCount = updated.reduce(
          (sum, item) => sum + (Number(item.quantity) || 1),
          0
        );
        const newTotal = updated.reduce(
          (sum, item) =>
            sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        setCount(newCount);

        window.dispatchEvent(
          new CustomEvent("cart:updated", {
            detail: {
              items: updated,
              count: newCount,
              total: newTotal,
            },
          })
        );
      } catch (err) {
        console.error("[Host] Failed to remove cart item:", err);
      }
    };

    // 5. Storage event for cross-tab synchronization
    const handleStorage = (event) => {
      if (event.key === CART_STORAGE_KEY) {
        try {
          const items = event.newValue ? JSON.parse(event.newValue) : [];
          const total = items.reduce(
            (sum, item) => sum + (Number(item.quantity) || 1),
            0
          );
          setCount(total);
        } catch {
          setCount(0);
        }
      }
    };

    window.addEventListener("cart:updated", handleCartUpdated);
    window.addEventListener("cart:add", handleCartAdd);
    window.addEventListener("cart:decrement", handleCartDecrement);
    window.addEventListener("cart:remove", handleCartRemove);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
      window.removeEventListener("cart:add", handleCartAdd);
      window.removeEventListener("cart:decrement", handleCartDecrement);
      window.removeEventListener("cart:remove", handleCartRemove);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return count;
};
