import React from "react";
import RemoteLoader from "../components/RemoteLoader";

const CartList = React.lazy(() => import("cart/CartList"));

const CartPage = () => {
  return (
    <div className="page-container">
      <RemoteLoader
        remoteName="Cart"
        fallbackText="Loading Cart..."
        customMessage="Cart service is currently unavailable. Please make sure the remote application is running."
      >
        <CartList />
      </RemoteLoader>
    </div>
  );
};

export default CartPage;
