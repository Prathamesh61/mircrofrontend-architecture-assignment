import React from "react";
import RemoteLoader from "../components/RemoteLoader";

const ProductsList = React.lazy(() => import("products/ProductsList"));

const ProductsPage = () => {
  return (
    <div className="page-container">
      <RemoteLoader
        remoteName="Products"
        fallbackText="Loading Products..."
        customMessage="Products service is currently unavailable. Please make sure the remote application is running."
      >
        <ProductsList />
      </RemoteLoader>
    </div>
  );
};

export default ProductsPage;
