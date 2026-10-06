import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Microfrontend Architecture Demo</h1>
      <p className="home-description">
        This project demonstrates a production-style Microfrontend architecture using{" "}
        <strong>Webpack 5 Module Federation</strong> and <strong>React</strong>.
        The Host container application dynamically loads the Products and Cart microfrontends at runtime
        while maintaining loose coupling through browser Custom Events.
      </p>

      <div className="home-cards">
        <div className="home-card">
          <h3>Products Microfrontend</h3>
          <p>Runs on port 3001. Exposes product list and dispatches <code>cart:add</code> events.</p>
          <Link to="/products" className="home-link">Go to Products →</Link>
        </div>

        <div className="home-card">
          <h3>Cart Microfrontend</h3>
          <p>Runs on port 3002. Listens for cart events, manages state, and persists to localStorage.</p>
          <Link to="/cart" className="home-link">Go to Cart →</Link>
        </div>
      </div>

      <div className="home-info-section">
        <h3>Architecture Overview</h3>
        <table className="info-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Type</th>
              <th>Port</th>
              <th>Exposed / Consumed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Host App</td>
              <td>Container / Shell</td>
              <td>3000</td>
              <td>Consumes <code>products/ProductsList</code> & <code>cart/CartList</code></td>
            </tr>
            <tr>
              <td>Products App</td>
              <td>Remote Microfrontend</td>
              <td>3001</td>
              <td>Exposes <code>./ProductsList</code></td>
            </tr>
            <tr>
              <td>Cart App</td>
              <td>Remote Microfrontend</td>
              <td>3002</td>
              <td>Exposes <code>./CartList</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
