import React, { useState, useEffect } from "react";
import { products, formatPrice } from "../data/products";
import "../index.css";

const CART_STORAGE_KEY = "microfrontend-cart";

const ProductsList = () => {
  const [cartQuantities, setCartQuantities] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const map = {};
      items.forEach((item) => {
        map[item.id] = Number(item.quantity) || 1;
      });
      return map;
    } catch {
      return {};
    }
  });

  // Keep quantities synchronized with Cart changes across all microfrontends
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        const map = {};
        items.forEach((item) => {
          map[item.id] = Number(item.quantity) || 1;
        });
        setCartQuantities(map);
      } catch {
        setCartQuantities({});
      }
    };

    const handleCartUpdated = (event) => {
      if (event.detail && Array.isArray(event.detail.items)) {
        const map = {};
        event.detail.items.forEach((item) => {
          map[item.id] = Number(item.quantity) || 1;
        });
        setCartQuantities(map);
      } else {
        syncFromStorage();
      }
    };

    window.addEventListener("cart:updated", handleCartUpdated);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const handleAddToCart = (product) => {
    // Add product with quantity 1
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          ...product,
          quantity: 1,
        },
      })
    );
  };

  const handleIncrement = (product) => {
    // Increment product quantity by 1
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          ...product,
          quantity: 1,
        },
      })
    );
  };

  const handleDecrement = (productId) => {
    // Decrement quantity; if goes to 0, item is removed and Add button shows
    window.dispatchEvent(
      new CustomEvent("cart:decrement", {
        detail: productId,
      })
    );
  };

  return (
    <div className="products-container">
      <h2 className="products-heading">Products</h2>

      <div className="products-list">
        {products.map((product) => {
          const qty = cartQuantities[product.id] || 0;

          return (
            <div key={product.id} className="product-item">
              <div className="product-details">
                <span className="product-name">{product.name}</span>
                <span className="product-price">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="product-actions">
                {qty === 0 ? (
                  <button
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="quantity-handler">
                    <button
                      type="button"
                      className="btn-qty"
                      onClick={() => handleDecrement(product.id)}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="btn-qty"
                      onClick={() => handleIncrement(product)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsList;
