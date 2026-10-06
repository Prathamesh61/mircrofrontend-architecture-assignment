import React from "react";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/cartStorage";
import "../index.css";

const CartList = () => {
  const { cartItems, totalPrice, totalCount, updateQuantity, removeItem } =
    useCart();

  const handleRemove = (productId) => {
    // Dispatch cart:remove event
    window.dispatchEvent(
      new CustomEvent("cart:remove", {
        detail: productId,
      })
    );
  };

  return (
    <div className="cart-container">
      <h2 className="cart-heading">Cart</h2>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p className="cart-empty-title">Your cart is empty.</p>
          <p className="cart-empty-subtitle">
            Add products from the Products page.
          </p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => {
              const qty = item.quantity || 1;
              const subtotal = item.price * qty;

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-main">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-unit-price">
                      {formatCurrency(item.price)} each
                    </span>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-handler">
                      <button
                        type="button"
                        className="btn-qty"
                        onClick={() => updateQuantity(item.id, -1)}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{qty}</span>
                      <button
                        type="button"
                        className="btn-qty"
                        onClick={() => updateQuantity(item.id, 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item-subtotal">
                      {formatCurrency(subtotal)}
                    </span>

                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-total-section">
            <span className="cart-total-label">
              Total ({totalCount} {totalCount === 1 ? "item" : "items"}):
            </span>
            <span className="cart-total-value">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartList;
