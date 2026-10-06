export const CART_STORAGE_KEY = "microfrontend-cart";

/**
 * Safely retrieves cart items from localStorage.
 * Handles corrupt JSON or missing storage gracefully.
 */
export const getStoredCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[CartStorage] Failed to parse cart from localStorage, initializing empty:", err);
    return [];
  }
};

/**
 * Persists cart items to localStorage.
 */
export const saveStoredCart = (items) => {
  try {
    const validItems = Array.isArray(items) ? items : [];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validItems));
  } catch (err) {
    console.error("[CartStorage] Failed to save cart to localStorage:", err);
  }
};

/**
 * Computes item count and monetary total for a cart array.
 */
export const calculateCartTotals = (items = []) => {
  const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  return { totalCount, totalPrice };
};

/**
 * Currency formatter for Indian Rupees (₹)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
